import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import InterviewSetup from "@/components/InterviewSetup";

export default async function InterviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return <InterviewSetup userId={user.id} />;
}
