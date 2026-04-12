"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Eye, Filter, Activity, CheckCircle, Clock, XCircle,
  ClipboardList, FlaskConical, MessageSquare, TrendingUp, ArrowLeft, Download, KeyRound,
} from "lucide-react";
import { downloadCsv } from "@/lib/csv-export";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

interface Participant {
  id: string;
  user_id: string;
  status: string;
  study_day: number | null;
  compliance_rate: number | null;
  group_assignment: string | null;
  enrolled_at: string | null;
  study_start_date: string | null;
  onboarding_completed: boolean;
  researcher_notes: string | null;
  created_at: string;
}

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
}

interface TherapySession {
  id: string;
  session_date: string;
  duration_minutes: number;
  body_area: string | null;
  pain_level_before: number | null;
  pain_level_after: number | null;
  fatigue_level: number | null;
  skipped: boolean;
  skip_reason: string | null;
  side_effects: string | null;
  notes: string | null;
  study_day: number | null;
}

interface AssessmentResponse {
  id: string;
  assessment_type: string;
  time_point: string;
  total_score: number | null;
  subscale_scores: any;
  completed_at: string | null;
  study_day: number | null;
  created_at: string;
}

interface RenalPanel {
  id: string;
  ckd_stage: string;
  egfr: number | null;
  creatinine: number | null;
  bun: number | null;
  calcium: number | null;
  phosphorus: number | null;
  albumin: number | null;
  lab_date: string | null;
  submission_type: string;
  created_at: string;
}

interface Message {
  id: string;
  body: string;
  subject: string;
  sender_id: string;
  is_read: boolean;
  created_at: string;
}

