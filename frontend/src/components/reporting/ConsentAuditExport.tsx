"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { downloadCsv } from "@/lib/csv-export";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Props {
  participantMap: Record<string, string>;
}

const ConsentAuditExport = ({ participantMap }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/api/consent").catch(() => []);

      if (!data || (data as any[]).length === 0) {
        toast.error("No consent records to export.");
        return;
      }

      const mapped = (data as any[]).map((row: any) => ({
        participant: participantMap[row.participant_id] || row.participant_id,
        consent_type: row.consent_type,
        consent_version: row.consent_version,
        consented: row.consented ? "Yes" : "No",
        signed_at: row.signed_at ?? "",
        ip_address: row.ip_address ?? "",
        created_at: row.created_at,
      }));

      downloadCsv(mapped, "consent-audit-trail.csv");
      toast.success("Consent audit trail exported!");
    } catch {
      toast.error("Failed to export consent records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Consent Audit Export
        </CardTitle>
        <CardDescription>
          Download the complete IRB consent audit trail with timestamps and IP addresses for regulatory compliance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={loading} variant="outline">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export Consent Audit CSV
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConsentAuditExport;
