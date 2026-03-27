"use server";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Provider 1: Groq — primary, 14,400 req/day free, very fast
const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

// Provider 2: OpenRouter — secondary fallback, ~50 req/day free
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

// Provider 3: Google Gemini — final guaranteed fallback
const gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || "");

async function chatWithFallback(
  messages: OpenAI.ChatCompletionMessageParam[]
): Promise<string> {
  // 1. Try Groq (most generous free tier)
  if (process.env.GROQ_API_KEY) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
      });
      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (e: unknown) {
      console.warn("Groq failed, trying OpenRouter...", e instanceof Error ? e.message : e);
    }
  }

  // 2. Try OpenRouter free models
  if (process.env.OPENROUTER_API_KEY) {
    const openrouterModels = [
      "google/gemma-3-27b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
    ];
    for (const model of openrouterModels) {
      try {
        const completion = await openrouter.chat.completions.create({
          model,
          messages,
        });
        return completion.choices[0]?.message?.content?.trim() || "";
      } catch (e: unknown) {
        console.warn(`OpenRouter ${model} failed...`, e instanceof Error ? e.message : e);
        continue;
      }
    }
  }

  // 3. Final fallback: Google Gemini
  if (process.env.GOOGLE_AI_KEY) {
    console.warn("All other providers failed, falling back to Gemini...");
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = messages.map((m) => m.content).join("\n\n");
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }

  throw new Error("All AI providers unavailable. Please try again later.");
}

export async function createInterview(params: CreateInterviewParams) {
  const { role, level, techstack, type, mode, userId } = params;

  try {
    const questionCount = mode === "voice" ? 5 : 8;
    const prompt = `Generate ${questionCount} interview questions for a ${level} ${role} position.
The interview type is: ${type}.
Tech stack: ${techstack.join(", ")}.

${type === "Technical" ? "Focus on technical concepts, coding problems, system design, and practical implementation questions." : ""}
${type === "Behavioral" ? "Focus on behavioral questions using STAR method scenarios, leadership, teamwork, conflict resolution, and situational judgment." : ""}
${type === "Mixed" ? "Include a mix of technical and behavioral questions. Start with behavioral, then move to technical." : ""}

Return ONLY a JSON array of strings, no markdown, no explanation. Example: ["Question 1?", "Question 2?"]`;

    const text = await chatWithFallback([{ role: "user", content: prompt }]);
    const cleanText = (text || "[]").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const questions: string[] = JSON.parse(cleanText);

    // Save to Firestore
    const interviewRef = await db.collection("interviews").add({
      role,
      level,
      questions,
      techstack,
      type,
      mode,
      userId,
      finalized: false,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      interviewId: interviewRef.id,
    };
  } catch (e: unknown) {
    console.error("Error creating interview:", e);
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to create interview",
    };
  }
}

export async function getInterviewById(
  interviewId: string
): Promise<Interview | null> {
  try {
    const doc = await db.collection("interviews").doc(interviewId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Interview;
  } catch (e) {
    console.error("Error getting interview:", e);
    return null;
  }
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[]> {
  try {
    const snapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Interview
    );
  } catch (e) {
    console.error("Error getting interviews:", e);
    return [];
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[]> {
  const { userId, limit = 10 } = params;
  try {
    const snapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Interview
    );
  } catch (e) {
    console.error("Error getting latest interviews:", e);
    return [];
  }
}

export async function saveTranscript(
  interviewId: string,
  transcript: { role: string; content: string }[]
) {
  try {
    await db.collection("interviews").doc(interviewId).update({
      transcript,
      finalized: true,
    });
    return { success: true };
  } catch (e) {
    console.error("Error saving transcript:", e);
    return { success: false };
  }
}

export async function generateFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    // Get the interview details
    const interview = await getInterviewById(interviewId);
    if (!interview) {
      return { success: false, message: "Interview not found" };
    }

    const formattedTranscript = transcript
      .map((t) => `${t.role === "user" ? "Candidate" : "Interviewer"}: ${t.content}`)
      .join("\n");

    const prompt = `You are an expert interview coach analyzing a ${interview.level} ${interview.role} interview transcript.
The interview type was: ${interview.type}.
Tech stack discussed: ${interview.techstack.join(", ")}.

Here is the interview transcript:
${formattedTranscript}

Evaluate the candidate's performance and provide detailed feedback. Score each category from 0-100.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    {"name": "Communication Skills", "score": <number>, "comment": "<specific feedback>"},
    {"name": "Technical Knowledge", "score": <number>, "comment": "<specific feedback>"},
    {"name": "Problem Solving", "score": <number>, "comment": "<specific feedback>"},
    {"name": "Cultural Fit", "score": <number>, "comment": "<specific feedback>"},
    {"name": "Confidence and Clarity", "score": <number>, "comment": "<specific feedback>"},
    {"name": "Structure and Organization", "score": <number>, "comment": "<specific feedback>"}
  ],
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "finalAssessment": "<2-3 sentence overall assessment>"
}`;

    const text = await chatWithFallback([{ role: "user", content: prompt }]);
    const cleanText = (text || "{}").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const feedbackData = JSON.parse(cleanText);

    // Validate with zod
    const validated = feedbackSchema.parse(feedbackData);

    // Save feedback to Firestore
    const feedbackRef = await db.collection("feedback").add({
      interviewId,
      userId,
      ...validated,
      createdAt: new Date().toISOString(),
    });

    // Update interview with feedback reference
    await db.collection("interviews").doc(interviewId).update({
      feedbackId: feedbackRef.id,
      finalized: true,
    });

    return {
      success: true,
      feedbackId: feedbackRef.id,
    };
  } catch (e: unknown) {
    console.error("Error generating feedback:", e);
    return {
      success: false,
      message: e instanceof Error ? e.message : "Failed to generate feedback",
    };
  }
}

export async function getFeedbackById(
  feedbackId: string
): Promise<Feedback | null> {
  try {
    const doc = await db.collection("feedback").doc(feedbackId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Feedback;
  } catch (e) {
    console.error("Error getting feedback:", e);
    return null;
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  try {
    const snapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Feedback;
  } catch (e) {
    console.error("Error getting feedback by interview:", e);
    return null;
  }
}

export async function generateTextResponse(
  messages: { role: string; content: string }[],
  interview: Interview
) {
  try {
    const questionList = interview.questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");

    const result = await chatWithFallback([
      {
        role: "system",
        content: `You are a professional job interviewer conducting a text-based interview for a ${interview.level} ${interview.role} position.
Interview type: ${interview.type}
Tech stack: ${interview.techstack.join(", ")}

Your prepared questions:
${questionList}

Continue the interview naturally. Ask the next question from your list, or ask a follow-up if the candidate's answer needs more depth. If all questions have been asked, wrap up the interview professionally.
Keep your response concise (2-3 sentences max). Be professional but warm.`,
      },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ]);

    return result || "I apologize, but I'm having a technical difficulty. Could you repeat your last answer?";
  } catch (e) {
    console.error("Error generating text response:", e);
    return "I apologize, but I'm having a technical difficulty. Could you repeat your last answer?";
  }
}
