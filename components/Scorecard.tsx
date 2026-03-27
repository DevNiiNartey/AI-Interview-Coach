"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function Scorecard({ feedback }: ScorecardProps) {
  const chartData = feedback.categoryScores.map((cat) => ({
    category: cat.name.replace(/ and /g, " & "),
    score: cat.score,
    fullMark: 100,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-100";
    if (score >= 60) return "text-yellow-400";
    return "text-destructive-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="section-feedback">
      {/* Overall Score */}
      <div className="flex flex-col items-center gap-4">
        <h2>Interview Scorecard</h2>
        <div className="relative flex items-center justify-center">
          <div
            className={`text-7xl font-bold ${getScoreColor(feedback.totalScore)}`}
          >
            {feedback.totalScore}
          </div>
          <span className="text-2xl text-light-400 ml-1">/100</span>
        </div>
        <p className={`text-lg font-semibold ${getScoreColor(feedback.totalScore)}`}>
          {getScoreLabel(feedback.totalScore)}
        </p>
      </div>

      {/* Radar Chart */}
      <div className="card-border w-full">
        <div className="card p-6">
          <h3 className="text-center mb-4">Performance Breakdown</h3>
          <ResponsiveContainer width="100%" height={300} className="sm:!h-[350px]">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#4B4D4F" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "#d6e0ff", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#6870a6", fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#CAC5FE"
                fill="#CAC5FE"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {feedback.categoryScores.map((cat) => (
          <div key={cat.name} className="card-border">
            <div className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-white font-semibold text-sm">{cat.name}</p>
                <span
                  className={`font-bold text-lg ${getScoreColor(cat.score)}`}
                >
                  {cat.score}
                </span>
              </div>
              <div className="w-full bg-dark-200 rounded-full h-2 mb-3">
                <div
                  className="h-2 rounded-full bg-primary-200 transition-all duration-500"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-light-400 text-sm">{cat.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Strengths */}
      <div className="card-border w-full">
        <div className="card p-6">
          <h3 className="text-success-100 mb-4">Strengths</h3>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-light-100">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="card-border w-full">
        <div className="card p-6">
          <h3 className="text-yellow-400 mb-4">Areas for Improvement</h3>
          <ul className="space-y-2">
            {feedback.areasForImprovement.map((a, i) => (
              <li key={i} className="text-light-100">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="card-border w-full">
        <div className="card p-6">
          <h3 className="mb-4">Final Assessment</h3>
          <p className="text-light-100 leading-relaxed">
            {feedback.finalAssessment}
          </p>
        </div>
      </div>
    </div>
  );
}
