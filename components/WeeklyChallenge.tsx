"use client"

interface ChallengeData {
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  daysRemaining: number;
  xpReward: number;
}

const WeeklyChallenge = ({ challenge }: { challenge: ChallengeData }) => {
  const progressPct = Math.min(100, (challenge.progress / challenge.target) * 100);

  return (
    <div className="bg-dark-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
            🎯 {challenge.title}
            {challenge.completed && <span className="text-success-100 text-sm">Complete!</span>}
          </h3>
          <p className="text-light-400 text-sm mt-1">{challenge.description}</p>
        </div>
        <div className="text-right">
          <p className="text-light-400 text-xs">{challenge.daysRemaining}d left</p>
          <p className="text-primary-200 text-xs font-bold">+{challenge.xpReward} XP</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-dark-300 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              challenge.completed ? 'bg-success-100' : 'bg-primary-200'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-light-100 text-sm font-semibold">
          {challenge.progress}/{challenge.target}
        </span>
      </div>
    </div>
  );
};

export default WeeklyChallenge;
