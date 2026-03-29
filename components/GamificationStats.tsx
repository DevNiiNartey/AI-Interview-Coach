"use client"

interface GamificationStatsProps {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  totalInterviews: number;
  xpForNextLevel: number;
}

const BADGE_DEFS = [
  { id: 'first-interview', name: 'First Interview', icon: '🎯' },
  { id: '5-interviews', name: '5 Interviews', icon: '⭐' },
  { id: 'perfect-score', name: 'Perfect Score', icon: '💎' },
  { id: '10-day-streak', name: '10-Day Streak', icon: '🔥' },
  { id: 'all-rounder', name: 'All-Rounder', icon: '🏆' },
];

const GamificationStats = ({ xp, level, streak, badges, totalInterviews, xpForNextLevel }: GamificationStatsProps) => {
  const xpProgress = xpForNextLevel > 0 ? Math.min(100, (xp / xpForNextLevel) * 100) : 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-dark-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary-200">L{level}</p>
          <p className="text-light-400 text-xs mt-1">Level</p>
        </div>
        <div className="bg-dark-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary-100">{xp}</p>
          <p className="text-light-400 text-xs mt-1">Total XP</p>
        </div>
        <div className="bg-dark-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {streak > 0 ? `🔥 ${streak}` : '—'}
          </p>
          <p className="text-light-400 text-xs mt-1">
            {streak > 0 ? 'Day Streak' : 'Start a streak!'}
          </p>
        </div>
        <div className="bg-dark-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalInterviews}</p>
          <p className="text-light-400 text-xs mt-1">Interviews</p>
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="bg-dark-200 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-light-100">Level {level}</span>
          <span className="text-light-400">{xp} / {xpForNextLevel} XP</span>
        </div>
        <div className="w-full bg-dark-300 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary-200 transition-all duration-500"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="bg-dark-200 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-primary-100 mb-3">Badges</h3>
        <div className="flex flex-wrap gap-3">
          {BADGE_DEFS.map((badge) => {
            const earned = badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                  earned
                    ? 'bg-primary-200/20 text-white'
                    : 'bg-dark-300 text-light-600 opacity-50'
                }`}
                title={earned ? `Earned: ${badge.name}` : `Locked: ${badge.name}`}
              >
                <span className="text-lg">{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamificationStats;
