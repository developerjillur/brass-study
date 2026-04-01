"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Brain, Download, ArrowLeft, BarChart3, TrendingUp, ShieldCheck, Package, Printer, FileText } from "lucide-react";
import RenalTrendCharts from "@/components/reporting/RenalTrendCharts";
import AssessmentTrendCharts from "@/components/reporting/AssessmentTrendCharts";
import GroupComparisonCharts from "@/components/reporting/GroupComparisonCharts";
import DescriptiveStatistics from "@/components/reporting/DescriptiveStatistics";
import ComplianceTrendChart from "@/components/reporting/ComplianceTrendChart";
import TherapySessionExport from "@/components/reporting/TherapySessionExport";
import FullDatasetExport from "@/components/reporting/FullDatasetExport";
import ConsentAuditExport from "@/components/reporting/ConsentAuditExport";
import DeidentifiedExport from "@/components/reporting/DeidentifiedExport";
import MethodsDataSummary from "@/components/reporting/MethodsDataSummary";
import { downloadCsv } from "@/lib/csv-export";

interface ParticipantMap {
  [participantId: string]: string;
}

const ResearcherReportsPage = () => {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [participantMap, setParticipantMap] = useState<ParticipantMap>({});
  const [renalData, setRenalData] = useState<any[]>([]);
  const [assessmentData, setAssessmentData] = useState<any[]>([]);
  const [assessmentDataWithGroup, setAssessmentDataWithGroup] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [rawSessions, setRawSessions] = useState<any[]>([]);
  const [rawAssessments, setRawAssessments] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || userRole !== "researcher")) {
      router.push("/dashboard");
      return;
    }
    if (user && userRole === "researcher") {
      loadData();
    }
  }, [user, userRole, loading]);

  const loadData = async () => {
    // Load all participants with blinding info
    const [participantsRes, blindingRes] = await Promise.all([
      apiClient.get("/api/participants"),
      apiClient.get("/api/blinding"),
    ]);

    const participants = participantsRes as any[];
    if (!participants || participants.length === 0) {
      setIsLoading(false);
      return;
    }

    // Build maps
    const pMap: ParticipantMap = {};
    const groupMap: Record<string, string> = {};
    participants.forEach((p, i) => {
      pMap[p.id] = `P${String(i + 1).padStart(2, "0")}`;
    });
    ((blindingRes as any[]) || []).forEach((b: any) => {
      groupMap[b.participant_id] = b.group_code;
    });
    setParticipantMap(pMap);
    setCompletedCount(participants.filter((p) => p.status === "completed").length);

    const participantIds = participants.map((p) => p.id);
    const participantUserIds = participants.map((p) => p.user_id);
    const userToParticipant: Record<string, string> = {};
    participants.forEach((p) => { userToParticipant[p.user_id] = p.id; });

    // Load all data in parallel
    const [renalPanelsRes, assessmentsRes, sessionsRes] = await Promise.all([
      apiClient.get("/api/renal-panels"),
      apiClient.get("/api/assessments"),
      apiClient.get("/api/therapy-sessions"),
    ]);

    // Map renal data
    if (renalPanelsRes) {
      const renalMapped = (renalPanelsRes as any[]).map((r: any) => ({
        participant_label: pMap[userToParticipant[r.participant_user_id!]] || "Unknown",
        lab_date: r.lab_date || r.created_at?.split("T")[0] || "",
        egfr: r.egfr, creatinine: r.creatinine, bun: r.bun,
      }));
      setRenalData(renalMapped);
    }

    // Map assessment data
    if (assessmentsRes) {
      const assessmentMapped = (assessmentsRes as any[]).map((a: any) => ({
        participant_label: pMap[a.participant_id] || "Unknown",
        time_point: a.time_point,
        assessment_type: a.assessment_type,
        total_score: a.total_score,
      }));
      setAssessmentData(assessmentMapped);

      // With group info for comparison charts
      const withGroup = (assessmentsRes as any[]).map((a: any) => ({
        participant_label: pMap[a.participant_id] || "Unknown",
        time_point: a.time_point,
        assessment_type: a.assessment_type,
        total_score: a.total_score,
        group: groupMap[a.participant_id] || "Unknown",
      }));
      setAssessmentDataWithGroup(withGroup);

      setRawAssessments(assessmentsRes as any[]);
    }

    // Map session data for compliance chart
    if (sessionsRes) {
      const sessionMapped = (sessionsRes as any[]).map((s: any) => ({
        participant_label: pMap[s.participant_id] || "Unknown",
        study_day: s.study_day,
        skipped: s.skipped,
      }));
      setComplianceData(sessionMapped);
      setRawSessions(sessionsRes as any[]);
    }

    setIsLoading(false);
  };

  const participantLabels = Object.values(participantMap).sort();

  const handleExportRenalCsv = () => {
    if (renalData.length === 0) { toast({ title: "No renal data to export", variant: "destructive" }); return; }
    downloadCsv(renalData, "renal-function-trends.csv");
    toast({ title: "Renal data exported!" });
  };

  const handleExportAssessmentCsv = () => {
    if (assessmentData.length === 0) { toast({ title: "No assessment data to export", variant: "destructive" }); return; }
    downloadCsv(assessmentData, "assessment-score-trends.csv");
    toast({ title: "Assessment data exported!" });
  };

  const handlePrint = () => window.print();

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
      <div className="container py-8 md:py-12 print:py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8 print:mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="print:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-heading font-serif font-bold text-foreground">
                Dissertation Reports
              </h1>
              <p className="text-muted-foreground print:hidden">
                Trend charts, group comparisons, descriptive statistics, and data exports
              </p>
            </div>
            <Button variant="outline" onClick={handlePrint} className="print:hidden">
              <Printer className="w-4 h-4 mr-2" /> Print Report
            </Button>
          </div>

          <Tabs defaultValue="renal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 print:hidden">
              <TabsTrigger value="renal" className="flex items-center gap-1 text-xs">
                <FlaskConical className="w-3 h-3" /> Renal
              </TabsTrigger>
              <TabsTrigger value="assessments" className="flex items-center gap-1 text-xs">
                <Brain className="w-3 h-3" /> Assessments
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-1 text-xs">
                <BarChart3 className="w-3 h-3" /> Groups
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3" /> Statistics
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3" /> Compliance
              </TabsTrigger>
              <TabsTrigger value="exports" className="flex items-center gap-1 text-xs">
                <Package className="w-3 h-3" /> Exports
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-1 text-xs">
                <ShieldCheck className="w-3 h-3" /> Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="renal">
              <div className="flex justify-end mb-4 print:hidden">
                <Button variant="outline" size="sm" onClick={handleExportRenalCsv}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
              {renalData.length === 0 ? (
                <EmptyState message="No renal panel data available yet." />
              ) : (
                <RenalTrendCharts data={renalData} participantLabels={participantLabels} />
              )}
            </TabsContent>

            <TabsContent value="assessments">
              <div className="flex justify-end mb-4 print:hidden">
                <Button variant="outline" size="sm" onClick={handleExportAssessmentCsv}>
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>
              {assessmentData.length === 0 ? (
                <EmptyState message="No assessment response data available yet." />
              ) : (
                <AssessmentTrendCharts data={assessmentData} participantLabels={participantLabels} />
              )}
            </TabsContent>

            <TabsContent value="comparison">
              <GroupComparisonCharts data={assessmentDataWithGroup} />
            </TabsContent>

            <TabsContent value="stats">
              <DescriptiveStatistics sessions={rawSessions} assessments={rawAssessments} />
            </TabsContent>

            <TabsContent value="compliance">
              <ComplianceTrendChart data={complianceData} participantLabels={participantLabels} />
            </TabsContent>

            <TabsContent value="exports">
              <div className="space-y-6">
                <TherapySessionExport participantMap={participantMap} />
                <FullDatasetExport participantMap={participantMap} />
                <DeidentifiedExport participantMap={participantMap} />
                <MethodsDataSummary
                  totalParticipants={Object.keys(participantMap).length}
                  activeCount={Object.keys(participantMap).length}
                  completedCount={completedCount}
                />
              </div>
            </TabsContent>

            <TabsContent value="audit">
              <ConsentAuditExport participantMap={participantMap} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PublicLayout>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-16 text-center">
    <p className="text-muted-foreground">{message}</p>
    <p className="text-sm text-muted-foreground mt-1">
      Data will appear here as participants submit results.
    </p>
  </div>
);

export default ResearcherReportsPage;
