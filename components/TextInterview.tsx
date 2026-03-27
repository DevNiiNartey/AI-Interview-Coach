"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import {
  saveTranscript,
  generateFeedback,
  generateTextResponse,
} from "@/lib/actions/interview.action";

const STAR_HINTS = [
  { label: "S - Situation", hint: "Describe the context or background" },
  { label: "T - Task", hint: "Explain your responsibility or goal" },
  { label: "A - Action", hint: "Detail the steps you took" },
  { label: "R - Result", hint: "Share the outcome and what you learned" },
];

export default function TextInterview({
  interview,
  userName,
  userId,
}: {
  interview: Interview;
  userName: string;
  userId: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<TextMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [started, setStarted] = useState(false);
  const [showStarHints, setShowStarHints] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    setStarted(true);
    setLoading(true);

    try {
      const greeting = await generateTextResponse([], interview);
      setMessages([{ role: "assistant", content: greeting }]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: `Hello ${userName}! Welcome to your ${interview.level} ${interview.role} interview. I'll be asking you ${interview.questions.length} questions today. Let's begin. ${interview.questions[0]}`,
        },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: TextMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await generateTextResponse(
        updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        interview
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch {
      toast.error("Failed to get response");
    }
    setLoading(false);
  };

  const endInterview = async () => {
    if (messages.length < 2) {
      toast.error("Answer at least one question before ending");
      return;
    }

    setEnding(true);
    try {
      const transcript = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await saveTranscript(interview.id, transcript);

      const result = await generateFeedback({
        interviewId: interview.id,
        userId,
        transcript,
      });

      if (result.success) {
        toast.success("Generating your feedback...");
        router.push(`/interview/${interview.id}/feedback`);
      } else {
        toast.error("Failed to generate feedback");
        router.push("/");
      }
    } catch {
      toast.error("Error ending interview");
      router.push("/");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (ending) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <div className="card-border max-w-lg w-full">
          <div className="card p-8 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary-200/30 rounded-full" />
              <div className="w-16 h-16 border-4 border-primary-200 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
            </div>
            <h2 className="text-center text-primary-100">Analyzing Your Interview</h2>
            <p className="text-light-400 text-sm text-center max-w-sm">
              Our AI is reviewing your responses and generating detailed feedback. This usually takes 15-30 seconds.
            </p>
            <div className="flex gap-1 mt-2">
              <span className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
              <span className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <div className="card-border max-w-lg w-full">
          <div className="card p-8 flex flex-col items-center gap-6">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={80}
              height={80}
            />
            <h2 className="text-center">Text Interview</h2>
            <div className="text-center">
              <p className="text-white font-semibold">
                {interview.role} &middot; {interview.level}
              </p>
              <p className="text-light-400 text-sm mt-1">
                {interview.type} &middot; {interview.questions.length} questions
              </p>
            </div>
            <p className="text-light-400 text-sm text-center">
              Type your answers to the interview questions. Use the STAR method
              hints for behavioral questions.
            </p>
            <Button onClick={startInterview} className="btn-primary">
              Begin Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-3xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-dark-200">
        <div>
          <h3 className="text-white">
            {interview.role} Interview
          </h3>
          <p className="text-sm text-light-400">
            {interview.level} &middot; {interview.type}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStarHints(!showStarHints)}
            className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all ${
              showStarHints
                ? "bg-primary-200 text-dark-100"
                : "bg-dark-200 text-light-100"
            }`}
          >
            STAR Method
          </button>
          <Button
            onClick={endInterview}
            disabled={ending}
            className="btn-disconnect text-sm !py-1.5 !px-4 !min-w-0 !rounded-full"
          >
            {ending ? "Ending..." : "End Interview"}
          </Button>
        </div>
      </div>

      {/* STAR Hints */}
      {showStarHints && (
        <div className="grid grid-cols-4 gap-2 py-3 animate-fadeIn">
          {STAR_HINTS.map((s) => (
            <div
              key={s.label}
              className="bg-dark-200 rounded-lg p-2 text-center"
            >
              <p className="text-primary-200 text-xs font-bold">{s.label}</p>
              <p className="text-light-400 text-xs mt-1">{s.hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary-200/20 text-white"
                  : "bg-dark-200 text-light-100"
              }`}
            >
              {msg.role === "assistant" && (
                <p className="text-primary-200 text-xs font-bold mb-1">
                  Interviewer
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-dark-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-light-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-light-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-light-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-dark-200 pt-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 bg-dark-200 text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200/50 placeholder:text-light-600 text-sm"
            disabled={loading || ending}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading || ending}
            className="btn-primary self-end"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
