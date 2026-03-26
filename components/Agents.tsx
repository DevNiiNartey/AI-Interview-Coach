"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getVapi, createInterviewAssistant } from "@/lib/vapi";
import {
  saveTranscript,
  generateFeedback,
} from "@/lib/actions/interview.action";

enum CallStatus {
  INACTIVE = "inactive",
  CONNECTING = "connecting",
  ACTIVE = "active",
  ENDING = "ending",
}

export default function Agents({
  userName,
  userId,
  interview,
}: {
  userName: string;
  userId: string;
  interview: Interview;
}) {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<
    { role: string; content: string }[]
  >([]);
  const [lastMessage, setLastMessage] = useState("");

  const endInterview = useCallback(async () => {
    setCallStatus(CallStatus.ENDING);

    try {
      const vapi = getVapi();
      vapi.stop();

      if (transcript.length > 0) {
        await saveTranscript(interview.id, transcript);

        const result = await generateFeedback({
          interviewId: interview.id,
          userId,
          transcript,
        });

        if (result.success && result.feedbackId) {
          toast.success("Interview complete! Generating feedback...");
          router.push(`/interview/${interview.id}/feedback`);
          return;
        }
      }

      toast.info("Interview ended");
      router.push("/");
    } catch (error) {
      console.error("Error ending interview:", error);
      toast.error("Error saving interview data");
      router.push("/");
    }
  }, [interview.id, userId, transcript, router]);

  useEffect(() => {
    const vapi = getVapi();

    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => {
      setCallStatus(CallStatus.INACTIVE);
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: unknown) => {
      console.error("Vapi error:", error);
      toast.error("Voice connection error");
      setCallStatus(CallStatus.INACTIVE);
    };
    const onMessage = (message: Message) => {
      if (
        message.type === MessageTypeEnum.TRANSCRIPT &&
        (message as TranscriptMessage).transcriptType ===
          TranscriptMessageTypeEnum.FINAL
      ) {
        const transcriptMsg = message as TranscriptMessage;
        const newEntry = {
          role: transcriptMsg.role === MessageRoleEnum.ASSISTANT ? "assistant" : "user",
          content: transcriptMsg.transcript,
        };
        setTranscript((prev) => [...prev, newEntry]);
        setLastMessage(transcriptMsg.transcript);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    vapi.on("message", onMessage);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      vapi.off("message", onMessage);
    };
  }, []);

  const startInterview = async () => {
    setCallStatus(CallStatus.CONNECTING);
    try {
      const vapi = getVapi();
      const assistant = createInterviewAssistant(
        interview.questions,
        interview.role,
        interview.level
      );

      await vapi.start(assistant, {
        metadata: {
          interviewId: interview.id,
          userName,
        },
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start voice interview. Check your microphone.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  return (
    <div className="call-view">
      <div className="card-interviewer">
        <div className="avatar">
          <Image
            src="/ai-avatar.png"
            alt="AI Interviewer"
            width={65}
            height={54}
            className="object-cover"
          />
          {isSpeaking && (
            <span>
              <div className="animate-speak" />
            </span>
          )}
        </div>
        <h3>AI Interviewer</h3>
        {callStatus === CallStatus.ACTIVE && (
          <p className="text-sm text-light-400 mt-1">
            {isSpeaking ? "Speaking..." : "Listening..."}
          </p>
        )}
      </div>

      <div className="card-border sm:basis-1/2 w-full h-[400px]">
        <div className="card-content h-full flex flex-col">
          <div className="flex-1 flex flex-col justify-center items-center gap-4 p-4">
            {callStatus === CallStatus.INACTIVE && (
              <div className="text-center">
                <h3 className="text-white mb-2">
                  {interview.role} Interview
                </h3>
                <p className="text-light-400 text-sm mb-1">
                  {interview.level} &middot; {interview.type}
                </p>
                <p className="text-light-400 text-sm">
                  {interview.questions.length} questions prepared
                </p>
              </div>
            )}

            {callStatus === CallStatus.CONNECTING && (
              <div className="text-center">
                <div className="animate-pulse">
                  <p className="text-primary-200 font-semibold">
                    Connecting to AI interviewer...
                  </p>
                </div>
              </div>
            )}

            {callStatus === CallStatus.ACTIVE && lastMessage && (
              <div className="transcript-border">
                <div className="transcript">
                  <p>{lastMessage}</p>
                </div>
              </div>
            )}

            {callStatus === CallStatus.ENDING && (
              <div className="text-center">
                <div className="animate-pulse">
                  <p className="text-primary-200 font-semibold">
                    Saving interview & generating feedback...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 pb-4">
            {callStatus === CallStatus.INACTIVE && (
              <button onClick={startInterview} className="btn-call">
                Start Interview
              </button>
            )}
            {(callStatus === CallStatus.ACTIVE ||
              callStatus === CallStatus.CONNECTING) && (
              <button onClick={endInterview} className="btn-disconnect">
                End Interview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
