"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import SessionLogForm from "@/components/daily-log/SessionLogForm";
import SessionHistory from "@/components/daily-log/SessionHistory";
import ComplianceSummary from "@/components/daily-log/ComplianceSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, History, BarChart3, CalendarDays } from "lucide-react";

export interface ParticipantInfo {
  id: string;
  study_start_date: string;
  study_day: number;
}

const DailyLogPage = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [participant, setParticipant] = useState<ParticipantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [todayLogged, setTodayLogged] = useState(false);
  const [loggedDates, setLoggedDates] = useState<string[]>([]);
  const [prescribedMinutes, setPrescribedMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && userRole === "researcher") {
      router.push("/researcher/overview");
      return;
    }
    if (user) loadParticipant();
  }, [user, loading, userRole]);

  const loadParticipant = async () => {
    if (!user) return;

    const data = await apiClient.get("/api/participants/me").catch(() => null);

    if (!data) {
      toast({ title: "Error loading participant data", variant: "destructive" });
      router.push("/dashboard");
      return;
    }

    if (!data.onboarding_completed || data.status !== "active") {
      toast({ title: "Finish 'Join the Study' first", description: "Complete your intake form and baseline steps on the dashboard to unlock this page." });
      router.push("/dashboard");
      return;
    }

    setParticipant({ id: data.id, study_start_date: data.study_start_date!, study_day: data.study_day ?? 0 });

    // Load prescribed duration
    try {
      const rx = await apiClient.get(`/api/blinding/prescribed-duration/${data.id}?studyDay=${data.study_day ?? 1}`);
      if (rx && rx.prescribed_minutes) setPrescribedMinutes(rx.prescribed_minutes);
    } catch { /* no group assigned yet */ }

    // Load all logged dates
    const today = new Date().toISOString().split("T")[0];
    const sessions = await apiClient.get("/api/therapy-sessions/mine").catch(() => []);
    const dates = Array.isArray(sessions) ? sessions.map((s: any) => s.session_date?.split("T")[0]).filter(Boolean) : [];
    setLoggedDates(dates);
    setTodayLogged(dates.includes(today));
    setIsLoading(false);
  };

  const handleSessionLogged = async () => {
    // Reload logged dates
    const sessions = await apiClient.get("/api/therapy-sessions/mine").catch(() => []);
    const dates = Array.isArray(sessions) ? sessions.map((s: any) => s.session_date?.split("T")[0]).filter(Boolean) : [];
    setLoggedDates(dates);
    const today = new Date().toISOString().split("T")[0];
    setTodayLogged(dates.includes(today));
  };

  if (loading || isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading daily log...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!participant) return null;

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-heading font-serif font-bold text-foreground mb-1">
              Daily Therapy Log
            </h1>
            <p className="text-muted-foreground">
              Study Day {participant.study_day ?? 0} • {prescribedMinutes ? `Today's prescribed session: ${prescribedMinutes} minutes` : "Track your daily PBM therapy sessions (typical sessions are 20–30 minutes)"}
            </p>
          </div>

          <Tabs defaultValue="log" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="log" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Today's Log
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Log Past Session
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Compliance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="log">
              <SessionLogForm
                participant={participant}
                userId={user!.id}
                todayLogged={todayLogged}
                loggedDates={loggedDates}
                prescribedMinutes={prescribedMinutes}
                onSessionLogged={handleSessionLogged}
              />
            </TabsContent>

            <TabsContent value="past">
              <SessionLogForm
                participant={participant}
                userId={user!.id}
                todayLogged={todayLogged}
                loggedDates={loggedDates}
                prescribedMinutes={prescribedMinutes}
                onSessionLogged={handleSessionLogged}
                forcePastMode
              />
            </TabsContent>

            <TabsContent value="history">
              <SessionHistory participantId={participant.id} />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceSummary participant={participant} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
};

export default DailyLogPage;
