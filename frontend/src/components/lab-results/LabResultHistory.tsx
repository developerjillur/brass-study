"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlaskConical, Calendar } from "lucide-react";

interface LabResult {
  id: string;
  ckd_stage: string;
  egfr: number | null;
  creatinine: number | null;
  bun: number | null;
  albumin: number | null;
  calcium: number | null;
  phosphorus: number | null;
  lab_date: string | null;
  doctor_name: string | null;
  notes: string | null;
  created_at: string;
}

const LabResultHistory = ({ participantId, refreshKey }: { participantId: string; refreshKey: number }) => {
  const [results, setResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [participantId, refreshKey]);

  const loadResults = async () => {
    // Get user_id from participant
    const participant = await apiClient.get("/api/participants/me").catch(() => []);

    if (!participant) { setIsLoading(false); return; }

    const data = await apiClient.get("/api/renal-panels/mine").catch(() => []);

    setResults((data as LabResult[]) || []);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-12 text-center">
          <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">No Lab Results Yet</h3>
          <p className="text-muted-foreground">Submit your first renal panel results to see them here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl">Lab Result History</CardTitle>
        <CardDescription>Your submitted renal function panels</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            {results.map((r) => (
              <div key={r.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">
                      {r.lab_date
                        ? new Date(r.lab_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "No date"}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30">{r.ckd_stage}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Metric label="eGFR" value={r.egfr} unit="mL/min" />
                  <Metric label="Creatinine" value={r.creatinine} unit="mg/dL" />
                  <Metric label="BUN" value={r.bun} unit="mg/dL" />
                  <Metric label="Albumin" value={r.albumin} unit="g/dL" />
                  <Metric label="Calcium" value={r.calcium} unit="mg/dL" />
                  <Metric label="Phosphorus" value={r.phosphorus} unit="mg/dL" />
                </div>
                {r.doctor_name && (
                  <p className="text-xs text-muted-foreground mt-2">Dr. {r.doctor_name}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const Metric = ({ label, value, unit }: { label: string; value: number | null; unit: string }) => (
  <div>
    <span className="text-muted-foreground">{label}: </span>
    <span className="font-medium text-foreground">
      {value != null ? `${value} ${unit}` : "—"}
    </span>
  </div>
);

export default LabResultHistory;
