"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useChartExport } from "@/hooks/useChartExport";

interface AssessmentDataPoint {
  participant_label: string;
  time_point: string;
  assessment_type: string;
  total_score: number | null;
  group?: string;
}

interface Props {
  data: AssessmentDataPoint[];
}

const TIME_POINT_LABELS: Record<string, string> = {
  baseline: "Baseline",
  week_4: "Week 4",
  week_8: "Week 8",
  week_12: "Week 12",
};

const ASSESSMENT_CONFIGS = [
  { type: "hads", title: "HADS — Group Comparison", desc: "Mean scores: Active (S) vs Control (C)" },
  { type: "phq9", title: "PHQ-9 — Group Comparison", desc: "Mean scores: Active (S) vs Control (C)" },
  { type: "gad7", title: "GAD-7 — Group Comparison", desc: "Mean scores: Active (S) vs Control (C)" },
  { type: "pss10", title: "PSS-10 — Group Comparison", desc: "Mean scores: Active (S) vs Control (C)" },
];

const GroupComparisonCharts = ({ data }: Props) => {
  const { exportAsPng, exportAsSvg } = useChartExport();
  const chartRefs = {
    hads: useRef<HTMLDivElement>(null),
    phq9: useRef<HTMLDivElement>(null),
    gad7: useRef<HTMLDivElement>(null),
    pss10: useRef<HTMLDivElement>(null),
  };

  const buildGroupData = (assessmentType: string) => {
    const filtered = data.filter((d) => d.assessment_type === assessmentType && d.total_score != null);
    const timePoints = ["baseline", "week_4", "week_8", "week_12"];

    return timePoints.map((tp) => {
      const tpData = filtered.filter((d) => d.time_point === tp);
      const groupS = tpData.filter((d) => d.group === "S");
      const groupC = tpData.filter((d) => d.group === "C");

      const meanS = groupS.length > 0 ? Math.round((groupS.reduce((s, d) => s + (d.total_score || 0), 0) / groupS.length) * 10) / 10 : null;
      const meanC = groupC.length > 0 ? Math.round((groupC.reduce((s, d) => s + (d.total_score || 0), 0) / groupC.length) * 10) / 10 : null;

      return {
        timePoint: TIME_POINT_LABELS[tp] || tp,
        "Active (S)": meanS,
        "Control (C)": meanC,
      };
    }).filter((row) => row["Active (S)"] != null || row["Control (C)"] != null);
  };

  return (
    <div className="space-y-6 group-comparison-charts">
      {ASSESSMENT_CONFIGS.map((config) => {
        const chartData = buildGroupData(config.type);
        const ref = chartRefs[config.type as keyof typeof chartRefs];
        if (chartData.length === 0) return null;

        return (
          <Card key={config.type} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription>{config.desc}</CardDescription>
                </div>
                <div className="flex gap-1 print:hidden">
                  <Button variant="ghost" size="sm" onClick={() => exportAsPng(ref, `${config.type}-group-comparison`)}>
                    <Image className="w-4 h-4 mr-1" /> PNG
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => exportAsSvg(ref, `${config.type}-group-comparison`)}>
                    <Download className="w-4 h-4 mr-1" /> SVG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={ref}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 85%)" />
                    <XAxis dataKey="timePoint" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Active (S)" fill="hsl(185, 55%, 35%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Control (C)" fill="hsl(35, 90%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {ASSESSMENT_CONFIGS.every((c) => buildGroupData(c.type).length === 0) && (
        <div className="py-12 text-center text-muted-foreground">
          No group comparison data available yet. Data will appear once participants in both groups complete assessments.
        </div>
      )}
    </div>
  );
};

export default GroupComparisonCharts;
