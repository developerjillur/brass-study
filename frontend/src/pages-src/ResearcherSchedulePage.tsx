"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { ASSESSMENT_SCHEDULE, ASSESSMENT_WINDOW_DAYS } from "@/data/assessment-schedule";
import { LAB_SCHEDULE, LAB_WINDOW_DAYS } from "@/data/lab-schedule";

interface ParticipantScheduleRow {
  id: string;
  name: string;
  studyDay: number;
  status: string;
  studyStartDate: string | null;
  completedAssessments: string[];
  labDates: string[];
}

// All schedule columns: assessments + labs
const SCHEDULE_COLS = [
  ...ASSESSMENT_SCHEDULE.map((s) => ({
    key: `a_${s.timePoint}`,
    label: s.label,
    day: s.studyDay,
    type: "assessment" as const,
    window: ASSESSMENT_WINDOW_DAYS,
    timePoint: s.timePoint,
  })),
  ...LAB_SCHEDULE.map((l) => ({
    key: `l_${l.timePoint}`,
    label: l.label,
    day: l.studyDay,
    type: "lab" as const,
    window: LAB_WINDOW_DAYS,
    timePoint: l.timePoint,
  })),
].sort((a, b) => a.day - b.day);

const ResearcherSchedulePage = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = useState<ParticipantScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && userRole === "researcher") loadData();
  }, [user, userRole]);

  const loadData = async () => {
    const participants = await apiClient.get("/api/participants").catch(() => []);

    if (!participants || participants.length === 0) {
      setIsLoading(false);
      return;
    }

    const userIds = participants.map((p) => p.user_id);
    const pIds = participants.map((p) => p.id);

    const [profilesData, assessmentsData, labsData] = await Promise.all([
      apiClient.get("/api/users/profiles").catch(() => []),
      apiClient.get("/api/assessments").catch(() => []),
      apiClient.get("/api/renal-panels").catch(() => []),
    ]);

    const nameMap: Record<string, string> = {};
    (profilesData ?? []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });

    const assessmentMap: Record<string, Set<string>> = {};
    (assessmentsData ?? []).filter((a: any) => a.time_point !== "baseline").forEach((a: any) => {
      if (!assessmentMap[a.participant_id]) assessmentMap[a.participant_id] = new Set();
      assessmentMap[a.participant_id].add(a.time_point);
    });

    const labMap: Record<string, string[]> = {};
    (labsData ?? []).filter((l: any) => l.submission_type === "follow_up").forEach((l: any) => {
      const uid = l.participant_user_id!;
      if (!labMap[uid]) labMap[uid] = [];
      if (l.lab_date) labMap[uid].push(l.lab_date);
    });

    const result: ParticipantScheduleRow[] = participants.map((p) => ({
      id: p.id,
      name: nameMap[p.user_id] || "Unknown",
      studyDay: p.study_day ?? 0,
      status: p.status,
      studyStartDate: p.study_start_date,
      completedAssessments: Array.from(assessmentMap[p.id] ?? []),
      labDates: labMap[p.user_id] ?? [],
    }));

    setRows(result);
    setIsLoading(false);
  };

  if (!loading && userRole !== "researcher") {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  const getCellStatus = (
    row: ParticipantScheduleRow,
    col: (typeof SCHEDULE_COLS)[0]
  ): "completed" | "due" | "overdue" | "upcoming" => {
    if (col.type === "assessment") {
      if (row.completedAssessments.includes(col.timePoint)) return "completed";
      const inWindow =
        row.studyDay >= col.day - col.window && row.studyDay <= col.day + col.window;
      if (row.studyDay > col.day + col.window) return "overdue";
      if (inWindow) return "due";
      return "upcoming";
    }

    // Lab
    if (row.studyStartDate) {
      const start = new Date(row.studyStartDate);
      const wStart = new Date(start);
      wStart.setDate(wStart.getDate() + col.day - col.window);
      const wEnd = new Date(start);
      wEnd.setDate(wEnd.getDate() + col.day + col.window);
      const hasLab = row.labDates.some((d) => {
        const date = new Date(d);
        return date >= wStart && date <= wEnd;
      });
      if (hasLab) return "completed";
    }

    if (row.studyDay > col.day + col.window) return "overdue";
    const inWindow =
      row.studyDay >= col.day - col.window && row.studyDay <= col.day + col.window;
    if (inWindow) return "due";
    return "upcoming";
  };

  // Summary stats
  const overdueCount = rows.reduce((sum, row) => {
    return sum + SCHEDULE_COLS.filter((col) => getCellStatus(row, col) === "overdue").length;
  }, 0);

  const dueCount = rows.reduce((sum, row) => {
    return sum + SCHEDULE_COLS.filter((col) => getCellStatus(row, col) === "due").length;
  }, 0);

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-heading font-serif font-bold text-foreground">
                Scheduling Overview
              </h1>
              <p className="text-muted-foreground">
                All participant milestones, assessments, and lab submissions
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{rows.length}</div>
                  <p className="text-sm text-muted-foreground">Active Participants</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{dueCount}</div>
                  <p className="text-sm text-muted-foreground">Items Due Now</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
                  <p className="text-sm text-muted-foreground">Overdue Items</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule matrix */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Participant Schedule Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : rows.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active participants yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background z-10">Participant</TableHead>
                        <TableHead>Day</TableHead>
                        {SCHEDULE_COLS.map((col) => (
                          <TableHead key={col.key} className="text-center whitespace-nowrap text-xs">
                            <div>{col.label}</div>
                            <div className="text-[10px] text-muted-foreground font-normal">
                              {col.type === "lab" ? "🧪" : "📋"} D{col.day}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="sticky left-0 bg-background font-medium whitespace-nowrap">
                            {row.name}
                          </TableCell>
                          <TableCell>{row.studyDay}</TableCell>
                          {SCHEDULE_COLS.map((col) => {
                            const status = getCellStatus(row, col);
                            return (
                              <TableCell key={col.key} className="text-center">
                                {status === "completed" ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                                ) : status === "overdue" ? (
                                  <Badge variant="destructive" className="text-[10px] px-1.5">
                                    Missed
                                  </Badge>
                                ) : status === "due" ? (
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

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Completed
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Due Now
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="destructive" className="text-[10px] px-1.5">Missed</Badge> Overdue
            </div>
            <div className="flex items-center gap-1.5">
              <span>—</span> Upcoming
            </div>
            <div className="flex items-center gap-1.5">📋 Assessment</div>
            <div className="flex items-center gap-1.5">🧪 Lab</div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ResearcherSchedulePage;
