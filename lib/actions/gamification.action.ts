'use server';

import { db } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// Level thresholds: L1=0, L2=200, L3=500, L4=1000, L5=2000, L6=3500, L7=5000, L8=7500, L9=10000, L10=15000
const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000];

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export async function getXpForNextLevel(level: number): Promise<number> {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level]; // level is 1-indexed, threshold at index=level is next level
}

const GAMIFICATION_DEFAULTS = {
  xp: 0,
  level: 1,
  streak: 0,
  streakLastDate: null,
  badges: [],
  totalInterviews: 0,
};

// Badge definitions
const BADGE_DEFINITIONS = [
  { id: 'first-interview', name: 'First Interview', description: 'Complete your first interview', icon: '🎯' },
  { id: '5-interviews', name: '5 Interviews', description: 'Complete 5 interviews', icon: '⭐' },
  { id: 'perfect-score', name: 'Perfect Score', description: 'Score 90+ on an interview', icon: '💎' },
  { id: '10-day-streak', name: '10-Day Streak', description: 'Practice for 10 consecutive days', icon: '🔥' },
  { id: 'all-rounder', name: 'All-Rounder', description: 'Score 70+ in all 6 categories', icon: '🏆' },
];

export async function getBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}

export async function getGamificationData(userId: string) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) throw new Error('User not found');

  const data = userDoc.data()!;

  // Lazy migration
  if (data.xp === undefined) {
    await userRef.update(GAMIFICATION_DEFAULTS);
    return { ...GAMIFICATION_DEFAULTS, previousLevel: 1 };
  }

  return {
    xp: data.xp || 0,
    level: data.level || calculateLevel(data.xp || 0),
    streak: data.streak || 0,
    streakLastDate: data.streakLastDate || null,
    badges: data.badges || [],
    totalInterviews: data.totalInterviews || 0,
  };
}

export async function updateStreakOnInterview(userId: string) {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return;

  const data = userDoc.data()!;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastDate = data.streakLastDate;

  if (lastDate === today) {
    // Already practiced today — no streak change
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayStr) {
    // Consecutive day — increment streak
    await userRef.update({
      streak: FieldValue.increment(1),
      streakLastDate: today,
    });
  } else {
    // Streak broken — reset to 1
    await userRef.update({
      streak: 1,
      streakLastDate: today,
    });
  }
}

export async function awardXp(userId: string, feedbackScore: number): Promise<{ xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  const xpAwarded = 50 + feedbackScore; // base 50 + score bonus

  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    xp: FieldValue.increment(xpAwarded),
    totalInterviews: FieldValue.increment(1),
  });

  // Read back to calculate level
  const updated = await userRef.get();
  const newXp = updated.data()!.xp;
  const oldLevel = updated.data()!.level || 1;
  const newLevel = calculateLevel(newXp);

  if (newLevel > oldLevel) {
    await userRef.update({ level: newLevel });
  }

  return { xpAwarded, newLevel, leveledUp: newLevel > oldLevel };
}

export async function checkAndAwardBadges(
  userId: string,
  feedbackScore: number,
  categoryScores: { score: number }[]
): Promise<string[]> {
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const data = userDoc.data()!;

  const currentBadges: string[] = data.badges || [];
  const totalInterviews = data.totalInterviews || 0;
  const streak = data.streak || 0;
  const newBadges: string[] = [];

  // First interview
  if (!currentBadges.includes('first-interview') && totalInterviews >= 1) {
    newBadges.push('first-interview');
  }

  // 5 interviews
  if (!currentBadges.includes('5-interviews') && totalInterviews >= 5) {
    newBadges.push('5-interviews');
  }

  // Perfect score (90+)
  if (!currentBadges.includes('perfect-score') && feedbackScore >= 90) {
    newBadges.push('perfect-score');
  }

  // 10-day streak
  if (!currentBadges.includes('10-day-streak') && streak >= 10) {
    newBadges.push('10-day-streak');
  }

  // All-rounder (all 6 categories >= 70)
  if (!currentBadges.includes('all-rounder') && categoryScores.length === 6 && categoryScores.every(c => c.score >= 70)) {
    newBadges.push('all-rounder');
  }

  if (newBadges.length > 0) {
    await userRef.update({
      badges: [...currentBadges, ...newBadges],
    });
  }

  return newBadges;
}
