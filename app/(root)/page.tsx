import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/interview.action";
import InterviewCard from "@/components/InterviewCard";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const interviews = await getInterviewsByUserId(user.id);

  const completedInterviews = interviews.filter((i) => i.finalized);
  const pendingInterviews = interviews.filter((i) => !i.finalized);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice and Feedback</h2>
          <p>Practice on real interview questions and get instant feedback</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {completedInterviews.length > 0 ? (
            completedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                feedbackId={interview.feedbackId}
              />
            ))
          ) : (
            <p>No completed interviews yet. Start practicing!</p>
          )}
        </div>
      </section>

      {pendingInterviews.length > 0 && (
        <section className="flex flex-col gap-6 mt-8">
          <h2>Continue Your Interview</h2>
          <div className="interviews-section">
            {pendingInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interviewId={interview.id}
                userId={user.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
