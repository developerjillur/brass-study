"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  participantMap: Record<string, string>;
}

const TherapySessionExport = ({ participantMap }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/api/therapy-sessions").catch(() => []);

      if (!data || (data as any[]).length === 0) {
        toast.error("No therapy session data to export.");
        return;
      }

      const mapped = (data as any[]).map((row: any) => ({
        participant: participantMap[row.participant_id] || row.participant_id,
        session_date: row.session_date,
        study_day: row.study_day ?? "",
        duration_minutes: row.duration_minutes,
        skipped: row.skipped ? "Yes" : "No",
        skip_reason: row.skip_reason ?? "",
        pain_before: row.pain_level_before ?? "",
        pain_after: row.pain_level_after ?? "",
        fatigue: row.fatigue_level ?? "",
        body_area: row.body_area ?? "",
        device_used: row.device_used ?? "",
        side_effects: row.side_effects ?? "",
        notes: row.notes ?? "",
      }));

      downloadCsv(mapped, "therapy-sessions-export.csv");
      toast.success("Therapy sessions exported!");
    } catch {
      toast.error("Failed to export therapy sessions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Therapy Session Export</CardTitle>
        <CardDescription>
          Download all therapy session logs as CSV for statistical analysis. Includes pain scores, duration, compliance, and side effects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={loading} variant="outline">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export Therapy Sessions CSV
        </Button>
      </CardContent>
    </Card>
  );
};

export default TherapySessionExport;
