"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle2, SkipForward, Calendar } from "lucide-react";
import type { ParticipantInfo } from "@/pages-src/DailyLogPage";

interface Stats {
  totalLogged: number;
  completed: number;
  skipped: number;
  complianceRate: number;
  currentStreak: number;
}

const ComplianceSummary = ({ participant }: { participant: ParticipantInfo }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [participant.id]);

  const loadStats = async () => {
    const sessions = await apiClient.get("/api/therapy-sessions/mine").catch(() => []);

    if (!sessions) {
      setIsLoading(false);
      return;
    }

    const totalLogged = sessions.length;
    const completed = sessions.filter((s) => !s.skipped).length;
    const skipped = sessions.filter((s) => s.skipped).length;
    const complianceRate = totalLogged > 0 ? Math.round((completed / totalLogged) * 100) : 0;

    // Calculate current streak
    let currentStreak = 0;
    for (const session of sessions) {
      if (!session.skipped) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStats({ totalLogged, completed, skipped, complianceRate, currentStreak });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalLogged === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Data Yet</h3>
          <p className="text-muted-foreground">Start logging sessions to see your compliance stats.</p>
        </CardContent>
      </Card>
    );
  }

  const complianceColor =
    stats.complianceRate >= 80
      ? "text-success"
      : stats.complianceRate >= 60
      ? "text-amber-600"
      : "text-destructive";

  return (
    <div className="space-y-6">
      {/* Main compliance card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">Compliance Overview</CardTitle>
          <CardDescription>Your therapy adherence throughout the study</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Big compliance number */}
          <div className="text-center py-4">
            <div className={`text-5xl font-bold ${complianceColor}`}>
              {stats.complianceRate}%
            </div>
            <p className="text-muted-foreground mt-1">Overall Compliance Rate</p>
            <Progress value={stats.complianceRate} className="h-3 mt-4 max-w-xs mx-auto" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Calendar className="w-5 h-5 text-primary" />}
              label="Total Logged"
              value={stats.totalLogged}
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-success" />}
              label="Completed"
              value={stats.completed}
            />
            <StatCard
              icon={<SkipForward className="w-5 h-5 text-amber-500" />}
              label="Skipped"
              value={stats.skipped}
            />
            <StatCard
              icon={<BarChart3 className="w-5 h-5 text-primary" />}
              label="Current Streak"
              value={`${stats.currentStreak} days`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Guidance */}
      <Card className="shadow-card bg-primary/5 border-primary/20">
        <CardContent className="py-5">
          <p className="text-sm text-foreground">
            <strong>Target:</strong> Aim for ≥80% compliance (completing at least 6 sessions per week) for the best study outcomes.
            {stats.complianceRate >= 80
              ? " Great job — you're on track! 🎉"
              : " Keep going — every session counts!"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="text-center p-4 rounded-lg border border-border bg-card">
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

export default ComplianceSummary;
