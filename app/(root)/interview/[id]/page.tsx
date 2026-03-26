import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/interview.action";
import Agents from "@/components/Agents";
import TextInterview from "@/components/TextInterview";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  // If interview already has feedback, go to feedback page
  if (interview.feedbackId) {
    redirect(`/interview/${id}/feedback`);
  }

  if (interview.mode === "text") {
    return (
      <TextInterview
        interview={interview}
        userName={user.name}
        userId={user.id}
      />
    );
  }

  return (
    <Agents
      userName={user.name}
      userId={user.id}
      interview={interview}
    />
  );
}
