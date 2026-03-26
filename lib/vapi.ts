import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
  if (!vapiInstance) {
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!token) {
      throw new Error("NEXT_PUBLIC_VAPI_WEB_TOKEN is not set");
    }
    vapiInstance = new Vapi(token);
  }
  return vapiInstance;
}

export function createInterviewAssistant(
  questions: string[],
  role: string,
  level: string
) {
  const questionList = questions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  return {
    name: "Interview Coach",
    firstMessage: `Hello! Thank you for joining this interview session. I'll be conducting your ${level} ${role} interview today. Let's get started. Are you ready?`,
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2" as const,
      language: "en" as const,
    },
    voice: {
      provider: "11labs" as const,
      voiceId: "sarah",
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 0.9,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai" as const,
      model: "gpt-4" as const,
      messages: [
        {
          role: "system" as const,
          content: `You are a professional job interviewer conducting a real-time voice interview with a candidate for a ${level} ${role} position. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
${questionList}

Engage naturally & react appropriately:
- Listen actively to responses and acknowledge them before moving forward.
- Ask brief follow-up questions if a response is vague or requires more detail.
- Keep the conversation flowing smoothly while maintaining control.

Be professional, yet warm and welcoming:
- Use official yet friendly language.
- Keep responses concise and to the point (like in a real voice interview).
- Avoid robotic phrasing—sound natural and conversational.

Answer the candidate's questions professionally:
- If asked about the role, company, or expectations, provide a clear and relevant answer.
- If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
- After all questions are covered, thank the candidate for their time.
- Inform them that they will receive feedback shortly.
- End the conversation on a polite and positive note.

Keep all your responses short and simple. This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble.`,
        },
      ],
    },
  };
}
