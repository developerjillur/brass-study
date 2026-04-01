"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SessionData {
  duration_minutes: number;
  pain_level_before: number | null;
  pain_level_after: number | null;
  fatigue_level: number | null;
  skipped: boolean;
}

interface AssessmentData {
  assessment_type: string;
  time_point: string;
  total_score: number | null;
}

interface Props {
  sessions: SessionData[];
  assessments: AssessmentData[];
}

function computeStats(values: number[]) {
  if (values.length === 0) return { n: 0, mean: "—", sd: "—", min: "—", max: "—" };
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n > 1 ? n - 1 : 1);
  const sd = Math.sqrt(variance);
  return {
    n,
    mean: mean.toFixed(2),
    sd: sd.toFixed(2),
    min: Math.min(...values).toString(),
    max: Math.max(...values).toString(),
  };
}

const DescriptiveStatistics = ({ sessions, assessments }: Props) => {
  const completedSessions = sessions.filter((s) => !s.skipped);
  const durations = completedSessions.map((s) => s.duration_minutes);
  const painBefore = completedSessions.map((s) => s.pain_level_before).filter((v): v is number => v != null);
  const painAfter = completedSessions.map((s) => s.pain_level_after).filter((v): v is number => v != null);
  const fatigue = completedSessions.map((s) => s.fatigue_level).filter((v): v is number => v != null);
  const painChange = completedSessions
    .filter((s) => s.pain_level_before != null && s.pain_level_after != null)
    .map((s) => (s.pain_level_after! - s.pain_level_before!));

  const sessionRows = [
    { label: "Duration (min)", ...computeStats(durations) },
    { label: "Pain Before (0–10)", ...computeStats(painBefore) },
    { label: "Pain After (0–10)", ...computeStats(painAfter) },
    { label: "Pain Change (Δ)", ...computeStats(painChange) },
    { label: "Fatigue (0–10)", ...computeStats(fatigue) },
  ];

  // Assessment stats by type and time_point
  const assessmentTypes = ["hads", "phq9", "gad7", "pss10"];
  const timePoints = ["baseline", "week_4", "week_8", "week_12"];
  const tpLabels: Record<string, string> = {
    baseline: "Baseline", week_4: "Wk 4", week_8: "Wk 8", week_12: "Wk 12",
  };

  const assessmentRows = assessmentTypes.flatMap((type) =>
    timePoints.map((tp) => {
      const values = assessments
        .filter((a) => a.assessment_type === type && a.time_point === tp && a.total_score != null)
        .map((a) => a.total_score!);
      return { label: `${type.toUpperCase()} — ${tpLabels[tp] || tp}`, ...computeStats(values) };
    })
  ).filter((r) => r.n > 0);

  const complianceRate = sessions.length > 0
    ? ((completedSessions.length / sessions.length) * 100).toFixed(1)
    : "—";

  return (
    <div className="space-y-6 descriptive-statistics">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Therapy Session Statistics</CardTitle>
          <CardDescription>
            Descriptive statistics across all completed sessions (N = {completedSessions.length}).
            Overall compliance: {complianceRate}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatsTable rows={sessionRows} />
        </CardContent>
      </Card>

      {assessmentRows.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Assessment Score Statistics</CardTitle>
            <CardDescription>Mean scores by assessment and time point across all participants.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatsTable rows={assessmentRows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function StatsTable({ rows }: { rows: { label: string; n: number; mean: string; sd: string; min: string; max: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Measure</TableHead>
            <TableHead className="text-center">N</TableHead>
            <TableHead className="text-center">Mean</TableHead>
            <TableHead className="text-center">SD</TableHead>
            <TableHead className="text-center">Min</TableHead>
            <TableHead className="text-center">Max</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell className="text-center">{row.n}</TableCell>
              <TableCell className="text-center">{row.mean}</TableCell>
              <TableCell className="text-center">{row.sd}</TableCell>
              <TableCell className="text-center">{row.min}</TableCell>
              <TableCell className="text-center">{row.max}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DescriptiveStatistics;
