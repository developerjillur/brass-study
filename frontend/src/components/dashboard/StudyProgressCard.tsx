"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface StudyProgressCardProps {
  studyDay: number;
  totalDays?: number;
  sessionMissing: boolean;
  totalLogged: number;
  missedDays: number;
  currentStreak: number;
  complianceRate: number;
}

const StudyProgressCard = ({
  studyDay,
  totalDays = 90,
  sessionMissing,
  totalLogged,
  missedDays,
  currentStreak,
  complianceRate,
}: StudyProgressCardProps) => {
  const router = useRouter();
  const progressPercent = Math.min(Math.round((studyDay / totalDays) * 100), 100);

  return (
    <div className="space-y-6 mb-8">
      {/* Study day progress */}
      <Card className="shadow-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Study Progress</h2>
            <Badge variant="secondary" className="text-sm">
              Day {studyDay} of {totalDays}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">{progressPercent}% complete</p>
        </CardContent>
      </Card>

      {/* Primary CTA */}
      <Button
        onClick={() => router.push("/daily-log")}
        size="xl"
        variant={sessionMissing ? "cta" : "default"}
        className="w-full flex items-center justify-center gap-3"
      >
        {sessionMissing ? (
          <>
            <ClipboardList className="w-6 h-6" />
            Submit Today's Log
          </>
        ) : (
          <>
            <CheckCircle2 className="w-6 h-6" />
            Today's Log Submitted ✓
          </>
        )}
      </Button>

      {/* My Progress card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            My Progress
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem
              label="Sessions Logged"
              value={totalLogged}
              icon={<ClipboardList className="w-4 h-4 text-primary" />}
            />
            <StatItem
              label="Missed Days"
              value={missedDays}
              icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
            />
            <StatItem
              label="Current Streak"
              value={`${currentStreak} days`}
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
            />
            <StatItem
              label="Compliance"
              value={`${complianceRate}%`}
              icon={<CheckCircle2 className={`w-4 h-4 ${complianceRate >= 80 ? "text-success" : "text-destructive"}`} />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <div className="text-center p-3 rounded-lg border border-border bg-muted/30">
    <div className="flex justify-center mb-1">{icon}</div>
    <div className="text-xl font-bold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default StudyProgressCard;
