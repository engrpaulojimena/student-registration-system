"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Props {
  data: {
    course_code: string;
    total: number;
  }[];
}

export default function StudentsPerCourse({ data }: Props) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Students Per Course
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="course_code" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="total"
              radius={[8, 8, 0, 0]}
              fill="#8B5CF6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}