import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewById,
  getFeedbackByInterviewId,
} from "@/lib/actions/interview.action";
import Scorecard from "@/components/Scorecard";
import { Button } from "@/components/ui/button";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[60vh]">
        <h2>No Feedback Yet</h2>
        <p>This interview hasn&apos;t been completed yet.</p>
        <div className="flex gap-4">
          <Button asChild className="btn-primary">
            <Link href={`/interview/${id}`}>Take Interview</Link>
          </Button>
          <Button asChild className="btn-secondary">
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Scorecard feedback={feedback} />
      <div className="flex justify-center gap-4 pb-8">
        <Button asChild className="btn-primary">
          <Link href="/interview">Practice Again</Link>
        </Button>
        <Button asChild className="btn-secondary">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