const ResearcherParticipantsPage = () => {
  const { userRole, loading, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<(Participant & { profile?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [exporting, setExporting] = useState(false);
  const [studyUnblinded, setStudyUnblinded] = useState(false);

  // Detail view state
  const [selectedParticipant, setSelectedParticipant] = useState<(Participant & { profile?: Profile }) | null>(null);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [renalPanels, setRenalPanels] = useState<RenalPanel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notesText, setNotesText] = useState("");

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      // Check unblinding status
      const settingData = await apiClient.get("/api/study-settings").catch(() => []);
      setStudyUnblinded(settingData?.setting_value === "true");

      const participantsData = await apiClient.get("/api/participants").catch(() => []);


      const pIds = (participantsData || []).map((p) => p.id);
      const userIds = (participantsData || []).map((p) => p.user_id);

      const [profilesData, blindingData] = await Promise.all([
        apiClient.get("/api/users/profiles").catch(() => []),
        apiClient.get("/api/blinding").catch(() => []),
      ]);

      const profileMap: Record<string, Profile> = {};
      ((profilesData as any[]) || []).forEach((p: any) => {
        profileMap[p.user_id] = { full_name: p.full_name, email: p.email, phone: p.phone };
      });

      const blindingMap: Record<string, string> = {};
      ((blindingData as any[]) || []).forEach((b: any) => {
        blindingMap[b.participant_id] = b.group_code;
      });

      const merged = (participantsData || []).map((p) => ({
        ...p,
        group_assignment: blindingMap[p.id] || null,
        profile: profileMap[p.user_id],
      }));

      setParticipants(merged);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load participants.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipantDetails = async (participant: Participant & { profile?: Profile }) => {
    setDetailLoading(true);
    setSelectedParticipant(participant);
    setNotesText(participant.researcher_notes || "");

    try {
      const [sessionsData, assessmentsData, renalData, messagesData] = await Promise.all([
        apiClient.get(`/api/therapy-sessions?participant_id=${participant.id}`).catch(() => []),
        apiClient.get(`/api/assessments?participant_id=${participant.id}`).catch(() => []),
        apiClient.get(`/api/renal-panels?participant_user_id=${participant.user_id}`).catch(() => []),
        apiClient.get(`/api/messages?participant_id=${participant.id}`).catch(() => []),
      ]);

      setSessions((sessionsData as any[]) || []);
      setAssessments((assessmentsData as any[]) || []);
      setRenalPanels((renalData as any[]) || []);
      setMessages(((messagesData as any[]) || []).slice(0, 20));
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedParticipant) return;
    try {
      await apiClient.put(`/api/participants/${selectedParticipant.id}`, { researcher_notes: notesText });
      toast({ title: "Saved", description: "Researcher notes updated." });
      setParticipants((prev) =>
        prev.map((p) => (p.id === selectedParticipant.id ? { ...p, researcher_notes: notesText } : p))
      );
    } catch {
      toast({ title: "Error", description: "Failed to save notes.", variant: "destructive" });
    }
  };

  const updateParticipantStatus = async (participantId: string, newStatus: string) => {
    // If enrolling (setting to active), trigger group assignment
    if (newStatus === "active") {
      await apiClient.post("/api/assign_group", { p_participant_id: participantId });
    }

    try {
      await apiClient.put(`/api/participants/${participantId}`, { status: newStatus });
      toast({ title: "Updated", description: `Participant status changed to ${newStatus}.` });
      fetchParticipants();
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleResendPassword = async (userId: string, name: string, email: string) => {
    const confirmed = window.confirm(
      `Reset the password for "${name}" (${email}) and email a new temporary password?\n\nThey will be required to change it on their next login.`
    );
    if (!confirmed) return;
    try {
      await apiClient.post("/api/invitations/resend-temp-password", { userId });
      toast({ title: "Password reset", description: `New temporary password emailed to ${email}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to reset password.", variant: "destructive" });
    }
  };

  const handleWithdrawAndAnonymize = async (participantId: string, participantName: string) => {
    const confirmed = window.confirm(
      `⚠️ IRREVERSIBLE ACTION\n\nWithdraw "${participantName}" and permanently anonymize all their PHI data?\n\nThis will:\n• Set status to "withdrawn"\n• Replace name/email/phone with anonymous labels\n• Redact intake demographics\n• Log the action in the audit trail\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await apiClient.post(`/api/participants/${participantId}/withdraw-anonymize`);
      toast({ title: "Participant Withdrawn", description: "All PHI has been anonymized per HIPAA requirements." });
      fetchParticipants();
      setSelectedParticipant(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to anonymize.", variant: "destructive" });
    }
  };

  const handleNotifyPlaceboGroup = async () => {
    const confirmed = window.confirm(
      "Send a notification and in-portal message to all placebo group (Group C) participants informing them of their group assignment?\n\nThis will:\n• Create an in-app notification for each placebo participant\n• Send a compassionate message explaining their assignment\n• Offer the option to receive active treatment"
    );
    if (!confirmed) return;

    try {
      const data = await apiClient.post("/api/notifications/notify-placebo-group", {});
      toast({ title: "Notifications Sent", description: (data as any)?.message || "Placebo group has been notified." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send notifications.", variant: "destructive" });
    }
  };

  const handleUnblind = async () => {
    const confirmed = window.confirm(
      "⚠️ IRREVERSIBLE ACTION\n\nAre you sure you want to reveal all group assignments?\n\nThis action cannot be undone. All group assignments will be permanently visible throughout the dashboard."
    );
    if (!confirmed) return;

    const password = window.prompt("Please re-enter your password to confirm:");
    if (!password) return;

    // Verify password and unblind via API
    try {
      await apiClient.post("/api/blinding/unblind", {
        email: user?.email || "",
        password,
      });
    } catch {
      toast({ title: "Authentication failed", description: "Incorrect password or unblinding failed.", variant: "destructive" });
      return;
    }

    setStudyUnblinded(true);
    toast({ title: "Study Unblinded", description: "All group assignments are now visible." });
    fetchParticipants();
  };

  useEffect(() => {
    if (userRole === "researcher") fetchParticipants();
  }, [userRole]);

  if (!loading && userRole !== "researcher") {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      screening: { variant: "outline", label: "Screening" },
      onboarding: { variant: "secondary", label: "Onboarding" },
      active: { variant: "default", label: "Active" },
      completed: { variant: "default", label: "Completed" },
      withdrawn: { variant: "destructive", label: "Withdrawn" },
    };
    const cfg = map[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  const filtered = participants.filter((p) => statusFilter === "all" || p.status === statusFilter);
  const activeCount = participants.filter((p) => p.status === "active").length;
  const avgCompliance =
    participants.filter((p) => p.status === "active" && p.compliance_rate != null).length > 0
      ? Math.round(
          participants
            .filter((p) => p.status === "active" && p.compliance_rate != null)
            .reduce((sum, p) => sum + (p.compliance_rate || 0), 0) /
            participants.filter((p) => p.status === "active" && p.compliance_rate != null).length
        )
      : 0;


  const exportAllData = async () => {
    setExporting(true);
    try {
      const pIds = participants.map((p) => p.id);
      const uIds = participants.map((p) => p.user_id);

      const [sessionsRes, assessmentsRes, labsRes] = await Promise.all([
        apiClient.get("/api/therapy-sessions"),
        apiClient.get("/api/assessments"),
        apiClient.get("/api/renal-panels"),
      ]);

      const nameMap: Record<string, string> = {};
      participants.forEach((p) => { nameMap[p.id] = p.profile?.full_name || "Unknown"; });
      const userToName: Record<string, string> = {};
      participants.forEach((p) => { userToName[p.user_id] = p.profile?.full_name || "Unknown"; });

      if (sessionsRes && (sessionsRes as any[]).length > 0) {
        downloadCsv(
          (sessionsRes as any[]).map((s: any) => ({
            participant_name: nameMap[s.participant_id] || "",
            session_date: s.session_date,
            study_day: s.study_day,
            duration_minutes: s.duration_minutes,
            body_area: s.body_area,
            pain_before: s.pain_level_before,
            pain_after: s.pain_level_after,
            fatigue: s.fatigue_level,
            skipped: s.skipped,
            skip_reason: s.skip_reason,
            side_effects: s.side_effects,
            notes: s.notes,
          })),
          `therapy_sessions_${format(new Date(), "yyyy-MM-dd")}.csv`
        );
      }

      if (assessmentsRes && (assessmentsRes as any[]).length > 0) {
        downloadCsv(
          (assessmentsRes as any[]).map((a: any) => ({
            participant_name: nameMap[a.participant_id] || "",
            assessment_type: a.assessment_type,
            time_point: a.time_point,
            study_day: a.study_day,
            total_score: a.total_score,
            subscale_scores: JSON.stringify(a.subscale_scores),
            completed_at: a.completed_at,
          })),
          `assessments_${format(new Date(), "yyyy-MM-dd")}.csv`
        );
      }

      if (labsRes && (labsRes as any[]).length > 0) {
        downloadCsv(
          (labsRes as any[]).map((r: any) => ({
            participant_name: userToName[r.participant_user_id || ""] || r.full_name,
            submission_type: r.submission_type,
            ckd_stage: r.ckd_stage,
            egfr: r.egfr,
            creatinine: r.creatinine,
            bun: r.bun,
            calcium: r.calcium,
            phosphorus: r.phosphorus,
            albumin: r.albumin,
            lab_date: r.lab_date,
            created_at: r.created_at,
          })),
          `lab_results_${format(new Date(), "yyyy-MM-dd")}.csv`
        );
      }

      toast({ title: "Export Complete", description: "CSV files have been downloaded." });
    } catch (err) {
      toast({ title: "Export Failed", description: "Could not export data.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-heading font-serif font-bold text-foreground mb-1">
                  Participant Management
                </h1>
                <p className="text-body text-muted-foreground">
                  View session logs, assessments, labs, and compliance data.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAllData}
                disabled={exporting || participants.length === 0}
                title="Download all therapy sessions, assessments, and lab results as CSV files"
              >
                <Download className="w-4 h-4 mr-1" />
                {exporting ? "Exporting..." : "Export Data (CSV)"}
              </Button>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Participants</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{participants.length}</div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{activeCount}</div>
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{avgCompliance}%</div>
                <p className="text-sm text-muted-foreground">Avg Compliance</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">
                  {participants.filter((p) => p.status === "completed").length}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Participants Table */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading participants...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No participants found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Study Day</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {p.profile?.full_name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">{p.profile?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{statusBadge(p.status)}</TableCell>
                        <TableCell>{p.study_day ?? "—"}</TableCell>
                        <TableCell>
                          {p.group_assignment
                            ? <Badge variant={p.group_assignment === "S" ? "default" : "secondary"}>
                                {p.group_assignment === "S" ? "S – Stepped" : "C – Control"}
                              </Badge>
                            : <span className="text-muted-foreground text-xs">Not assigned</span>
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={Number(p.compliance_rate) || 0} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {p.compliance_rate != null ? `${Math.round(Number(p.compliance_rate))}%` : "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendPassword(p.user_id, p.profile?.full_name || "participant", p.profile?.email || "")}
                            title="Reset and email a new temporary password"
                          >
                            <KeyRound className="w-4 h-4 mr-1" />
                            Resend Password
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchParticipantDetails(p)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                  {selectedParticipant?.profile?.full_name || "Participant"}
                                  {selectedParticipant && statusBadge(selectedParticipant.status)}
                                </DialogTitle>
                              </DialogHeader>

                              {/* Participant Info Summary — always visible above tabs */}
                              {selectedParticipant && !detailLoading && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-1 border rounded-lg bg-muted/30 mb-2">
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Study Day</p>
                                    <p className="text-lg font-bold">{selectedParticipant.study_day ?? "—"}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Compliance</p>
                                    <p className="text-lg font-bold">
                                      {selectedParticipant.compliance_rate != null
                                        ? `${Math.round(Number(selectedParticipant.compliance_rate))}%`
                                        : "—"}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Enrolled</p>
                                    <p className="text-sm font-medium">
                                      {selectedParticipant.enrolled_at
                                        ? format(new Date(selectedParticipant.enrolled_at), "MMM d, yyyy")
                                        : "—"}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Study Group</p>
                                    <select
                                      value={selectedParticipant.group_assignment || ""}
                                      onChange={async (e) => {
                                        const val = e.target.value;
                                        if (!val || !selectedParticipant) return;
                                        try {
                                          await apiClient.post(`/api/blinding/assign/${selectedParticipant.id}`, { groupCode: val });
                                          toast({ title: "Group assigned", description: `Set to ${val === "S" ? "Stepped (20→25→30 min)" : "Control (20 min constant)"}` });
                                          setSelectedParticipant({ ...selectedParticipant, group_assignment: val });
                                          setParticipants((prev) => prev.map((p) => p.id === selectedParticipant.id ? { ...p, group_assignment: val } : p));
                                        } catch (err: any) {
                                          toast({ title: "Error", description: err.message, variant: "destructive" });
                                        }
                                      }}
                                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-bold text-center"
                                    >
                                      <option value="">Select...</option>
                                      <option value="C">C – Control (20 min)</option>
                                      <option value="S">S – Stepped (20→25→30)</option>
                                    </select>
                                  </div>
                                </div>
                              )}

                              {detailLoading ? (
                                <div className="flex justify-center py-8">
                                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : (
                                <Tabs defaultValue="sessions" className="w-full">
                                  <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="sessions" className="text-xs">
                                      <Activity className="w-3 h-3 mr-1" />
                                      Sessions
                                    </TabsTrigger>
                                    <TabsTrigger value="assessments" className="text-xs">
                                      <ClipboardList className="w-3 h-3 mr-1" />
                                      Assessments
                                    </TabsTrigger>
                                    <TabsTrigger value="labs" className="text-xs">
                                      <FlaskConical className="w-3 h-3 mr-1" />
                                      Labs
                                    </TabsTrigger>
                                    <TabsTrigger value="messages" className="text-xs">
                                      <MessageSquare className="w-3 h-3 mr-1" />
                                      Messages
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="text-xs">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Notes
                                    </TabsTrigger>
                                  </TabsList>

                                  {/* Sessions Tab */}
                                  <TabsContent value="sessions" className="space-y-3 mt-4">
                                    {sessions.length === 0 ? (
                                      <p className="text-muted-foreground text-center py-4">No sessions logged yet.</p>
                                    ) : (
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Day</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Body Area</TableHead>
                                            <TableHead>Pain (B→A)</TableHead>
                                            <TableHead>Fatigue</TableHead>
                                            <TableHead>Status</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {sessions.map((s) => (
                                            <TableRow key={s.id}>
                                              <TableCell className="text-sm">
                                                {format(new Date(s.session_date), "MMM d")}
                                              </TableCell>
                                              <TableCell>{s.study_day ?? "—"}</TableCell>
                                              <TableCell>{s.skipped ? "—" : `${s.duration_minutes}m`}</TableCell>
                                              <TableCell className="text-sm">{s.body_area || "—"}</TableCell>
                                              <TableCell>
                                                {s.skipped
                                                  ? "—"
                                                  : `${s.pain_level_before ?? "?"} → ${s.pain_level_after ?? "?"}`}
                                              </TableCell>
                                              <TableCell>{s.fatigue_level ?? "—"}</TableCell>
                                              <TableCell>
                                                {s.skipped ? (
                                                  <Badge variant="secondary">Skipped</Badge>
                                                ) : (
                                                  <Badge variant="default">Done</Badge>
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    )}
                                  </TabsContent>

                                  {/* Assessments Tab */}
                                  <TabsContent value="assessments" className="space-y-3 mt-4">
                                    {assessments.length === 0 ? (
                                      <p className="text-muted-foreground text-center py-4">No assessments completed.</p>
                                    ) : (
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Assessment</TableHead>
                                            <TableHead>Time Point</TableHead>
                                            <TableHead>Study Day</TableHead>
                                            <TableHead>Total Score</TableHead>
                                            <TableHead>Completed</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {assessments.map((a) => (
                                            <TableRow key={a.id}>
                                              <TableCell className="font-medium uppercase text-sm">
                                                {a.assessment_type}
                                              </TableCell>
                                              <TableCell className="capitalize">{a.time_point}</TableCell>
                                              <TableCell>{a.study_day ?? "—"}</TableCell>
                                              <TableCell className="font-semibold">
                                                {a.total_score ?? "—"}
                                              </TableCell>
                                              <TableCell className="text-sm">
                                                {a.completed_at
                                                  ? format(new Date(a.completed_at), "MMM d, yyyy")
                                                  : "Incomplete"}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    )}
                                  </TabsContent>

                                  {/* Labs Tab */}
                                  <TabsContent value="labs" className="space-y-3 mt-4">
                                    {renalPanels.length === 0 ? (
                                      <p className="text-muted-foreground text-center py-4">No lab results submitted.</p>
                                    ) : (
                                      <div className="space-y-4">
                                        {renalPanels.map((r) => (
                                          <Card key={r.id} className="border">
                                            <CardContent className="p-4">
                                              <div className="flex items-center justify-between mb-3">
                                                <Badge variant="outline" className="capitalize">
                                                  {r.submission_type}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                  {r.lab_date
                                                    ? format(new Date(r.lab_date), "MMM d, yyyy")
                                                    : format(new Date(r.created_at), "MMM d, yyyy")}
                                                </span>
                                              </div>
                                              <div className="grid grid-cols-3 gap-3 text-sm">
                                                <div>
                                                  <span className="text-muted-foreground">CKD Stage:</span>{" "}
                                                  <span className="font-medium capitalize">{r.ckd_stage}</span>
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">eGFR:</span>{" "}
                                                  <span className="font-medium">{r.egfr ?? "—"}</span>
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">Creatinine:</span>{" "}
                                                  <span className="font-medium">{r.creatinine ?? "—"}</span>
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">BUN:</span>{" "}
                                                  <span className="font-medium">{r.bun ?? "—"}</span>
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">Calcium:</span>{" "}
                                                  <span className="font-medium">{r.calcium ?? "—"}</span>
                                                </div>
                                                <div>
                                                  <span className="text-muted-foreground">Phosphorus:</span>{" "}
                                                  <span className="font-medium">{r.phosphorus ?? "—"}</span>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    )}
                                  </TabsContent>

                                  {/* Messages Tab */}
                                  <TabsContent value="messages" className="space-y-3 mt-4">
                                    {messages.length === 0 ? (
                                      <p className="text-muted-foreground text-center py-4">No messages.</p>
                                    ) : (
                                      <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {messages.map((m) => (
                                          <div
                                            key={m.id}
                                            className={`p-3 rounded-lg text-sm ${
                                              m.sender_id === user?.id
                                                ? "bg-primary/10 ml-8"
                                                : "bg-muted mr-8"
                                            }`}
                                          >
                                            <p className="text-foreground">{m.body}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {format(new Date(m.created_at), "MMM d, h:mm a")}
                                              {m.sender_id === user?.id ? " • You" : " • Participant"}
                                              {!m.is_read && m.sender_id !== user?.id && (
                                                <Badge variant="secondary" className="ml-2 text-[10px]">
                                                  Unread
                                                </Badge>
                                              )}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </TabsContent>

                                  {/* Notes Tab */}
                                  <TabsContent value="notes" className="space-y-4 mt-4">
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">Enrolled:</span>{" "}
                                          <span className="font-medium">
                                            {selectedParticipant?.enrolled_at
                                              ? format(new Date(selectedParticipant.enrolled_at), "MMM d, yyyy")
                                              : "—"}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Group:</span>{" "}
                                          <select
                                            value={selectedParticipant?.group_assignment || ""}
                                            onChange={async (e) => {
                                              const val = e.target.value;
                                              if (!val || !selectedParticipant) return;
                                              try {
                                                await apiClient.post(`/api/blinding/assign/${selectedParticipant.id}`, { groupCode: val });
                                                toast({ title: "Group assigned", description: `Participant assigned to ${val === "S" ? "Stepped (20→25→30 min)" : "Control (Constant 20 min)"}` });
                                                setSelectedParticipant({ ...selectedParticipant, group_assignment: val });
                                                setParticipants((prev) => prev.map((p) => p.id === selectedParticipant.id ? { ...p, group_assignment: val } : p));
                                              } catch (err: any) {
                                                toast({ title: "Error assigning group", description: err.message, variant: "destructive" });
                                              }
                                            }}
                                            className="ml-1 inline-block rounded border border-input bg-background px-2 py-1 text-sm font-medium"
                                          >
                                            <option value="">— Select Group —</option>
                                            <option value="C">Group C – Control (20 min constant)</option>
                                            <option value="S">Group S – Stepped (20→25→30 min)</option>
                                          </select>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Study Day:</span>{" "}
                                          <span className="font-medium">{selectedParticipant?.study_day ?? 0}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Compliance:</span>{" "}
                                          <span className="font-medium">
                                            {selectedParticipant?.compliance_rate != null
                                              ? `${Math.round(Number(selectedParticipant.compliance_rate))}%`
                                              : "—"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Study Start Date */}
                                      <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">
                                          Study Start Date
                                        </label>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="date"
                                            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-48"
                                            value={selectedParticipant?.study_start_date || ""}
                                            onChange={async (e) => {
                                              if (!selectedParticipant) return;
                                              const newDate = e.target.value;
                                              try {
                                                await apiClient.put(`/api/participants/${selectedParticipant.id}`, { study_start_date: newDate || null });
                                                toast({ title: "Updated", description: `Study start date set to ${newDate}.` });
                                                setSelectedParticipant({ ...selectedParticipant, study_start_date: newDate });
                                                setParticipants((prev) =>
                                                  prev.map((p) => (p.id === selectedParticipant.id ? { ...p, study_start_date: newDate } : p))
                                                );
                                              } catch {
                                                toast({ title: "Error", description: "Failed to set start date.", variant: "destructive" });
                                              }
                                            }}
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            {selectedParticipant?.study_start_date
                                              ? `Day ${selectedParticipant.study_day ?? 0}`
                                              : "Not set — participant won't accrue study days"}
                                          </span>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">
                                          Update Status
                                        </label>
                                        <Select
                                          value={selectedParticipant?.status}
                                          onValueChange={(val) => {
                                            if (selectedParticipant) updateParticipantStatus(selectedParticipant.id, val);
                                          }}
                                        >
                                          <SelectTrigger className="w-48">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="onboarding">Onboarding</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">
                                          Researcher Notes
                                        </label>
                                        <Textarea
                                          value={notesText}
                                          onChange={(e) => setNotesText(e.target.value)}
                                          rows={4}
                                          placeholder="Add private notes about this participant..."
                                        />
                                        <Button size="sm" className="mt-2" onClick={saveNotes}>
                                          Save Notes
                                        </Button>
                                      </div>

                                      {/* Withdraw — only if needed, subtle placement */}
                                      {selectedParticipant?.status !== "withdrawn" && (
                                        <div className="pt-6 mt-4 border-t border-dashed border-border/50">
                                          <button
                                            className="text-xs text-muted-foreground hover:text-destructive transition-colors underline"
                                            onClick={() =>
                                              handleWithdrawAndAnonymize(
                                                selectedParticipant!.id,
                                                selectedParticipant?.profile?.full_name || "this participant"
                                              )
                                            }
                                          >
                                            Withdraw participant from study...
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ResearcherParticipantsPage;
