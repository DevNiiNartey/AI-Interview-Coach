import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId, getFeedbackByInterviewId } from "@/lib/actions/interview.action";
import InterviewCard from "@/components/InterviewCard";
import FilterableInterviewList from "@/components/FilterableInterviewList";
import type { EnrichedInterview } from "@/components/FilterableInterviewList";
import VerificationBanner from "@/components/VerificationBanner";
import UsageCounter from "@/components/UsageCounter";
import GamificationStats from "@/components/GamificationStats";
import ProgressChart from "@/components/ProgressChart";
import WeeklyChallenge from "@/components/WeeklyChallenge";
import { getUserChallengeProgress } from "@/lib/actions/challenge.action";
import { getUserUsage } from "@/lib/actions/usage.action";
import { getGamificationData, getXpForNextLevel } from "@/lib/actions/gamification.action";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const usage = await getUserUsage(user.id);
  const gamification = await getGamificationData(user.id);
  const xpForNextLevel = await getXpForNextLevel(gamification.level);

  const challengeProgress = await getUserChallengeProgress(user.id);
  const interviews = await getInterviewsByUserId(user.id);

  const completedInterviews = interviews.filter((i) => i.finalized);
  const pendingInterviews = interviews.filter((i) => !i.finalized);

  // Pre-fetch feedback for all completed interviews to enable client-side sorting by score
  const enrichedInterviews: EnrichedInterview[] = await Promise.all(
    completedInterviews.map(async (interview) => {
      let feedbackScore: number | undefined;
      let feedbackAssessment: string | undefined;
      let categoryScores: { name: string; score: number }[] | undefined;

      if (interview.feedbackId) {
        const feedback = await getFeedbackByInterviewId({
          interviewId: interview.id,
          userId: user.id,
        });
        if (feedback) {
          feedbackScore = feedback.totalScore;
          feedbackAssessment = feedback.finalAssessment;
          categoryScores = feedback.categoryScores;
        }
      }

      return {
        id: interview.id,
        role: interview.role,
        type: interview.type,
        techstack: interview.techstack,
        createdAt: interview.createdAt,
        feedbackId: interview.feedbackId,
        feedbackScore,
        feedbackAssessment,
        categoryScores,
        finalized: interview.finalized,
      };
    })
  );

  // Build progress chart data from interviews with feedback
  const progressData = enrichedInterviews
    .filter((i) => i.categoryScores && i.categoryScores.length === 6)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((i) => {
      const scores = i.categoryScores!;
      const findScore = (name: string) => scores.find((s) => s.name.includes(name))?.score || 0;
      return {
        date: new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        role: i.role,
        communicationSkills: findScore("Communication"),
        technicalKnowledge: findScore("Technical"),
        problemSolving: findScore("Problem"),
        culturalFit: findScore("Cultural"),
        confidenceAndClarity: findScore("Confidence"),
        structureAndOrganization: findScore("Structure"),
      };
    });

  return (
    <>
      <VerificationBanner userId={user.id} emailVerified={user.emailVerified} />
      <UsageCounter usage={usage} />

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

      <section className="mt-8">
        <GamificationStats
          xp={gamification.xp}
          level={gamification.level}
          streak={gamification.streak}
          badges={gamification.badges}
          totalInterviews={gamification.totalInterviews}
          xpForNextLevel={xpForNextLevel}
        />
      </section>

      <section className="mt-8">
        <WeeklyChallenge challenge={challengeProgress} />
      </section>

      <section className="mt-8">
        <ProgressChart data={progressData} />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        {enrichedInterviews.length > 0 ? (
          <FilterableInterviewList interviews={enrichedInterviews} />
        ) : (
          <p>No completed interviews yet. Start practicing!</p>
        )}
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
