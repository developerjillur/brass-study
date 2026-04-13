"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, CalendarDays, ChevronRight, ArrowLeft } from "lucide-react";
import AssessmentForm from "@/components/onboarding/AssessmentForm";
import {
  ASSESSMENT_SCHEDULE,
  ASSESSMENT_WINDOW_DAYS,
  getDueAssessments,
  getNextUpcoming,
  type ScheduledAssessment,
} from "@/data/assessment-schedule";
import type { QuestionnaireDefinition } from "@/data/questionnaires";

const AssessmentsPage = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [studyDay, setStudyDay] = useState<number>(0);
  const [completedTimePoints, setCompletedTimePoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active assessment state
  const [activeSchedule, setActiveSchedule] = useState<ScheduledAssessment | null>(null);
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && userRole === "researcher") { router.push("/researcher/assessments"); return; }
    if (user) init();
  }, [user, loading, userRole]);

  const init = async () => {
    if (!user) return;

    const participant = await apiClient.get("/api/participants/me").catch(() => []);

    if (!participant || !participant.onboarding_completed || participant.status !== "active") {
      toast({ title: "Finish 'Join the Study' first", description: "Complete your intake form and baseline steps on the dashboard to unlock this page." });
      router.push("/dashboard");
      return;
    }

    setParticipantId(participant.id);
    setStudyDay(participant.study_day ?? 0);

    // Load completed follow-up assessments (distinct time_points)
    const completed = await apiClient.get("/api/assessments/mine").catch(() => []);

    const points = [...new Set((completed ?? []).map((r: any) => r.time_point))] as string[];
    setCompletedTimePoints(points);
    setIsLoading(false);
  };

  const dueAssessments = getDueAssessments(studyDay, completedTimePoints);
  const nextUpcoming = getNextUpcoming(studyDay, completedTimePoints);
  const totalScheduled = ASSESSMENT_SCHEDULE.length;
  const completedCount = ASSESSMENT_SCHEDULE.filter((s) =>
    completedTimePoints.includes(s.timePoint)
  ).length;

  const handleStartAssessment = (scheduled: ScheduledAssessment) => {
    setActiveSchedule(scheduled);
    setActiveQIdx(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAssessmentComplete = async (
    questionnaire: QuestionnaireDefinition,
    responses: Record<string, number>,
    totalScore: number,
    subscaleScores?: Record<string, number>
  ) => {
    if (!user || !participantId || !activeSchedule) return;
    setIsSubmitting(true);

    try {
      const result = await apiClient.post("/api/assessments", {
        user_id: user.id,
        participant_id: participantId,
        assessment_type: questionnaire.id,
        time_point: activeSchedule.timePoint,
        study_day: studyDay,
        responses: responses as any,
        total_score: totalScore,
        subscale_scores: subscaleScores ? (subscaleScores as any) : null,
        completed_at: new Date().toISOString(),
      });


      // Move to next questionnaire or finish
      if (activeQIdx < activeSchedule.assessments.length - 1) {
        setActiveQIdx((prev) => prev + 1);
        toast({ title: `${questionnaire.title} completed!` });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // All done for this time point
        setCompletedTimePoints((prev) => [...prev, activeSchedule.timePoint]);
        setActiveSchedule(null);
        setActiveQIdx(0);
        toast({ title: `${activeSchedule.label} assessments completed!` });
      }
    } catch (error: any) {
      toast({ title: "Error saving response", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
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

  // If actively completing an assessment
  if (activeSchedule) {
    const currentQ = activeSchedule.assessments[activeQIdx];
    return (
      <PublicLayout>
        <div className="container py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => { setActiveSchedule(null); setActiveQIdx(0); }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Schedule
            </Button>
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="secondary">{activeSchedule.label}</Badge>
              <span className="text-sm text-muted-foreground">
                Assessment {activeQIdx + 1} of {activeSchedule.assessments.length}
              </span>
            </div>
            <AssessmentForm
              key={`${activeSchedule.timePoint}_${currentQ.id}`}
              questionnaire={currentQ}
              onComplete={(responses, totalScore, subscaleScores) =>
                handleAssessmentComplete(currentQ, responses, totalScore, subscaleScores)
              }
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-heading font-serif font-bold text-foreground mb-1">
              Study Questionnaires
            </h1>
            <p className="text-muted-foreground">
              Study Day {studyDay} • Questionnaires are completed prior to the study and at completion (Day 90)
            </p>
            <Progress value={(completedCount / totalScheduled) * 100} className="mt-3 h-2" />
          </div>

          {/* Due now */}
          {dueAssessments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Due Now
              </h2>
              <div className="space-y-3">
                {dueAssessments.map((scheduled) => (
                  <Card key={scheduled.timePoint} className="border-primary/30 shadow-card">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{scheduled.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {scheduled.assessments.length} questionnaire{scheduled.assessments.length > 1 ? "s" : ""} •
                          Day {scheduled.studyDay} (±{ASSESSMENT_WINDOW_DAYS} days)
                        </p>
                      </div>
                      <Button onClick={() => handleStartAssessment(scheduled)} className="flex items-center gap-2">
                        Start <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {nextUpcoming && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                Next Upcoming
              </h2>
              <Card className="shadow-card">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{nextUpcoming.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Opens on Day {nextUpcoming.studyDay - ASSESSMENT_WINDOW_DAYS} •
                      {nextUpcoming.assessments.length} questionnaire{nextUpcoming.assessments.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge variant="outline">
                    In {nextUpcoming.studyDay - ASSESSMENT_WINDOW_DAYS - studyDay} days
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Completed history */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
              Schedule Overview
            </h2>
            <div className="space-y-2">
              {ASSESSMENT_SCHEDULE.map((scheduled) => {
                const isCompleted = completedTimePoints.includes(scheduled.timePoint);
                const isDue = dueAssessments.some((d) => d.timePoint === scheduled.timePoint);
                return (
                  <div
                    key={scheduled.timePoint}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isCompleted
                        ? "bg-primary/5 border-primary/20"
                        : isDue
                        ? "bg-accent/50 border-accent"
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : isDue ? (
                        <Clock className="w-5 h-5 text-accent-foreground" />
                      ) : (
                        <CalendarDays className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <span className="font-medium text-foreground">{scheduled.label}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Day {scheduled.studyDay}
                        </span>
                      </div>
                    </div>
                    {isCompleted && <Badge variant="default">Completed</Badge>}
                    {isDue && <Badge variant="secondary">Due</Badge>}
                    {!isCompleted && !isDue && (
                      <span className="text-xs text-muted-foreground">Upcoming</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AssessmentsPage;
