"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useChartExport } from "@/hooks/useChartExport";

interface AssessmentDataPoint {
  participant_label: string;
  time_point: string;
  assessment_type: string;
  total_score: number | null;
}

interface AssessmentTrendChartsProps {
  data: AssessmentDataPoint[];
  participantLabels: string[];
}

const COLORS = [
  "hsl(185, 55%, 35%)", "hsl(35, 90%, 50%)", "hsl(145, 60%, 40%)",
  "hsl(0, 72%, 51%)", "hsl(205, 75%, 50%)", "hsl(280, 60%, 50%)",
  "hsl(320, 60%, 50%)", "hsl(60, 80%, 40%)", "hsl(170, 60%, 35%)",
  "hsl(20, 80%, 50%)", "hsl(240, 50%, 55%)", "hsl(100, 50%, 40%)",
];

const TIME_POINT_ORDER = ["baseline", "week_2", "week_4", "week_6", "week_8", "week_10", "week_12"];
const TIME_POINT_LABELS: Record<string, string> = {
  baseline: "Baseline",
  week_2: "Week 2",
  week_4: "Week 4",
  week_6: "Week 6",
  week_8: "Week 8",
  week_10: "Week 10",
  week_12: "Week 12",
};

const ASSESSMENT_CONFIGS = [
  { type: "hads", title: "HADS Scores Over Time", desc: "Hospital Anxiety and Depression Scale (0–42)" },
  { type: "phq9", title: "PHQ-9 Scores Over Time", desc: "Patient Health Questionnaire (0–27)" },
  { type: "gad7", title: "GAD-7 Scores Over Time", desc: "Generalized Anxiety Disorder (0–21)" },
  { type: "pss10", title: "PSS-10 Scores Over Time", desc: "Perceived Stress Scale (0–40)" },
];

const AssessmentTrendCharts = ({ data, participantLabels }: AssessmentTrendChartsProps) => {
  const { exportAsPng, exportAsSvg } = useChartExport();
  const chartRefs = {
    hads: useRef<HTMLDivElement>(null),
    phq9: useRef<HTMLDivElement>(null),
    gad7: useRef<HTMLDivElement>(null),
    pss10: useRef<HTMLDivElement>(null),
  };

  const pivotData = (assessmentType: string) => {
    const filtered = data.filter((d) => d.assessment_type === assessmentType);
    const tpMap = new Map<string, Record<string, number | null>>();

    for (const tp of TIME_POINT_ORDER) {
      tpMap.set(tp, { timePoint: tp as any, label: TIME_POINT_LABELS[tp] as any });
    }

    for (const d of filtered) {
      const row = tpMap.get(d.time_point);
      if (row) {
        row[d.participant_label] = d.total_score;
      }
    }

    return Array.from(tpMap.values()).filter((row) =>
      Object.keys(row).some((k) => k !== "timePoint" && k !== "label" && row[k] != null)
    );
  };

  return (
    <div className="space-y-6">
      {ASSESSMENT_CONFIGS.map((config) => {
        const chartData = pivotData(config.type);
        const ref = chartRefs[config.type as keyof typeof chartRefs];

        return (
          <Card key={config.type} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription>{config.desc}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => exportAsPng(ref, `${config.type}-trend`)}>
                    <Image className="w-4 h-4 mr-1" /> PNG
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => exportAsSvg(ref, `${config.type}-trend`)}>
                    <Download className="w-4 h-4 mr-1" /> SVG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet — chart will appear when participants complete this questionnaire.</p>
              ) : (
              <div ref={ref}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 85%)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {participantLabels.map((label, i) => (
                      <Line
                        key={label}
                        type="monotone"
                        dataKey={label}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssessmentTrendCharts;
