"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import LabResultForm from "@/components/lab-results/LabResultForm";
import LabResultHistory from "@/components/lab-results/LabResultHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, History } from "lucide-react";
import { LAB_SCHEDULE, LAB_WINDOW_DAYS } from "@/data/lab-schedule";

const LabResultsPage = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [studyDay, setStudyDay] = useState(0);
  const [labReminder, setLabReminder] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && userRole === "researcher") { router.push("/researcher/overview"); return; }
    if (user) loadParticipant();
  }, [user, loading, userRole]);

  const loadParticipant = async () => {
    if (!user) return;
    const data = await apiClient.get("/api/participants/me").catch(() => []);

    if (!data || !data.onboarding_completed || data.status !== "active") {
      toast({ title: "Finish 'Join the Study' first", description: "Complete your intake form and baseline steps on the dashboard to unlock this page." });
      router.push("/dashboard");
      return;
    }
    setParticipantId(data.id);
    const day = data.study_day ?? 0;
    setStudyDay(day);

    // Check for lab entry reminders using LAB_SCHEDULE
    for (const lab of LAB_SCHEDULE) {
      if (day >= lab.studyDay - LAB_WINDOW_DAYS && day <= lab.studyDay + LAB_WINDOW_DAYS) {
        setLabReminder(`${lab.label} results are due. Please submit your latest renal function panel.`);
        break;
      }
    }

    setIsLoading(false);
  };

  if (loading || isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-heading font-serif font-bold text-foreground mb-1">Lab Results</h1>
            <p className="text-muted-foreground">Submit and track your renal function panel results</p>
          </div>

          {labReminder && (
            <div className="mb-6 p-4 bg-accent/10 rounded-xl border border-accent/30 flex items-center gap-3">
              <FlaskConical className="w-5 h-5 text-accent flex-shrink-0" />
              <p className="text-sm font-medium text-foreground">{labReminder}</p>
            </div>
          )}

          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> Submit Results
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <LabResultForm
                participantId={participantId!}
                userId={user!.id}
                onSubmitted={() => { setRefreshKey((k) => k + 1); toast({ title: "Lab results submitted!" }); }}
              />
            </TabsContent>
            <TabsContent value="history">
              <LabResultHistory participantId={participantId!} refreshKey={refreshKey} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LabResultsPage;
