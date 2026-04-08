"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertTriangle, Sun, CalendarDays, Info } from "lucide-react";
import type { ParticipantInfo } from "@/pages-src/DailyLogPage";

interface SessionLogFormProps {
  participant: ParticipantInfo;
  userId: string;
  todayLogged: boolean;
  loggedDates?: string[];
  prescribedMinutes?: number | null;
  onSessionLogged: () => void;
}

const APPLICATION_POINTS = ["Navel", "Left Wrist"];

const SessionLogForm = ({ participant, userId, todayLogged, loggedDates = [], prescribedMinutes, onSessionLogged }: SessionLogFormProps) => {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");
  const [bodyArea, setBodyArea] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionDate, setSessionDate] = useState(today);
  const [showPastDateForm, setShowPastDateForm] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Calculate the study start date and min date for date picker
  const studyStartDate = participant.study_start_date
    ? new Date(participant.study_start_date).toISOString().split("T")[0]
    : today;

  const isDateAlreadyLogged = loggedDates.includes(sessionDate);

  // Calculate study day for the selected date
  const getStudyDayForDate = (dateStr: string): number => {
    if (!participant.study_start_date) return participant.study_day ?? 0;
    const start = new Date(participant.study_start_date);
    const selected = new Date(dateStr);
    const diffMs = selected.getTime() - start.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    if (!sessionDate) {
      toast({ title: "Please select a session date", variant: "destructive" });
      return;
    }
    if (isDateAlreadyLogged) {
      toast({ title: "A session has already been logged for this date", variant: "destructive" });
      return;
    }
    if (!skipped && !bodyArea) {
      toast({ title: "Please select the application point used", variant: "destructive" });
      return;
    }
    if (!skipped && (durationMinutes === "" || durationMinutes <= 0)) {
      toast({ title: "Please enter the minutes used", variant: "destructive" });
      return;
    }
    if (skipped && !skipReason.trim()) {
      toast({ title: "Please provide a reason for skipping", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const studyDayForDate = getStudyDayForDate(sessionDate);

      await apiClient.post("/api/therapy-sessions", {
        participant_id: participant.id,
        user_id: userId,
        session_date: sessionDate,
        study_day: studyDayForDate,
        duration_minutes: skipped ? 0 : (durationMinutes as number),
        body_area: skipped ? null : bodyArea,
        pain_level_before: null,
        pain_level_after: null,
        fatigue_level: null,
        side_effects: null,
        notes: notes.trim() || null,
        skipped,
        skip_reason: skipped ? skipReason.trim() : null,
      });

      // Update compliance rate
      const sessions = await apiClient.get("/api/therapy-sessions/mine").catch(() => []);
      if (Array.isArray(sessions) && sessions.length > 0) {
        const totalDays = sessions.length;
        const completedDays = sessions.filter((s: any) => !s.skipped).length;
        const complianceRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
        await apiClient.put(`/api/participants/${participant.id}`, {
          compliance_rate: complianceRate,
        }).catch(() => {});
      }

      // Reset form
      setSkipped(false);
      setSkipReason("");
      setDurationMinutes("");
      setBodyArea("");
      setNotes("");
      setSessionDate(today);
      setShowPastDateForm(false);
      setJustSubmitted(true);

      const dateLabel = sessionDate === today ? "today" : sessionDate;
      toast({ title: "Session logged!", description: `Your therapy session for ${dateLabel} has been recorded.` });
      onSessionLogged();
    } catch (error: any) {
      toast({ title: "Error saving session", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If today is logged and user hasn't opened the past-date form, show success + option to log past dates
  if (todayLogged && !showPastDateForm && !justSubmitted) {
    return (
      <div className="space-y-4">
        <Card className="shadow-card border-success/30 bg-success/5">
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">Today's Session Logged</h3>
            <p className="text-muted-foreground">
              You've already submitted your therapy log for today. Check the History tab to review it.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-dashed">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Need to log a missed day?</p>
                  <p className="text-sm text-muted-foreground">You can submit a session log for a previous date.</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPastDateForm(true);
                  setSessionDate("");
                }}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Log a Past Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If just submitted a past date, show success + option to log another
  if (justSubmitted) {
    return (
      <div className="space-y-4">
        <Card className="shadow-card border-success/30 bg-success/5">
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="w-14 h-14 text-success mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">Session Logged</h3>
            <p className="text-muted-foreground">Your therapy session has been recorded.</p>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setJustSubmitted(false); setShowPastDateForm(true); setSessionDate(""); }}>
            <CalendarDays className="w-4 h-4 mr-2" />
            Log Another Past Day
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sun className="w-5 h-5 text-accent" />
          {showPastDateForm ? "Log a Past Session" : "Log Today's Session"}
        </CardTitle>
        <CardDescription>
          {showPastDateForm
            ? "Select the date you want to log and fill in the session details."
            : new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Date */}
        {showPastDateForm && (
          <div className="space-y-3">
            <Label htmlFor="session-date" className="text-base font-semibold">
              Session Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="session-date"
              type="date"
              min={studyStartDate}
              max={today}
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="max-w-[250px]"
            />
            {sessionDate && (
              <p className="text-sm text-muted-foreground">
                Study Day {getStudyDayForDate(sessionDate)}
              </p>
            )}
            {isDateAlreadyLogged && sessionDate && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>A session has already been logged for this date.</span>
              </div>
            )}
            {showPastDateForm && (
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Forgot to log a session? No problem — select the date and fill in the details as you remember them.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Skip question */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <Label className="text-base font-semibold block mb-3">Did you skip {showPastDateForm ? "this" : "today's"} session?</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={skipped === false ? "default" : "outline"}
              size="lg"
              onClick={() => setSkipped(false)}
              className="min-h-[48px] text-base font-bold"
            >
              No — I completed my session
            </Button>
            <Button
              type="button"
              variant={skipped === true ? "destructive" : "outline"}
              size="lg"
              onClick={() => setSkipped(true)}
              className="min-h-[48px] text-base font-bold"
            >
              Yes — I skipped it
            </Button>
          </div>
        </div>

        {skipped ? (
          <div className="space-y-3">
            <Label htmlFor="skip-reason" className="text-base font-semibold">
              Reason for skipping <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="skip-reason"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="e.g., Feeling unwell, device issue, traveling..."
              maxLength={500}
              className="min-h-[100px]"
            />
          </div>
        ) : (
          <>
            {/* Minutes used */}
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-base font-semibold">
                Minutes Used for Therapy Session <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={120}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g., 20"
                className="text-lg font-semibold max-w-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                {prescribedMinutes
                  ? `Your prescribed session for today is ${prescribedMinutes} minutes.`
                  : "Typical sessions are 20–30 minutes."}
              </p>
            </div>

            {/* Application Point */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Application Point Used <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {APPLICATION_POINTS.map((point) => (
                  <Button
                    key={point}
                    type="button"
                    variant={bodyArea === point ? "default" : "outline"}
                    size="lg"
                    onClick={() => setBodyArea(point)}
                    className="min-h-[56px] text-lg font-bold"
                  >
                    {point.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-base font-semibold">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations about your therapy today..."
            maxLength={1000}
            className="min-h-[80px]"
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (showPastDateForm && (!sessionDate || isDateAlreadyLogged))}
          className="w-full min-h-[48px] text-base"
          size="lg"
        >
          {isSubmitting ? "Saving..." : skipped ? "Log Skipped Session" : "Submit Session Log"}
        </Button>

        {skipped && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span>Skipped sessions affect your compliance rate.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionLogForm;
