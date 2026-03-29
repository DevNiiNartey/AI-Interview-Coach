"use client"

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface ProgressDataPoint {
  date: string;
  role: string;
  communicationSkills: number;
  technicalKnowledge: number;
  problemSolving: number;
  culturalFit: number;
  confidenceAndClarity: number;
  structureAndOrganization: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  communicationSkills: "#CAC5FE",
  technicalKnowledge: "#49de50",
  problemSolving: "#f7d353",
  culturalFit: "#53b8f7",
  confidenceAndClarity: "#f75353",
  structureAndOrganization: "#d6e0ff",
};

const CATEGORY_LABELS: Record<string, string> = {
  communicationSkills: "Communication",
  technicalKnowledge: "Technical",
  problemSolving: "Problem Solving",
  culturalFit: "Cultural Fit",
  confidenceAndClarity: "Confidence",
  structureAndOrganization: "Structure",
};

const ProgressChart = ({ data }: { data: ProgressDataPoint[] }) => {
  if (data.length < 2) {
    return (
      <div className="bg-dark-200 rounded-xl p-8 text-center">
        <p className="text-light-400">Complete 2+ interviews to see your progress trends</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-200 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-primary-100 mb-4">Score Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27282f" />
          <XAxis dataKey="date" tick={{ fill: "#6870a6", fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#6870a6", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1A1C20", border: "1px solid #27282f", borderRadius: "8px" }}
            labelStyle={{ color: "#d6e0ff" }}
            formatter={(value: number, name: string) => [value, CATEGORY_LABELS[name] || name]}
            labelFormatter={(label: string, payload: Array<{ payload?: ProgressDataPoint }>) => {
              const point = payload?.[0]?.payload;
              return point ? `${label} — ${point.role}` : label;
            }}
          />
          <Legend
            formatter={(value: string) => CATEGORY_LABELS[value] || value}
            wrapperStyle={{ fontSize: "11px" }}
          />
          {Object.keys(CATEGORY_COLORS).map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CATEGORY_COLORS[key]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
