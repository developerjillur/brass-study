"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, SkipForward } from "lucide-react";

interface BaselineLabFormProps {
  participantId: string;
  userId: string;
  onComplete: (submitted: boolean) => void;
  isSubmitting?: boolean;
}

const CKD_STAGES = ["Stage 1", "Stage 2", "Stage 3a", "Stage 3b", "Stage 4", "Stage 5"];

const BaselineLabForm = ({ participantId, userId, onComplete, isSubmitting: parentSubmitting }: BaselineLabFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    ckd_stage: "",
    egfr: "",
    creatinine: "",
    bun: "",
    albumin: "",
    calcium: "",
    phosphorus: "",
    lab_date: new Date().toISOString().split("T")[0],
    doctor_name: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.ckd_stage) {
      toast({ title: "Please select CKD stage", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await apiClient.get("/api/users/me/profile").catch(() => []);

      const result = await apiClient.post("/api/renal-panels", {
        participant_user_id: userId,
        screening_id: null,
        full_name: profile?.full_name || "Participant",
        ckd_stage: form.ckd_stage,
        egfr: form.egfr ? parseFloat(form.egfr) : null,
        creatinine: form.creatinine ? parseFloat(form.creatinine) : null,
        bun: form.bun ? parseFloat(form.bun) : null,
        albumin: form.albumin ? parseFloat(form.albumin) : null,
        calcium: form.calcium ? parseFloat(form.calcium) : null,
        phosphorus: form.phosphorus ? parseFloat(form.phosphorus) : null,
        lab_date: form.lab_date || null,
        doctor_name: form.doctor_name.trim() || null,
        submission_type: "baseline",
      });

      toast({ title: "Baseline lab results submitted!" });
      onComplete(true);
    } catch (error: any) {
      toast({ title: "Error submitting lab results", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete(false);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Baseline Lab Results
        </CardTitle>
        <CardDescription className="text-base">
          Enter your most recent renal function panel results from your doctor. 
          If you don't have them yet, you can skip this step and enter them later from your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">CKD Stage <span className="text-destructive">*</span></Label>
            <Select value={form.ckd_stage} onValueChange={(v) => update("ckd_stage", v)}>
              <SelectTrigger><SelectValue placeholder="Select stage..." /></SelectTrigger>
              <SelectContent>
                {CKD_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Lab Date</Label>
            <Input type="date" value={form.lab_date} onChange={(e) => update("lab_date", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumField label="eGFR (mL/min)" value={form.egfr} onChange={(v) => update("egfr", v)} />
          <NumField label="Creatinine (mg/dL)" value={form.creatinine} onChange={(v) => update("creatinine", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="BUN (mg/dL)" value={form.bun} onChange={(v) => update("bun", v)} />
          <NumField label="Albumin (g/dL)" value={form.albumin} onChange={(v) => update("albumin", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NumField label="Calcium (mg/dL)" value={form.calcium} onChange={(v) => update("calcium", v)} />
          <NumField label="Phosphorus (mg/dL)" value={form.phosphorus} onChange={(v) => update("phosphorus", v)} />
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Ordering Physician</Label>
          <Input
            value={form.doctor_name}
            onChange={(e) => update("doctor_name", e.target.value)}
            placeholder="Dr. Smith"
            maxLength={200}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={isSubmitting || parentSubmitting} className="flex-1 min-h-[48px] text-base" size="lg">
            {isSubmitting ? "Submitting..." : "Submit & Continue"}
          </Button>
          <Button variant="outline" onClick={handleSkip} disabled={isSubmitting || parentSubmitting} className="min-h-[48px]" size="lg">
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const NumField = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold">{label}</Label>
    <Input type="number" step="0.01" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder="—" />
  </div>
);

export default BaselineLabForm;
