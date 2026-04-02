"use client";

import { useState } from "react";
const labReferenceGuide = "/images/lab-reference-guide.png";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, AlertTriangle, Upload, FileImage } from "lucide-react";

interface LabResultFormProps {
  participantId: string;
  userId: string;
  onSubmitted: () => void;
}

const CKD_STAGES = ["Stage 1", "Stage 2", "Stage 3a", "Stage 3b", "Stage 4", "Stage 5"];

// Normal ranges for soft warnings
const NORMAL_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  egfr: { min: 15, max: 120, unit: "mL/min" },
  creatinine: { min: 0.5, max: 6.0, unit: "mg/dL" },
  bun: { min: 5, max: 80, unit: "mg/dL" },
  albumin: { min: 2.0, max: 5.5, unit: "g/dL" },
  calcium: { min: 7.0, max: 11.0, unit: "mg/dL" },
  phosphorus: { min: 2.0, max: 7.0, unit: "mg/dL" },
};

const getWarning = (field: string, value: string): string | null => {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  const range = NORMAL_RANGES[field];
  if (!range) return null;
  if (num < range.min || num > range.max) {
    return `This value looks unusual (typical range: ${range.min}–${range.max} ${range.unit}). Please double-check your lab report.`;
  }
  return null;
};

const LabResultForm = ({ participantId, userId, onSubmitted }: LabResultFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [labFile, setLabFile] = useState<File | null>(null);
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
    notes: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.ckd_stage) {
      toast({ title: "Please select CKD stage", variant: "destructive" });
      return;
    }
    if (!form.egfr && !form.creatinine) {
      toast({ title: "Please enter at least eGFR or Creatinine", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await apiClient.get("/api/users/me/profile").catch(() => []);

      const result = await apiClient.post("/api/renal-panels/follow-up", {
        ckd_stage: form.ckd_stage,
        egfr: form.egfr ? parseFloat(form.egfr) : null,
        creatinine: form.creatinine ? parseFloat(form.creatinine) : null,
        bun: form.bun ? parseFloat(form.bun) : null,
        albumin: form.albumin ? parseFloat(form.albumin) : null,
        calcium: form.calcium ? parseFloat(form.calcium) : null,
        phosphorus: form.phosphorus ? parseFloat(form.phosphorus) : null,
        lab_date: form.lab_date || null,
        doctor_name: form.doctor_name.trim() || null,
        notes: form.notes.trim() || null,
      });


      // Upload file if present
      if (labFile) {
        const filePath = `${userId}/${Date.now()}_${labFile.name}`;
        await apiClient.upload("/api/uploads/lab-reports", (() => { const fd = new FormData(); fd.append("file", labFile); return fd; })());
      }

      setForm({
        ckd_stage: "", egfr: "", creatinine: "", bun: "", albumin: "",
        calcium: "", phosphorus: "", lab_date: new Date().toISOString().split("T")[0],
        doctor_name: "", notes: "",
      });
      setLabFile(null);
      onSubmitted();
    } catch (error: any) {
      toast({ title: "Error submitting lab results", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Submit Lab Results
        </CardTitle>
        <CardDescription>Enter your latest renal function panel values from your doctor.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Reference guide */}
        <details className="rounded-lg border border-border bg-muted/30 p-4">
          <summary className="text-sm font-semibold text-primary cursor-pointer">
            📋 Where do I find these numbers?
          </summary>
          <div className="mt-3 text-sm text-muted-foreground space-y-3">
            <img
              src={labReferenceGuide}
              alt="Annotated sample lab report showing where to find eGFR, Creatinine, BUN, Calcium, Phosphorus, and Albumin values"
              className="w-full rounded-lg border border-border shadow-sm"
              loading="lazy"
            />
            <p>Your lab report from your doctor should include a <strong>Renal Function Panel</strong> or <strong>Basic Metabolic Panel (BMP)</strong>.</p>
            <p>Look for these values on the report — they are usually listed under <strong>"Chemistry"</strong> or <strong>"Metabolic Panel"</strong>:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>eGFR</strong> — Estimated Glomerular Filtration Rate (mL/min)</li>
              <li><strong>Creatinine</strong> — Serum Creatinine (mg/dL)</li>
              <li><strong>BUN</strong> — Blood Urea Nitrogen (mg/dL)</li>
              <li><strong>Calcium, Phosphorus, Albumin</strong> — usually nearby on the same report</li>
            </ul>
            <p>If you can't find a value, leave it blank. The most important values are <strong>eGFR</strong> and <strong>Creatinine</strong>.</p>
          </div>
        </details>

        {/* CKD Stage & Lab Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              CKD Stage <span className="text-destructive">*</span>
            </Label>
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

        {/* Key markers with warnings */}
        <div className="grid grid-cols-2 gap-4">
          <NumFieldWithWarning label="eGFR (mL/min)" value={form.egfr} onChange={(v) => update("egfr", v)} field="egfr" required />
          <NumFieldWithWarning label="Creatinine (mg/dL)" value={form.creatinine} onChange={(v) => update("creatinine", v)} field="creatinine" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumFieldWithWarning label="BUN (mg/dL)" value={form.bun} onChange={(v) => update("bun", v)} field="bun" />
          <NumFieldWithWarning label="Albumin (g/dL)" value={form.albumin} onChange={(v) => update("albumin", v)} field="albumin" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NumFieldWithWarning label="Calcium (mg/dL)" value={form.calcium} onChange={(v) => update("calcium", v)} field="calcium" />
          <NumFieldWithWarning label="Phosphorus (mg/dL)" value={form.phosphorus} onChange={(v) => update("phosphorus", v)} field="phosphorus" />
        </div>

        {/* Doctor & Notes */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Ordering Physician</Label>
          <Input
            value={form.doctor_name}
            onChange={(e) => update("doctor_name", e.target.value)}
            placeholder="Dr. Smith"
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any additional notes about these results..."
            maxLength={1000}
            className="min-h-[80px]"
          />
        </div>

        {/* File upload */}
        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <FileImage className="w-4 h-4" />
            Upload Lab Report (optional)
          </Label>
          <p className="text-xs text-muted-foreground">
            You can optionally upload a photo or scan of your lab report. Files are stored securely and only visible to the researcher.
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-input hover:border-primary cursor-pointer transition-colors bg-muted/20">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {labFile ? labFile.name : "Choose file..."}
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setLabFile(e.target.files?.[0] || null)}
              />
            </label>
            {labFile && (
              <Button variant="ghost" size="sm" onClick={() => setLabFile(null)}>Remove</Button>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full min-h-[48px] text-base" size="lg">
          {isSubmitting ? "Submitting..." : "Submit Lab Results"}
        </Button>
      </CardContent>
    </Card>
  );
};

const NumFieldWithWarning = ({
  label, value, onChange, field, required,
}: {
  label: string; value: string; onChange: (v: string) => void; field: string; required?: boolean;
}) => {
  const warning = getWarning(field, value);
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className={warning ? "border-amber-500" : ""}
      />
      {warning && (
        <div className="flex items-start gap-1.5 text-xs text-amber-600">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
};

export default LabResultForm;
