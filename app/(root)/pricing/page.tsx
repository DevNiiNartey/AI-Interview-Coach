import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import PricingCards from "@/components/PricingCards";

export default async function PricingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col items-center gap-8 max-w-5xl mx-auto">
      <div className="text-center flex flex-col gap-3">
        <h2>Choose Your Plan</h2>
        <p className="max-w-md mx-auto">
          Start free and upgrade when you&apos;re ready to go unlimited.
        </p>
      </div>
      <PricingCards currentTier={user.subscriptionTier || "free"} />
    </div>
  );
}
