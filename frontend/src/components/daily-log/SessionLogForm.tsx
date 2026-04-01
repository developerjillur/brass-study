"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertTriangle, Sun } from "lucide-react";
import type { ParticipantInfo } from "@/pages-src/DailyLogPage";

interface SessionLogFormProps {
  participant: ParticipantInfo;
  userId: string;
  todayLogged: boolean;
  onSessionLogged: () => void;
}

const APPLICATION_POINTS = ["Navel", "Wrist"];

const SessionLogForm = ({ participant, userId, todayLogged, onSessionLogged }: SessionLogFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | "">("");
  const [bodyArea, setBodyArea] = useState("");
  const [notes, setNotes] = useState("");

  if (todayLogged) {
    return (
      <Card className="shadow-card border-success/30 bg-success/5">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Today's Session Logged</h3>
          <p className="text-muted-foreground">
            You've already submitted your therapy log for today. Check the History tab to review it.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
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
      const today = new Date().toISOString().split("T")[0];

      const result = await apiClient.post("/api/therapy-sessions", {
        participant_id: participant.id,
        user_id: userId,
        session_date: today,
        study_day: participant.study_day,
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


      // Update compliance rate on participant
      const sessions = await apiClient.get("/api/therapy-sessions").catch(() => []);

      if (sessions) {
        const totalDays = sessions.length;
        const completedDays = sessions.filter((s) => !s.skipped).length;
        const complianceRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

          await apiClient.put(`/api/participants/${participant.id}`, {
          compliance_rate: complianceRate,
          study_day: (participant.study_day ?? 0) + 1,
        });
      }

      onSessionLogged();
    } catch (error: any) {
      toast({ title: "Error saving session", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sun className="w-5 h-5 text-accent" />
          Log Today's Session
        </CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skip toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
          <div>
            <Label className="text-base font-semibold">Did you skip today's session?</Label>
            <p className="text-sm text-muted-foreground mt-1">
              It's okay — just let us know why.
            </p>
          </div>
          <Switch checked={skipped} onCheckedChange={setSkipped} />
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
              <p className="text-sm text-muted-foreground">Typical sessions are 20–30 minutes.</p>
            </div>

            {/* Application Point — NAVEL / WRIST toggle */}
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
          disabled={isSubmitting}
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
