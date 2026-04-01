"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv-export";
import { FileDown, ShieldCheck, FileText } from "lucide-react";
import { format } from "date-fns";

interface Props {
  participantMap: Record<string, string>;
}

const DeidentifiedExport = ({ participantMap }: Props) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const pIds = Object.keys(participantMap);

      const [sessionsRes, assessmentsRes, labsRes, participantsRes, blindingRes] = await Promise.all([
        apiClient.get("/api/therapy-sessions"),
        apiClient.get("/api/assessments"),
        apiClient.get("/api/renal-panels"),
        apiClient.get("/api/participants"),
        apiClient.get("/api/blinding"),
      ]);

      const blindingMap: Record<string, string> = {};
      ((blindingRes as any[]) || []).forEach((b) => { blindingMap[b.participant_id] = b.group_code; });

      const userToP: Record<string, string> = {};
      ((participantsRes as any[]) || []).forEach((p) => { userToP[p.user_id] = participantMap[p.id]; });

      // Export sessions with de-identified labels
      if ((sessionsRes as any[])?.length) {
        downloadCsv(
          (sessionsRes as any[]).map((s) => ({
            participant_id: participantMap[s.participant_id] || "Unknown",
            session_date: s.session_date,
            study_day: s.study_day,
            duration_minutes: s.duration_minutes,
            body_area: s.body_area,
            pain_before: s.pain_level_before,
            pain_after: s.pain_level_after,
            fatigue: s.fatigue_level,
            skipped: s.skipped,
            skip_reason: s.skip_reason,
          })),
          `deidentified_sessions_${format(new Date(), "yyyy-MM-dd")}.csv`
        );
      }

      // Export assessments
      if ((assessmentsRes as any[])?.length) {
        downloadCsv(
          (assessmentsRes as any[]).map((a) => ({
            participant_id: participantMap[a.participant_id] || "Unknown",
            assessment_type: a.assessment_type,
            time_point: a.time_point,
            study_day: a.study_day,
            total_score: a.total_score,
            subscale_scores: JSON.stringify(a.subscale_scores),
            completed_at: a.completed_at,
          })),
          `deidentified_assessments_${format(new Date(), "yyyy-MM-dd")}.csv`
        );
      }

      // Export labs
      if ((labsRes as any[])?.length) {
        const filtered = (labsRes as any[]).filter((r) => r.participant_user_id && userToP[r.participant_user_id]);
        if (filtered.length) {
          downloadCsv(
            filtered.map((r) => ({
              participant_id: userToP[r.participant_user_id!] || "Unknown",
              submission_type: r.submission_type,
              ckd_stage: r.ckd_stage,
              egfr: r.egfr,
              creatinine: r.creatinine,
              bun: r.bun,
              calcium: r.calcium,
              phosphorus: r.phosphorus,
              albumin: r.albumin,
              lab_date: r.lab_date,
            })),
            `deidentified_labs_${format(new Date(), "yyyy-MM-dd")}.csv`
          );
        }
      }

      toast({ title: "De-identified Export Complete", description: "All names replaced with P01–P24 labels." });
    } catch (err) {
      toast({ title: "Export Failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          HIPAA De-Identified Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Export all study data with participant names replaced by anonymous labels (P01, P02, ... P24). 
          No personally identifiable information is included in these files.
        </p>
        <Button onClick={handleExport} disabled={exporting} variant="outline">
          <FileDown className="w-4 h-4 mr-2" />
          {exporting ? "Exporting..." : "Export De-Identified Dataset"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeidentifiedExport;
