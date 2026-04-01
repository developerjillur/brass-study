"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, SkipForward, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  session_date: string;
  study_day: number | null;
  duration_minutes: number;
  body_area: string | null;
  notes: string | null;
  skipped: boolean;
  skip_reason: string | null;
}

const SessionHistory = ({ participantId }: { participantId: string }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lateNoteSessionId, setLateNoteSessionId] = useState<string | null>(null);
  const [lateNoteText, setLateNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, [participantId]);

  const loadSessions = async () => {
    const data = await apiClient.get("/api/therapy-sessions/mine").catch(() => []);

    setSessions((data as Session[]) || []);
    setIsLoading(false);
  };

  const handleSaveLateNote = async (sessionId: string) => {
    if (!lateNoteText.trim()) return;
    setSavingNote(true);
    
    const session = sessions.find((s) => s.id === sessionId);
    const existingNotes = session?.notes || "";
    const timestamp = new Date().toLocaleString();
    const updatedNotes = existingNotes
      ? `${existingNotes}\n\n[Late note added ${timestamp}]: ${lateNoteText.trim()}`
      : `[Late note added ${timestamp}]: ${lateNoteText.trim()}`;

    try {
      await apiClient.put(`/api/therapy-sessions/${sessionId}`, { notes: updatedNotes });
      toast({ title: "Late note saved!" });
      setLateNoteSessionId(null);
      setLateNoteText("");
      loadSessions();
    } catch {
      toast({ title: "Error saving note", variant: "destructive" });
    }
    setSavingNote(false);
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

  if (sessions.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Sessions Yet</h3>
          <p className="text-muted-foreground">Your therapy session history will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl">Session History</CardTitle>
        <CardDescription>Last 30 sessions • You can add a late note to any past day</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${
                  session.skipped
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {new Date(session.session_date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {session.study_day != null && (
                      <span className="text-xs text-muted-foreground">Day {session.study_day}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {session.skipped ? (
                      <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-100">
                        <SkipForward className="w-3 h-3 mr-1" />
                        Skipped
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-primary border-primary/30">
                        <Clock className="w-3 h-3 mr-1" />
                        {session.duration_minutes} min
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setLateNoteSessionId(lateNoteSessionId === session.id ? null : session.id);
                        setLateNoteText("");
                      }}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Add Note
                    </Button>
                  </div>
                </div>

                {session.skipped ? (
                  <p className="text-sm text-muted-foreground italic">
                    Reason: {session.skip_reason || "Not provided"}
                  </p>
                ) : (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Application point: </span>
                    <span className="font-medium">{session.body_area || "—"}</span>
                  </div>
                )}

                {session.notes && (
                  <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground whitespace-pre-wrap">
                    {session.notes}
                  </div>
                )}

                {/* Late note input */}
                {lateNoteSessionId === session.id && (
                  <div className="mt-3 space-y-2 p-3 bg-muted/20 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">
                      Add a late note to this day.
                    </p>
                    <Textarea
                      value={lateNoteText}
                      onChange={(e) => setLateNoteText(e.target.value)}
                      placeholder="How did you feel this day? Any observations..."
                      className="min-h-[60px] text-sm"
                      maxLength={500}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveLateNote(session.id)}
                        disabled={savingNote || !lateNoteText.trim()}
                      >
                        {savingNote ? "Saving..." : "Save Note"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setLateNoteSessionId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SessionHistory;
