"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, List, CalendarDays } from "lucide-react";
import { ASSESSMENT_SCHEDULE, ASSESSMENT_WINDOW_DAYS } from "@/data/assessment-schedule";
import { LAB_SCHEDULE, LAB_WINDOW_DAYS } from "@/data/lab-schedule";
import TimelineList, { type TimelineEvent } from "@/components/timeline/TimelineList";
import CalendarGrid, { type DaySession } from "@/components/timeline/CalendarGrid";

const MILESTONES = [
  { day: 1, label: "Study Start" },
  { day: 42, label: "Midpoint (Week 6)" },
  { day: 84, label: "Study End (Week 12)" },
];

const StudyTimelinePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [studyDay, setStudyDay] = useState(0);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [sessions, setSessions] = useState<DaySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const totalDays = 84;

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (user) loadTimeline();
  }, [user, loading]);

  const loadTimeline = async () => {
    if (!user) return;

    const participant = await apiClient.get("/api/participants/me").catch(() => []);

    if (!participant || !participant.onboarding_completed) {
      router.push("/dashboard");
      return;
    }

    const day = participant.study_day ?? 0;
    setStudyDay(day);

    // Parallel data fetches
    const [assessmentsData, labsData, sessionsData] = await Promise.all([
      apiClient.get("/api/assessments").catch(() => []),
      apiClient.get("/api/renal-panels").catch(() => []),
      apiClient.get("/api/therapy-sessions").catch(() => []),
    ]);

    const completedTPs = [...new Set((assessmentsData ?? []).filter((r: any) => r.time_point !== "baseline").map((r: any) => r.time_point))];
    const labDates = (labsData ?? []).filter((l: any) => l.submission_type === "follow_up").map((l: any) => l.lab_date).filter(Boolean) as string[];

    // Build session map for calendar
    const daySessions: DaySession[] = (sessionsData ?? [])
      .filter((s: any) => s.study_day != null)
      .map((s: any) => ({
        day: s.study_day!,
        logged: true,
        skipped: s.skipped,
      }));
    setSessions(daySessions);

    // Build timeline events
    const timelineEvents: TimelineEvent[] = [];

    for (const m of MILESTONES) {
      timelineEvents.push({
        day: m.day, label: m.label, type: "milestone",
        status: day >= m.day ? "completed" : "upcoming",
      });
    }

    for (const sched of ASSESSMENT_SCHEDULE) {
      const isCompleted = completedTPs.includes(sched.timePoint);
      const inWindow = day >= sched.studyDay - ASSESSMENT_WINDOW_DAYS && day <= sched.studyDay + ASSESSMENT_WINDOW_DAYS;
      const overdue = !isCompleted && day > sched.studyDay + ASSESSMENT_WINDOW_DAYS;
      timelineEvents.push({
        day: sched.studyDay, label: sched.label, type: "assessment",
        status: isCompleted ? "completed" : overdue ? "overdue" : inWindow ? "due" : "upcoming",
        detail: `${sched.assessments.length} questionnaire${sched.assessments.length > 1 ? "s" : ""}`,
      });
    }

    for (const lab of LAB_SCHEDULE) {
      const inWindow = day >= lab.studyDay - LAB_WINDOW_DAYS && day <= lab.studyDay + LAB_WINDOW_DAYS;
      const overdue = day > lab.studyDay + LAB_WINDOW_DAYS;
      const startDate = participant.study_start_date;
      let hasSubmission = false;
      if (startDate) {
        const start = new Date(startDate);
        const windowStart = new Date(start);
        windowStart.setDate(windowStart.getDate() + lab.studyDay - LAB_WINDOW_DAYS);
        const windowEnd = new Date(start);
        windowEnd.setDate(windowEnd.getDate() + lab.studyDay + LAB_WINDOW_DAYS);
        hasSubmission = labDates.some((d) => {
          const date = new Date(d);
          return date >= windowStart && date <= windowEnd;
        });
      }
      timelineEvents.push({
        day: lab.studyDay, label: lab.label, type: "lab",
        status: hasSubmission ? "completed" : overdue ? "overdue" : inWindow ? "due" : "upcoming",
        detail: "Renal function panel",
      });
    }

    timelineEvents.sort((a, b) => a.day - b.day);
    setEvents(timelineEvents);
    setIsLoading(false);
  };

  if (loading || isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  const progressPercent = Math.min(100, Math.round((studyDay / totalDays) * 100));

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-heading font-serif font-bold text-foreground">
                My Study Timeline
              </h1>
              <p className="text-muted-foreground">
                Day {studyDay} of {totalDays} • {progressPercent}% complete
              </p>
            </div>
          </div>

          <Card className="shadow-card mb-8">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Study Progress</span>
                <span className="text-sm font-bold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Day 1</span>
                <span>Week 6</span>
                <span>Week 12</span>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                90-Day Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Event Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <CalendarGrid
                    totalDays={totalDays}
                    studyDay={studyDay}
                    sessions={sessions}
                    events={events}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list">
              <TimelineList events={events} studyDay={studyDay} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
};

export default StudyTimelinePage;
