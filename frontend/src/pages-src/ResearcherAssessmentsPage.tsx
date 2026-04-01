"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Clock, BarChart3 } from "lucide-react";
import { ASSESSMENT_SCHEDULE } from "@/data/assessment-schedule";

interface ParticipantAssessmentData {
  participantId: string;
  name: string;
  studyDay: number;
  status: string;
  completedTimePoints: string[];
}

const TIME_POINTS = ASSESSMENT_SCHEDULE.map((s) => ({
  timePoint: s.timePoint,
  label: s.label,
  studyDay: s.studyDay,
}));

const ResearcherAssessmentsPage = () => {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<ParticipantAssessmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userRole === "researcher") fetchData();
  }, [userRole]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch active/completed participants
      const participants = await apiClient.get("/api/participants").catch(() => []);

      const userIds = (participants ?? []).map((p: any) => p.user_id);
      const pIds = (participants ?? []).map((p: any) => p.id);

      // Fetch profiles and assessment responses in parallel
      const [profilesData, assessmentsData] = await Promise.all([
        apiClient.get("/api/users/profiles").catch(() => []),
        apiClient.get("/api/assessments").catch(() => []),
      ]);

      const nameMap: Record<string, string> = {};
      (profilesData ?? []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });

      // Group completed time points by participant
      const completedMap: Record<string, Set<string>> = {};
      (assessmentsData ?? []).filter((a: any) => a.time_point !== "baseline").forEach((a: any) => {
        if (!completedMap[a.participant_id]) completedMap[a.participant_id] = new Set();
        completedMap[a.participant_id].add(a.time_point);
      });

      const rows: ParticipantAssessmentData[] = (participants ?? []).map((p: any) => ({
        participantId: p.id,
        name: nameMap[p.user_id] || "Unknown",
        studyDay: p.study_day ?? 0,
        status: p.status,
        completedTimePoints: Array.from(completedMap[p.id] ?? []),
      }));

      setData(rows);
    } catch (err: any) {
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!loading && userRole !== "researcher") {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Compute summary stats
  const completionByTimePoint = TIME_POINTS.map((tp) => {
    // Only count participants who have reached this study day (or are past it)
    const eligible = data.filter((d) => d.studyDay >= tp.studyDay - 3);
    const completed = eligible.filter((d) => d.completedTimePoints.includes(tp.timePoint));
    return {
      ...tp,
      eligible: eligible.length,
      completed: completed.length,
      rate: eligible.length > 0 ? Math.round((completed.length / eligible.length) * 100) : 0,
    };
  });

  const overallCompleted = data.reduce((sum, d) => sum + d.completedTimePoints.length, 0);
  const overallExpected = data.reduce((sum, d) => {
    return sum + TIME_POINTS.filter((tp) => d.studyDay >= tp.studyDay - 3).length;
  }, 0);
  const overallRate = overallExpected > 0 ? Math.round((overallCompleted / overallExpected) * 100) : 0;

  return (
    <PublicLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-heading font-serif font-bold text-foreground mb-1">
                Assessment Completion Rates
              </h1>
              <p className="text-body text-muted-foreground">
                Track follow-up questionnaire completion across all participants
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{data.length}</div>
                <p className="text-sm text-muted-foreground">Eligible Participants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{overallRate}%</div>
                <p className="text-sm text-muted-foreground">Overall Completion Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">
                  {overallCompleted}/{overallExpected}
                </div>
                <p className="text-sm text-muted-foreground">Assessments Completed / Expected</p>
              </CardContent>
            </Card>
          </div>

          {/* Per-timepoint completion */}
          <Card className="shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Completion by Time Point
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completionByTimePoint.map((tp) => (
                  <div key={tp.timePoint} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-foreground">{tp.label}</div>
                    <div className="text-xs text-muted-foreground w-16">Day {tp.studyDay}</div>
                    <Progress value={tp.rate} className="flex-1 h-3" />
                    <div className="w-24 text-right text-sm">
                      <span className="font-bold text-foreground">{tp.rate}%</span>
                      <span className="text-muted-foreground ml-1">
                        ({tp.completed}/{tp.eligible})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Per-participant table */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Per-Participant Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : data.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No eligible participants yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead>Day</TableHead>
                        {TIME_POINTS.map((tp) => (
                          <TableHead key={tp.timePoint} className="text-center whitespace-nowrap">
                            {tp.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow key={row.participantId}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>{row.studyDay}</TableCell>
                          {TIME_POINTS.map((tp) => {
                            const completed = row.completedTimePoints.includes(tp.timePoint);
                            const eligible = row.studyDay >= tp.studyDay - 3;
                            const overdue = eligible && !completed && row.studyDay > tp.studyDay + 3;
                            return (
                              <TableCell key={tp.timePoint} className="text-center">
                                {completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                                ) : overdue ? (
                                  <Badge variant="destructive" className="text-[10px] px-1.5">
                                    Missed
                                  </Badge>
                                ) : eligible ? (
                                  <Clock className="w-5 h-5 text-amber-500 mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ResearcherAssessmentsPage;
