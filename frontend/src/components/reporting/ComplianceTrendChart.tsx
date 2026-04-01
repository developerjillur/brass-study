"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useChartExport } from "@/hooks/useChartExport";

interface SessionRecord {
  participant_label: string;
  study_day: number | null;
  skipped: boolean;
}

interface Props {
  data: SessionRecord[];
  participantLabels: string[];
}

const COLORS = [
  "hsl(185, 55%, 35%)", "hsl(35, 90%, 50%)", "hsl(145, 60%, 40%)",
  "hsl(0, 72%, 51%)", "hsl(205, 75%, 50%)", "hsl(280, 60%, 50%)",
  "hsl(320, 60%, 50%)", "hsl(60, 80%, 40%)",
];

const ComplianceTrendChart = ({ data, participantLabels }: Props) => {
  const { exportAsPng, exportAsSvg } = useChartExport();
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate rolling compliance per participant per week
  const buildWeeklyCompliance = () => {
    const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return weeks.map((week) => {
      const row: Record<string, any> = { week: `Week ${week}` };
      const dayStart = (week - 1) * 7 + 1;
      const dayEnd = week * 7;

      for (const label of participantLabels) {
        const participantData = data.filter(
          (d) => d.participant_label === label && d.study_day != null && d.study_day >= dayStart && d.study_day <= dayEnd
        );
        if (participantData.length > 0) {
          const completed = participantData.filter((d) => !d.skipped).length;
          row[label] = Math.round((completed / participantData.length) * 100);
        }
      }

      return row;
    }).filter((row) => Object.keys(row).length > 1);
  };

  const chartData = buildWeeklyCompliance();

  if (chartData.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Compliance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No compliance data available yet. Data will appear as participants log sessions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card compliance-trend-chart">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Weekly Compliance Trend</CardTitle>
            <CardDescription>Percentage of sessions completed per week by participant</CardDescription>
          </div>
          <div className="flex gap-1 print:hidden">
            <Button variant="ghost" size="sm" onClick={() => exportAsPng(chartRef, "compliance-trend")}>
              <Image className="w-4 h-4 mr-1" /> PNG
            </Button>
            <Button variant="ghost" size="sm" onClick={() => exportAsSvg(chartRef, "compliance-trend")}>
              <Download className="w-4 h-4 mr-1" /> SVG
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 85%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <ReferenceLine y={80} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" label={{ value: "80% target", position: "right", fontSize: 11 }} />
              {participantLabels.map((label, i) => (
                <Line
                  key={label}
                  type="monotone"
                  dataKey={label}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceTrendChart;
