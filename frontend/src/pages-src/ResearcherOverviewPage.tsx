"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users, Activity, CheckCircle, Clock, AlertTriangle,
  ClipboardList, FlaskConical, BarChart3, FileBarChart,
  CalendarDays, ArrowRight, TrendingUp,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ComplianceHeatmap, { type HeatmapDay } from "@/components/researcher/ComplianceHeatmap";

interface Stats {
  total: number;
  active: number;
  onboarding: number;
  completed: number;
  withdrawn: number;
  avgCompliance: number;
  pendingScreenings: number;
  overdueAssessments: number;
}

const ResearcherOverviewPage = () => {
  const { userRole, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    total: 0, active: 0, onboarding: 0, completed: 0, withdrawn: 0,
    avgCompliance: 0, pendingScreenings: 0, overdueAssessments: 0,
  });
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [participantNames, setParticipantNames] = useState<{ id: string; name: string }[]>([]);
  const [maxDay, setMaxDay] = useState(90);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userRole === "researcher") loadStats();
  }, [userRole]);

  const loadStats = async () => {
    try {
      const [participantsRes, screeningsRes, alertsRes] = await Promise.all([
        apiClient.get("/api/participants"),
        apiClient.get("/api/screening"),
        apiClient.get("/api/compliance-alerts"),
      ]);

      const participants = (participantsRes as any[]) || [];
      const active = participants.filter((p: any) => p.status === "active");
      const activeWithCompliance = active.filter((p: any) => p.compliance_rate != null);
      const avgCompliance = activeWithCompliance.length > 0
        ? Math.round(activeWithCompliance.reduce((s, p) => s + Number(p.compliance_rate || 0), 0) / activeWithCompliance.length)
        : 0;

      setStats({
        total: participants.length,
        active: active.length,
        onboarding: participants.filter((p) => p.status === "onboarding").length,
        completed: participants.filter((p) => p.status === "completed").length,
        withdrawn: participants.filter((p) => p.status === "withdrawn").length,
        avgCompliance,
        pendingScreenings: Array.isArray(screeningsRes) ? screeningsRes.length : 0,
        overdueAssessments: Array.isArray(alertsRes) ? alertsRes.length : 0,
      });

      // Load heatmap data for active participants
      if (active.length > 0) {
        const activeIds = active.map((p) => p.id);
        const activeUserIds = active.map((p) => p.user_id);

        const [profilesRes, sessionsRes] = await Promise.all([
          apiClient.get("/api/users/profiles"),
          apiClient.get("/api/therapy-sessions"),
        ]);

        const profileMap: Record<string, string> = {};
        ((profilesRes as any[]) || []).forEach((p: any) => { profileMap[p.user_id] = p.full_name; });

        const names = active.map((p) => ({
          id: p.id,
          name: profileMap[p.user_id] || "Unknown",
        }));
        setParticipantNames(names);

        // Build heatmap days
        const heatDays: HeatmapDay[] = [];
        const sessionMap = new Map<string, Map<number, { logged: boolean; skipped: boolean }>>();

        ((sessionsRes as any[]) || []).forEach((s: any) => {
          if (s.study_day == null) return;
          if (!sessionMap.has(s.participant_id)) sessionMap.set(s.participant_id, new Map());
          sessionMap.get(s.participant_id)!.set(s.study_day, { logged: true, skipped: s.skipped });
        });

        for (const p of active) {
          const pDay = p.study_day ?? 0;
          const sMap = sessionMap.get(p.id) || new Map();
          for (let d = 1; d <= 90; d++) {
            const session = sMap.get(d);
            let status: HeatmapDay["status"] = "upcoming";
            if (d > pDay) status = "upcoming";
            else if (session?.logged && !session.skipped) status = "logged";
            else if (session?.skipped) status = "skipped";
            else if (d <= pDay) status = "missed";

            heatDays.push({
              participantName: names.find((n) => n.id === p.id)?.name || "",
              participantId: p.id,
              day: d,
              status,
            });
          }
        }
        setHeatmapData(heatDays);
        setMaxDay(Math.max(...active.map((p) => p.study_day ?? 0), 7));
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!loading && userRole !== "researcher") {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  if (loading || isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  const quickLinks = [
    { label: "Screening Queue", icon: Users, path: "/researcher/screening", badge: stats.pendingScreenings },
    { label: "Participants", icon: ClipboardList, path: "/researcher/participants" },
    { label: "Assessment Rates", icon: BarChart3, path: "/researcher/assessments" },
    { label: "Reports", icon: FileBarChart, path: "/researcher/reports" },
    { label: "Schedule", icon: CalendarDays, path: "/researcher/schedule" },
    { label: "Messages", icon: Activity, path: "/messages" },
  ];

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-heading font-serif font-bold text-foreground">Researcher Overview</h1>
            <p className="text-muted-foreground">Live study summary and quick actions</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users className="w-5 h-5" />} label="Total Enrolled" value={stats.total} />
            <StatCard icon={<Activity className="w-5 h-5" />} label="Active" value={stats.active} color="text-primary" />
            <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Completed" value={stats.completed} color="text-primary" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Avg Compliance" value={`${stats.avgCompliance}%`} color="text-primary" />
          </div>

          {/* Alert row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.pendingScreenings > 0 && (
              <Card className="border-accent cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => router.push("/researcher/screening")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{stats.pendingScreenings} Pending</div>
                    <div className="text-xs text-muted-foreground">Screening reviews</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {stats.onboarding > 0 && (
              <Card className="border-secondary">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{stats.onboarding} Onboarding</div>
                    <div className="text-xs text-muted-foreground">In progress</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {stats.overdueAssessments > 0 && (
              <Card className="border-destructive cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => router.push("/researcher/participants")}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{stats.overdueAssessments} Alerts</div>
                    <div className="text-xs text-muted-foreground">Active compliance alerts</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Compliance Heatmap */}
          {participantNames.length > 0 && (
            <Card className="shadow-card mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5" />
                  Compliance Heatmap (Active Participants)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComplianceHeatmap
                  data={heatmapData}
                  participantNames={participantNames}
                  maxDay={maxDay}
                />
              </CardContent>
            </Card>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Card
                key={link.path}
                className="cursor-pointer hover:shadow-elevated transition-shadow relative"
                onClick={() => router.push(link.path)}
              >
                {link.badge != null && link.badge > 0 && (
                  <Badge variant="destructive" className="absolute top-3 right-3">{link.badge}</Badge>
                )}
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{link.label}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
  <Card className="shadow-card">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <div className={`text-2xl font-bold ${color || "text-foreground"}`}>{value}</div>
    </CardContent>
  </Card>
);

export default ResearcherOverviewPage;
