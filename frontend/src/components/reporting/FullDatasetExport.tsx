"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface Props {
  participantMap: Record<string, string>;
}

const FullDatasetExport = ({ participantMap }: Props) => {
  const [loading, setLoading] = useState(false);

  const mapParticipant = (id: string) => participantMap[id] || id;

  const handleExport = async () => {
    setLoading(true);
    try {
      // Fetch all datasets in parallel
      const [sessionsRes, assessmentsRes, renalRes, participantsRes, consentRes, blindingRes] = await Promise.all([
        apiClient.get("/api/therapy-sessions"),
        apiClient.get("/api/assessments"),
        apiClient.get("/api/renal-panels"),
        apiClient.get("/api/participants"),
        apiClient.get("/api/consent"),
        apiClient.get("/api/blinding"),
      ]);

      const blindingMap: Record<string, string> = {};
      ((blindingRes as any[]) || []).forEach((b) => { blindingMap[b.participant_id] = b.group_code; });

      let exportCount = 0;

      // 1. Therapy sessions
      if ((sessionsRes as any[]) && (sessionsRes as any[]).length > 0) {
        const mapped = (sessionsRes as any[]).map((r) => ({
          participant: mapParticipant(r.participant_id),
          session_date: r.session_date,
          study_day: r.study_day ?? "",
          duration_minutes: r.duration_minutes,
          skipped: r.skipped ? "Yes" : "No",
          skip_reason: r.skip_reason ?? "",
          pain_before: r.pain_level_before ?? "",
          pain_after: r.pain_level_after ?? "",
          fatigue: r.fatigue_level ?? "",
          body_area: r.body_area ?? "",
          device_used: r.device_used ?? "",
          side_effects: r.side_effects ?? "",
          notes: r.notes ?? "",
        }));
        downloadCsv(mapped, "dataset-therapy-sessions.csv");
        exportCount++;
      }

      // 2. Assessment responses
      if ((assessmentsRes as any[]) && (assessmentsRes as any[]).length > 0) {
        const mapped = (assessmentsRes as any[]).map((r) => ({
          participant: mapParticipant(r.participant_id),
          assessment_type: r.assessment_type,
          time_point: r.time_point,
          total_score: r.total_score ?? "",
          study_day: r.study_day ?? "",
          completed_at: r.completed_at ?? "",
        }));
        downloadCsv(mapped, "dataset-assessment-responses.csv");
        exportCount++;
      }

      // 3. Renal panels
      if ((renalRes as any[]) && (renalRes as any[]).length > 0) {
        const mapped = (renalRes as any[]).map((r) => ({
          participant: r.participant_user_id ?? "",
          full_name: r.full_name,
          lab_date: r.lab_date ?? "",
          ckd_stage: r.ckd_stage,
          egfr: r.egfr ?? "",
          creatinine: r.creatinine ?? "",
          bun: r.bun ?? "",
          calcium: r.calcium ?? "",
          phosphorus: r.phosphorus ?? "",
          albumin: r.albumin ?? "",
          submission_type: r.submission_type,
        }));
        downloadCsv(mapped, "dataset-renal-panels.csv");
        exportCount++;
      }

      // 4. Participant summary
      if ((participantsRes as any[]) && (participantsRes as any[]).length > 0) {
        const mapped = (participantsRes as any[]).map((r) => ({
          participant: mapParticipant(r.id),
          status: r.status,
          study_day: r.study_day ?? "",
          group: blindingMap[r.id] ?? "",
          compliance_rate: r.compliance_rate ?? "",
          enrolled_at: r.enrolled_at ?? "",
          completed_at: r.completed_at ?? "",
          study_start_date: r.study_start_date ?? "",
        }));
        downloadCsv(mapped, "dataset-participants.csv");
        exportCount++;
      }

      // 5. Consent records
      if ((consentRes as any[]) && (consentRes as any[]).length > 0) {
        const mapped = (consentRes as any[]).map((r) => ({
          participant: mapParticipant(r.participant_id),
          consent_type: r.consent_type,
          consent_version: r.consent_version,
          consented: r.consented ? "Yes" : "No",
          signed_at: r.signed_at ?? "",
          ip_address: r.ip_address ?? "",
        }));
        downloadCsv(mapped, "dataset-consent-records.csv");
        exportCount++;
      }

      if (exportCount === 0) {
        toast.error("No data available to export.");
      } else {
        toast.success(`${exportCount} dataset file(s) downloaded!`);
      }
    } catch {
      toast.error("Failed to export dataset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="w-5 h-5" /> Full Dataset Bundle
        </CardTitle>
        <CardDescription>
          Download all study data as separate CSV files: therapy sessions, assessments, renal panels, participant summary, and consent records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download All Datasets
        </Button>
      </CardContent>
    </Card>
  );
};

export default FullDatasetExport;
