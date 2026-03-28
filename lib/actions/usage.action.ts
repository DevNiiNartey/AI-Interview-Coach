'use server';

import { db } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const FREE_TEXT_LIMIT = 5;
const FREE_VOICE_LIMIT = 1;

function getNextMonthlyReset(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

function getDefaultUsageFields() {
  return {
    subscriptionTier: "free" as const,
    interviewsUsedThisMonth: 0,
    voiceInterviewsUsedThisMonth: 0,
    monthlyResetDate: getNextMonthlyReset(),
  };
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const data = userDoc.data()!;

  // Lazy migration: backfill usage fields if missing
  if (data.subscriptionTier === undefined) {
    const defaults = getDefaultUsageFields();
    await userRef.update(defaults);
    return {
      ...defaults,
      textInterviewsRemaining: FREE_TEXT_LIMIT,
      voiceInterviewsRemaining: FREE_VOICE_LIMIT,
    };
  }

  const { subscriptionTier } = data;
  let { interviewsUsedThisMonth, voiceInterviewsUsedThisMonth, monthlyResetDate } = data;

  // Monthly reset: if past the reset date, reset counters
  if (new Date() >= new Date(monthlyResetDate)) {
    const newResetDate = getNextMonthlyReset();
    await userRef.update({
      interviewsUsedThisMonth: 0,
      voiceInterviewsUsedThisMonth: 0,
      monthlyResetDate: newResetDate,
    });
    interviewsUsedThisMonth = 0;
    voiceInterviewsUsedThisMonth = 0;
    monthlyResetDate = newResetDate;
  }

  const isPro = subscriptionTier === "pro";

  return {
    subscriptionTier,
    interviewsUsedThisMonth,
    voiceInterviewsUsedThisMonth,
    monthlyResetDate,
    textInterviewsRemaining: isPro ? Infinity : Math.max(0, FREE_TEXT_LIMIT - interviewsUsedThisMonth),
    voiceInterviewsRemaining: isPro ? Infinity : Math.max(0, FREE_VOICE_LIMIT - voiceInterviewsUsedThisMonth),
  };
}

export async function checkUsageLimit(userId: string, mode: "voice" | "text"): Promise<{ allowed: boolean; message?: string }> {
  const usage = await getUserUsage(userId);

  if (usage.subscriptionTier === "pro") {
    return { allowed: true };
  }

  if (mode === "voice" && usage.voiceInterviewsRemaining <= 0) {
    return { allowed: false, message: "You've used your 1 free voice interview this month. Upgrade to Pro for unlimited access." };
  }

  if (mode === "text" && usage.textInterviewsRemaining <= 0) {
    return { allowed: false, message: "You've used all 5 free text interviews this month. Upgrade to Pro for unlimited access." };
  }

  return { allowed: true };
}

export async function incrementUsage(userId: string, mode: "voice" | "text") {
  const field = mode === "voice" ? "voiceInterviewsUsedThisMonth" : "interviewsUsedThisMonth";

  await db.collection('users').doc(userId).update({
    [field]: FieldValue.increment(1),
  });
}
