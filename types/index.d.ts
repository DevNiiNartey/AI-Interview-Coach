interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  mode: "voice" | "text";
  transcript?: { role: string; content: string }[];
  feedbackId?: string;
}

interface CreateInterviewParams {
  role: string;
  level: string;
  techstack: string[];
  type: string;
  mode: "voice" | "text";
  userId: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  emailVerified?: boolean;
  subscriptionTier?: "free" | "pro";
  subscriptionId?: string;
  stripeCustomerId?: string;
  interviewsUsedThisMonth?: number;
  voiceInterviewsUsedThisMonth?: number;
  monthlyResetDate?: string;
  // Gamification
  xp?: number;
  level?: number;
  streak?: number;
  streakLastDate?: string | null;
  badges?: string[];
  totalInterviews?: number;
}

interface UserUsage {
  subscriptionTier: "free" | "pro";
  interviewsUsedThisMonth: number;
  voiceInterviewsUsedThisMonth: number;
  monthlyResetDate: string;
  textInterviewsRemaining: number;
  voiceInterviewsRemaining: number;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  feedbackId?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  interview?: Interview;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

interface ScorecardProps {
  feedback: Feedback;
}

interface TextMessage {
  role: "user" | "assistant";
  content: string;
}
