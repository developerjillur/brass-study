"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import PublicLayout from "@/components/PublicLayout";
import CalendlyWidget from "@/components/messages/CalendlyWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CalendarDays } from "lucide-react";

const SchedulePage = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (userRole === "researcher") { router.push("/researcher/schedule"); return; }
    if (user) loadCalendlyUrl();
  }, [user, loading, userRole]);

  const loadCalendlyUrl = async () => {
    try {
      const setting = await apiClient.get("/api/study-settings/calendly_url");
      if (setting?.setting_value) setCalendlyUrl(setting.setting_value);
    } catch {}
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
                Schedule a Meeting
              </h1>
              <p className="text-muted-foreground">
                Book a check-in meeting with the research team
              </p>
            </div>
          </div>

          {!calendlyUrl ? (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center space-y-4">
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto" />
                <h2 className="text-xl font-semibold text-foreground">Scheduling Not Available</h2>
                <p className="text-muted-foreground">
                  The research team hasn't set up a scheduling link yet. Please send them a message through the portal to coordinate a meeting time.
                </p>
                <Button onClick={() => router.push("/messages")}>
                  Message Research Team
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="shadow-card mb-4">
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">
                    Click below to open the scheduler and pick a time that works for you. You can book, reschedule, or cancel directly through this calendar.
                  </p>
                </CardContent>
              </Card>

              <CalendlyWidget calendlyUrl={calendlyUrl} />
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default SchedulePage;
