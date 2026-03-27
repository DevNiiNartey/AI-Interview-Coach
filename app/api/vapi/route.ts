import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, call } = body;

    switch (type) {
      case "call.started": {
        const interviewId = call?.metadata?.interviewId;
        if (interviewId) {
          await db.collection("interviews").doc(interviewId).update({
            callId: call.id,
            callStartedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case "call.ended": {
        const interviewId = call?.metadata?.interviewId;
        if (interviewId && call?.transcript) {
          const transcript = call.transcript.map(
            (entry: { role: string; content: string }) => ({
              role: entry.role === "assistant" ? "assistant" : "user",
              content: entry.content,
            })
          );

          await db.collection("interviews").doc(interviewId).update({
            transcript,
            finalized: true,
            callEndedAt: new Date().toISOString(),
          });
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
