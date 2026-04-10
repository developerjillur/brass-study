"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Eye, Filter, Users, Clock, CheckCircle, XCircle, Mail, UserPlus, Copy, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";


interface ScreeningSubmission {
  id: string;
  full_name: string;
  email: string;
  consent_to_contact: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  notes: string | null;
}

interface RenalPanelData {
  id: string;
  ckd_stage: string;
  egfr: number | null;
  creatinine: number | null;
  bun: number | null;
  calcium: number | null;
  phosphorus: number | null;
  albumin: number | null;
  lab_date: string | null;
  doctor_name: string | null;
  notes: string | null;
  is_eligible: boolean | null;
  created_at: string;
}

const ScreeningQueuePage = () => {
  const { userRole, loading } = useAuth();
  const [submissions, setSubmissions] = useState<ScreeningSubmission[]>([]);
  const [renalData, setRenalData] = useState<Record<string, RenalPanelData | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{ password?: string; message?: string } | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const submissionsData = await apiClient.get("/api/screening").catch(() => []);


      setSubmissions(submissionsData || []);

      // Load all renal panels and match to screening submissions by screening_id
      const allPanels = await apiClient.get("/api/renal-panels").catch(() => []);
      const renalDataMap: Record<string, RenalPanelData | null> = {};
      for (const submission of submissionsData || []) {
        const match = Array.isArray(allPanels)
          ? allPanels.find((p: any) => p.screening_id === submission.id)
          : null;
        renalDataMap[submission.id] = match || null;
      }
      setRenalData(renalDataMap);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load screening submissions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === "researcher") {
      fetchSubmissions();
    }
  }, [userRole]);

  const sendStatusEmail = async (screeningId: string, newStatus: string, fullName: string, email: string) => {
    try {
      await apiClient.post("/api/screening/status-email", {
        screening_id: screeningId, new_status: newStatus, full_name: fullName, email,
      });
    } catch (err) {
      console.error("Failed to send status email:", err);
    }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    const submission = submissions.find((s) => s.id === submissionId);
    try {
      await apiClient.put(`/api/screening/${submissionId}/status`, {
        status: newStatus,
      });

      toast({
        title: "Status Updated",
        description: `Submission status changed to ${newStatus}.`,
      });

      // Send email for relevant statuses
      if (submission && ["screener_sent", "declined", "invited"].includes(newStatus)) {
        sendStatusEmail(submissionId, newStatus, submission.full_name, submission.email);
      }

      fetchSubmissions();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async (submission: ScreeningSubmission) => {
    setInvitingId(submission.id);
    setInviteResult(null);

    try {
      const data = await apiClient.post("/api/invitations/invite-participant", {
        screeningId: submission.id,
      });

      setInviteResult({
        password: (data as any).temp_password,
        message: (data as any).message,
      });

      toast({
        title: "Participant Invited!",
        description: (data as any).message,
      });

      // Also send the invite email
      sendStatusEmail(submission.id, "invited", submission.full_name, submission.email);

      fetchSubmissions();
    } catch (error: any) {
      console.error("Invite error:", error);
      toast({
        title: "Invite Failed",
        description: error.message || "Failed to create participant account.",
        variant: "destructive",
      });
    } finally {
      setInvitingId(null);
    }
  };

  if (!loading && userRole !== "researcher") {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  if (loading || (userRole !== "researcher" && userRole !== null)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pending Review" },
      screener_sent: { variant: "outline" as const, icon: Activity, label: "Screener Sent" },
      screener_completed: { variant: "default" as const, icon: Activity, label: "Screener Completed" },
      eligible: { variant: "default" as const, icon: CheckCircle, label: "Eligible" },
      ineligible: { variant: "destructive" as const, icon: XCircle, label: "Ineligible" },
      invited: { variant: "default" as const, icon: Users, label: "Invited" },
      declined: { variant: "secondary" as const, icon: XCircle, label: "Declined" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredSubmissions = submissions.filter(submission =>
    selectedStatus === "all" || submission.status === selectedStatus
  );

  return (
    <PublicLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-heading font-serif font-bold text-foreground mb-2">
                Screening Queue
              </h1>
              <p className="text-body text-muted-foreground">
                Review and manage participant screening submissions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="screener_completed">Screener Completed</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="ineligible">Ineligible</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-foreground">{submissions.length}</div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-accent">{submissions.filter(s => s.status === "pending" || s.status === "screener_completed").length}</div>
                <p className="text-sm text-muted-foreground">Awaiting Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-success">{submissions.filter(s => s.status === "eligible").length}</div>
                <p className="text-sm text-muted-foreground">Eligible</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-destructive">{submissions.filter(s => s.status === "ineligible").length}</div>
                <p className="text-sm text-muted-foreground">Ineligible</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Screening Submissions ({filteredSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading submissions...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No submissions found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-soft transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{submission.full_name}</h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{submission.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Interest form: {new Date(submission.created_at).toLocaleDateString()}
                          {submission.consent_to_contact && " • Consents to contact"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Invite button for eligible submissions */}
                        {submission.status === "eligible" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="default" size="sm">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite to Portal
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Invite {submission.full_name}?</DialogTitle>
                                <DialogDescription>
                                  This will create a portal account for {submission.email} with a temporary password,
                                  create a participant record, assign a randomized group, and send an invitation email.
                                </DialogDescription>
                              </DialogHeader>
                              {inviteResult && inviteResult.password ? (
                                <div className="space-y-4">
                                  <div className="p-4 bg-muted rounded-lg border border-border">
                                    <p className="text-sm font-medium text-foreground mb-2">Account Created Successfully</p>
                                    <p className="text-sm text-muted-foreground mb-3">{inviteResult.message}</p>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between p-2 bg-background rounded border">
                                        <div>
                                          <p className="text-xs text-muted-foreground">Email</p>
                                          <p className="text-sm font-mono">{submission.email}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            navigator.clipboard.writeText(submission.email);
                                            toast({ title: "Copied!" });
                                          }}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center justify-between p-2 bg-background rounded border">
                                        <div>
                                          <p className="text-xs text-muted-foreground">Temporary Password</p>
                                          <p className="text-sm font-mono">{inviteResult.password}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            navigator.clipboard.writeText(inviteResult.password!);
                                            toast({ title: "Copied!" });
                                          }}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-destructive mt-3">
                                      ⚠️ Share these credentials securely. The password will not be shown again.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2 pt-2">
                                  <Button
                                    onClick={() => handleInvite(submission)}
                                    disabled={invitingId === submission.id}
                                  >
                                    {invitingId === submission.id ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating Account...
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create Account & Invite
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{submission.full_name} - Screening Details</DialogTitle>
                              <DialogDescription>
                                Review participant information and renal function panel results.
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="contact" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="contact">Contact Info</TabsTrigger>
                                <TabsTrigger value="renal">Renal Panel</TabsTrigger>
                              </TabsList>
                              <TabsContent value="contact" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <FieldLabel>Full Name</FieldLabel>
                                    <p>{submission.full_name}</p>
                                  </div>
                                  <div>
                                    <FieldLabel>Email</FieldLabel>
                                    <p>{submission.email}</p>
                                  </div>
                                  <div>
                                    <FieldLabel>Status</FieldLabel>
                                    <div className="mt-1">{getStatusBadge(submission.status)}</div>
                                  </div>
                                  <div>
                                    <FieldLabel>Consent to Contact</FieldLabel>
                                    <p>{submission.consent_to_contact ? "Yes" : "No"}</p>
                                  </div>
                                  <div>
                                    <FieldLabel>Interest Form Submitted</FieldLabel>
                                    <p>{new Date(submission.created_at).toLocaleString()}</p>
                                  </div>
                                  {submission.updated_at !== submission.created_at && (
                                    <div>
                                      <FieldLabel>Status Changed</FieldLabel>
                                      <p>{new Date(submission.updated_at).toLocaleString()}</p>
                                    </div>
                                  )}
                                </div>
                              </TabsContent>
                              <TabsContent value="renal" className="space-y-4">
                                {renalData[submission.id] ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <FieldLabel>CKD Stage</FieldLabel>
                                        <p className="capitalize">{renalData[submission.id]?.ckd_stage}</p>
                                      </div>
                                      <div>
                                        <FieldLabel>Lab Test Date</FieldLabel>
                                        <p>{renalData[submission.id]?.lab_date ? new Date(renalData[submission.id]!.lab_date!).toLocaleDateString() : "Not specified"}</p>
                                      </div>
                                    </div>
                                    {renalData[submission.id]?.created_at && (
                                      <p className="text-xs text-muted-foreground">
                                        Renal panel submitted: {new Date(renalData[submission.id]!.created_at).toLocaleString()}
                                      </p>
                                    )}
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <FieldLabel>eGFR</FieldLabel>
                                        <p>{renalData[submission.id]?.egfr ?? "N/A"}</p>
                                      </div>
                                      <div>
                                        <FieldLabel>Creatinine</FieldLabel>
                                        <p>{renalData[submission.id]?.creatinine ?? "N/A"}</p>
                                      </div>
                                      <div>
                                        <FieldLabel>BUN</FieldLabel>
                                        <p>{renalData[submission.id]?.bun ?? "N/A"}</p>
                                      </div>
                                      <div>
                                        <FieldLabel>Calcium</FieldLabel>
                                        <p>{renalData[submission.id]?.calcium ?? "N/A"}</p>
                                      </div>
                                      <div>
                                        <FieldLabel>Phosphorus</FieldLabel>
                                        <p>{renalData[submission.id]?.phosphorus ?? "N/A"}</p>
                                      </div>
                                      <div>
                                        <FieldLabel>Albumin</FieldLabel>
                                        <p>{renalData[submission.id]?.albumin ?? "N/A"}</p>
                                      </div>
                                    </div>
                                    {renalData[submission.id]?.doctor_name && (
                                      <div>
                                        <FieldLabel>Ordering Doctor</FieldLabel>
                                        <p>{renalData[submission.id]?.doctor_name}</p>
                                      </div>
                                    )}
                                    {renalData[submission.id]?.notes && (
                                      <div>
                                        <FieldLabel>Notes</FieldLabel>
                                        <p className="text-sm">{renalData[submission.id]?.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground text-center py-4">No renal panel data available</p>
                                )}
                              </TabsContent>
                            </Tabs>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <Select
                                value={submission.status}
                                onValueChange={(value) => updateSubmissionStatus(submission.id, value)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending Review</SelectItem>
                                  <SelectItem value="screener_sent">Screener Sent</SelectItem>
                                  <SelectItem value="screener_completed">Screener Completed</SelectItem>
                                  <SelectItem value="eligible">Eligible</SelectItem>
                                  <SelectItem value="ineligible">Ineligible</SelectItem>
                                  <SelectItem value="invited">Invited</SelectItem>
                                  <SelectItem value="declined">Declined</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-medium text-foreground">{children}</div>
);

export default ScreeningQueuePage;
