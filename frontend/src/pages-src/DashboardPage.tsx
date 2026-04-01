"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, ClipboardList, FlaskConical, MessageSquare, User, Users, PlayCircle, FileText, AlertTriangle, BarChart3, FileBarChart, CalendarDays } from "lucide-react";
import { getDueAssessments } from "@/data/assessment-schedule";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ComplianceAlerts } from "@/components/ComplianceAlerts";
import StudyProgressCard from "@/components/dashboard/StudyProgressCard";

const DashboardPage = () => {
  const { user, userRole, signOut } = useAuth();
  const router = useRouter();
  const [onboardingNeeded, setOnboardingNeeded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dueAssessmentCount, setDueAssessmentCount] = useState(0);
  const [sessionMissing, setSessionMissing] = useState(false);
  const [studyDay, setStudyDay] = useState(0);
  const [userName, setUserName] = useState("");
  const [progressStats, setProgressStats] = useState({
    totalLogged: 0,
    missedDays: 0,
    currentStreak: 0,
    complianceRate: 0,
  });

  useEffect(() => {
    if (user) {
      apiClient.get("/api/users/me/profile")
        .then((data: any) => { if (data?.full_name) setUserName(data.full_name); })
        .catch(() => {});
    }
    if (user && userRole === "participant") {
      apiClient.get("/api/participants/me")
        .then(async (data: any) => {
          if (data && !data.onboarding_completed) {
            setOnboardingNeeded(true);
          }
          if (data && data.onboarding_completed && data.study_day != null) {
            setStudyDay(data.study_day);

            const completed = await apiClient.get("/api/assessments/mine").catch(() => []);
            const completedPoints = [...new Set((completed ?? []).map((r: any) => r.time_point))] as string[];
            const due = getDueAssessments(data.study_day, completedPoints);
            setDueAssessmentCount(due.length);

            if (data.status === "active") {
              const sessions = await apiClient.get("/api/therapy-sessions/mine").catch(() => []);
              const today = new Date().toISOString().split("T")[0];
              const todaySessions = (sessions ?? []).filter((s: any) => s.session_date === today);
              setSessionMissing(todaySessions.length === 0);

              if (sessions) {
                const totalLogged = sessions.length;
                const completedSessions = sessions.filter((s: any) => !s.skipped).length;
                const missedDays = sessions.filter((s: any) => s.skipped).length;
                const complianceRate = totalLogged > 0 ? Math.round((completedSessions / totalLogged) * 100) : 0;
                let currentStreak = 0;
                for (const s of sessions) {
                  if (!s.skipped) currentStreak++;
                  else break;
                }
                setProgressStats({ totalLogged, missedDays, currentStreak, complianceRate });
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [user, userRole]);

  useEffect(() => {
    if (!user || userRole !== "participant") return;

    const fetchUnread = async () => {
      try {
        const messages = await apiClient.get("/api/messages");
        const unread = (messages as any[] ?? []).filter((m: any) => !m.is_read && m.recipient_id === user.id);
        setUnreadCount(unread.length);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnread();


  }, [user, userRole]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <PublicLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-heading font-serif font-bold text-foreground">
                {userName ? `Welcome, ${userName.split(" ")[0]}!` : "Welcome back!"}
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                {user?.email} • <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">{userRole === "researcher" ? "Researcher" : "Participant"}</span>
              </p>
            </div>
            <Button variant="outline" size="default" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Onboarding banner — participant only */}
          {onboardingNeeded && userRole === "participant" && (
            <div className="mb-6 p-5 bg-primary/5 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Join the Study</h2>
                <p className="text-sm text-muted-foreground">
                  Sign the IRB consent and complete baseline assessments to activate your study dashboard.
                </p>
              </div>
              <Button onClick={() => router.push("/onboarding")} className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Get Started
              </Button>
            </div>
          )}

          {/* My Profile & Study Timeline — very top */}
          {userRole === "participant" && (
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              <div
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => router.push("/profile")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") router.push("/profile"); }}
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">My Profile</span>
              </div>
              <div
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => router.push("/study-timeline")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") router.push("/study-timeline"); }}
              >
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Study Timeline</span>
              </div>
            </div>
          )}

          {/* Study progress (participant only) */}
          {!onboardingNeeded && userRole === "participant" && studyDay > 0 && (
            <StudyProgressCard
              studyDay={studyDay}
              sessionMissing={sessionMissing}
              totalLogged={progressStats.totalLogged}
              missedDays={progressStats.missedDays}
              currentStreak={progressStats.currentStreak}
              complianceRate={progressStats.complianceRate}
            />
          )}

          {/* Participant feature cards */}
          {userRole === "participant" && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <DashCard
                  icon={<ClipboardList className="w-7 h-7" />}
                  title="Daily Log"
                  description="Submit your therapy session log for today."
                  onClick={() => router.push("/daily-log")}
                />
                <DashCard
                  icon={<FlaskConical className="w-7 h-7" />}
                  title="Lab Results"
                  description="Enter your latest renal function panel results."
                  onClick={() => router.push("/lab-results")}
                />
                <DashCard
                  icon={<FileText className="w-7 h-7" />}
                  title="Study Questionnaires"
                  description="Complete questionnaires at the start and end of the study."
                  onClick={() => router.push("/assessments")}
                  badge={dueAssessmentCount > 0 ? dueAssessmentCount : undefined}
                />
                <DashCard
                  icon={<MessageSquare className="w-7 h-7" />}
                  title="Messages"
                  description="View messages from the researcher."
                  onClick={() => router.push("/messages")}
                  badge={unreadCount > 0 ? unreadCount : undefined}
                />
              </div>
            </>
          )}

          {/* Researcher dashboard */}
          {userRole === "researcher" && (
            <>
              <ComplianceAlerts />

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <DashCard
                  icon={<BarChart3 className="w-7 h-7" />}
                  title="Overview Home"
                  description="Study statistics, alerts, and compliance heatmap."
                  onClick={() => router.push("/researcher/overview")}
                />
                <DashCard
                  icon={<Users className="w-7 h-7" />}
                  title="Screening Queue"
                  description="Review and process screening submissions."
                  onClick={() => router.push("/researcher/screening")}
                />
                <DashCard
                  icon={<ClipboardList className="w-7 h-7" />}
                  title="Participant Management"
                  description="Manage enrolled participants and study data."
                  onClick={() => router.push("/researcher/participants")}
                />
                <DashCard
                  icon={<MessageSquare className="w-7 h-7" />}
                  title="Messages"
                  description="Communicate with study participants."
                  onClick={() => router.push("/messages")}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <div
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push("/researcher/assessments")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push("/researcher/assessments"); }}
                >
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Assessment Rates</span>
                </div>
                <div
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push("/researcher/reports")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push("/researcher/reports"); }}
                >
                  <FileBarChart className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Dissertation Reports</span>
                </div>
                <div
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push("/researcher/schedule")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push("/researcher/schedule"); }}
                >
                  <CalendarDays className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Scheduling</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

const DashCard = ({
  icon, title, description, disabled, label, badge, onClick,
}: {
  icon: React.ReactNode; title: string; description: string;
  disabled?: boolean; label?: string; badge?: number; onClick?: () => void;
}) => (
  <div
    className={`card-interactive ${disabled ? "opacity-60 cursor-default" : "cursor-pointer"} relative group`}
    onClick={disabled ? undefined : onClick}
    role={onClick && !disabled ? "button" : undefined}
    tabIndex={onClick && !disabled ? 0 : undefined}
    onKeyDown={onClick && !disabled ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
    aria-disabled={disabled}
  >
    {badge != null && badge > 0 && (
      <Badge variant="destructive" className="absolute top-3 right-3 min-w-[22px] justify-center animate-in zoom-in">
        {badge}
      </Badge>
    )}
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0 group-hover:bg-primary/15 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        {label && (
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
            {label}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default DashboardPage;
