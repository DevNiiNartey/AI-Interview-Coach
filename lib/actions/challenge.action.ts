'use server';

import { db } from '@/firebase/admin';

// Rotating weekly challenges
const CHALLENGE_TEMPLATES = [
  { title: "Behavioral Blitz", description: "Complete 3 behavioral interviews this week", type: "Behavioral", target: 3, xpReward: 100 },
  { title: "Technical Sprint", description: "Complete 3 technical interviews this week", type: "Technical", target: 3, xpReward: 100 },
  { title: "Mixed Master", description: "Complete 2 mixed interviews this week", type: "Mixed", target: 2, xpReward: 100 },
  { title: "Voice Challenge", description: "Complete 2 voice interviews this week", mode: "voice", target: 2, xpReward: 100 },
  { title: "Score Chaser", description: "Score 80+ on any 2 interviews this week", scoreThreshold: 80, target: 2, xpReward: 100 },
  { title: "Practice Makes Perfect", description: "Complete 5 interviews of any type this week", target: 5, xpReward: 150 },
];

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekEnd(): Date {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return weekEnd;
}

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

export async function getActiveChallenge() {
  const weekNum = getWeekNumber();
  const challengeIndex = weekNum % CHALLENGE_TEMPLATES.length;
  const template = CHALLENGE_TEMPLATES[challengeIndex];

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const daysRemaining = Math.ceil((weekEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

  return {
    ...template,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    daysRemaining: Math.max(0, daysRemaining),
  };
}

export async function getUserChallengeProgress(userId: string) {
  const challenge = await getActiveChallenge();
  const weekStart = new Date(challenge.weekStart);

  // Query interviews completed this week
  const snapshot = await db.collection('interviews')
    .where('userId', '==', userId)
    .where('finalized', '==', true)
    .where('createdAt', '>=', weekStart.toISOString())
    .get();

  let progress = 0;

  for (const doc of snapshot.docs) {
    const interview = doc.data();

    // Check if this interview matches the challenge criteria
    if (challenge.type && interview.type !== challenge.type) continue;
    if (challenge.mode && interview.mode !== challenge.mode) continue;

    if (challenge.scoreThreshold) {
      // Need to check feedback score
      if (interview.feedbackId) {
        const feedbackDoc = await db.collection('feedback').doc(interview.feedbackId).get();
        if (feedbackDoc.exists && feedbackDoc.data()!.totalScore >= challenge.scoreThreshold) {
          progress++;
        }
      }
    } else {
      progress++;
    }
  }

  const completed = progress >= challenge.target;

  return {
    ...challenge,
    progress: Math.min(progress, challenge.target),
    completed,
  };
}
