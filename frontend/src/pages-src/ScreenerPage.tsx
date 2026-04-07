"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Send } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const renalPanelSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address").max(255, "Email too long"),
  consentToContact: z.boolean().refine(val => val === true, "You must consent to be contacted"),
  ckdStage: z.enum(["1", "2", "3a", "3b", "4", "5", "unknown"], {
    required_error: "Please select your CKD stage"
  }),
  egfr: z.preprocess((v) => (v === "" || v === undefined || Number.isNaN(v) ? undefined : Number(v)), z.number().min(0, "eGFR must be positive").max(200, "eGFR seems too high").optional()),
  creatinine: z.preprocess((v) => (v === "" || v === undefined || Number.isNaN(v) ? undefined : Number(v)), z.number().min(0, "Creatinine must be positive").max(20, "Creatinine seems too high").optional()),
  bun: z.preprocess((v) => (v === "" || v === undefined || Number.isNaN(v) ? undefined : Number(v)), z.number().min(0, "BUN must be positive").max(200, "BUN seems too high").optional()),
  calcium: z.preprocess((v) => (v === "" || v === undefined || Number.isNaN(v) ? undefined : Number(v)), z.number().min(0, "Calcium must be positive").max(20, "Calcium seems too high").optional()),
  phosphorus: z.preprocess((v) => (v === "" || v === undefined || Number.isNaN(v) ? undefined : Number(v)), z.number().min(0, "Phosphorus must be positive").max(20, "Phosphorus seems too high").optional()),
  albumin: z.preprocess((v) => (v === "" || v === undefined || Number.isNaN(v) ? undefined : Number(v)), z.number().min(0, "Albumin must be positive").max(10, "Albumin seems too high").optional()),
  labDate: z.string().optional(),
  doctorName: z.string().max(100, "Doctor name too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

type RenalPanelForm = z.infer<typeof renalPanelSchema>;

const ScreenerPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Check if we came from the interest form (screening already created)
  const existingScreeningId = typeof window !== "undefined" ? localStorage.getItem("screening_id") || "" : "";
  const existingName = typeof window !== "undefined" ? localStorage.getItem("screening_name") || "" : "";
  const existingEmail = typeof window !== "undefined" ? localStorage.getItem("screening_email") || "" : "";
  const hasExistingScreening = !!existingScreeningId;

  const form = useForm<RenalPanelForm>({
    resolver: zodResolver(renalPanelSchema),
    defaultValues: {
      fullName: existingName,
      email: existingEmail,
      consentToContact: hasExistingScreening ? true : false,
      ckdStage: undefined,
    },
  });

  const onSubmit = async (data: RenalPanelForm) => {
    setIsSubmitting(true);

    try {
      let screeningId = existingScreeningId;

      // If no existing screening, create one (direct access to screener page)
      if (!screeningId) {
        const screeningResult = await apiClient.post("/api/screening", {
          full_name: data.fullName,
          email: data.email,
          consent_to_contact: data.consentToContact,
        });
        screeningId = (screeningResult as any)?.id || "";
      }

      // Submit renal panel linked to the screening
      await apiClient.post("/api/renal-panels/screening", {
        screeningId: screeningId,
        full_name: data.fullName,
        ckd_stage: data.ckdStage,
        egfr: data.egfr || null,
        creatinine: data.creatinine || null,
        bun: data.bun || null,
        calcium: data.calcium || null,
        phosphorus: data.phosphorus || null,
        albumin: data.albumin || null,
        lab_date: data.labDate || null,
        doctor_name: data.doctorName || null,
        notes: data.notes || null,
      });

      // Update screening status to screener_completed
      if (screeningId) {
        await apiClient.put(`/api/screening/${screeningId}/status`, {
          status: "screener_completed",
        }).catch(() => {}); // non-critical if this fails (may need auth)
      }

      // Clear localStorage
      localStorage.removeItem("screening_id");
      localStorage.removeItem("screening_name");
      localStorage.removeItem("screening_email");

      toast({
        title: "Screener Submitted Successfully",
        description: "Thank you! A researcher will review your results and contact you about eligibility.",
      });

      router.push("/");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
              <Activity className="w-8 h-8" />
            </div>
            <h1 className="text-heading font-serif font-bold text-foreground mb-2">
              Renal Function Panel Screener
            </h1>
            <p className="text-body text-muted-foreground">
              Please provide your latest kidney function test results to determine study eligibility.
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Lab Results Information</CardTitle>
              <CardDescription>
                Enter your most recent renal function panel results. If you don't have all values, that's okay - enter what you have.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="fullName" className="form-label">Full Name *</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="Enter your full name"
                      className="text-base"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="form-label">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="Enter your email address"
                      className="text-base"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="consent"
                      {...form.register("consentToContact")}
                      className="mt-1 h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="consent" className="text-sm font-normal text-foreground leading-relaxed">
                      I consent to be contacted by the research team about this study. *
                    </Label>
                  </div>
                  {form.formState.errors.consentToContact && (
                    <p className="text-sm text-destructive">{form.formState.errors.consentToContact.message}</p>
                  )}
                </div>

                {/* Lab Results */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground">Kidney Function Results</h3>

                  <div>
                    <Label htmlFor="ckdStage" className="form-label">CKD Stage *</Label>
                    <Select onValueChange={(value) => form.setValue("ckdStage", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your CKD stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Stage 1 (eGFR ≥90)</SelectItem>
                        <SelectItem value="2">Stage 2 (eGFR 60-89)</SelectItem>
                        <SelectItem value="3a">Stage 3a (eGFR 45-59)</SelectItem>
                        <SelectItem value="3b">Stage 3b (eGFR 30-44)</SelectItem>
                        <SelectItem value="4">Stage 4 (eGFR 15-29)</SelectItem>
                        <SelectItem value="5">Stage 5 (eGFR &lt;15)</SelectItem>
                        <SelectItem value="unknown">Unknown/Not specified</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.ckdStage && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.ckdStage.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="egfr" className="form-label">eGFR (mL/min/1.73m²)</Label>
                      <Input
                        id="egfr"
                        type="number"
                        step="0.1"
                        {...form.register("egfr")}
                        placeholder="e.g., 45.2"
                        className="text-base"
                      />
                      {form.formState.errors.egfr && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.egfr.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="creatinine" className="form-label">Creatinine (mg/dL)</Label>
                      <Input
                        id="creatinine"
                        type="number"
                        step="0.1"
                        {...form.register("creatinine")}
                        placeholder="e.g., 1.5"
                        className="text-base"
                      />
                      {form.formState.errors.creatinine && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.creatinine.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bun" className="form-label">BUN (mg/dL)</Label>
                      <Input
                        id="bun"
                        type="number"
                        step="0.1"
                        {...form.register("bun")}
                        placeholder="e.g., 25"
                        className="text-base"
                      />
                      {form.formState.errors.bun && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.bun.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="calcium" className="form-label">Calcium (mg/dL)</Label>
                      <Input
                        id="calcium"
                        type="number"
                        step="0.1"
                        {...form.register("calcium")}
                        placeholder="e.g., 9.5"
                        className="text-base"
                      />
                      {form.formState.errors.calcium && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.calcium.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phosphorus" className="form-label">Phosphorus (mg/dL)</Label>
                      <Input
                        id="phosphorus"
                        type="number"
                        step="0.1"
                        {...form.register("phosphorus")}
                        placeholder="e.g., 3.8"
                        className="text-base"
                      />
                      {form.formState.errors.phosphorus && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.phosphorus.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="albumin" className="form-label">Albumin (g/dL)</Label>
                      <Input
                        id="albumin"
                        type="number"
                        step="0.1"
                        {...form.register("albumin")}
                        placeholder="e.g., 3.5"
                        className="text-base"
                      />
                      {form.formState.errors.albumin && (
                        <p className="text-sm text-destructive mt-1">{form.formState.errors.albumin.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="labDate" className="form-label">Lab Test Date</Label>
                      <Input
                        id="labDate"
                        type="date"
                        {...form.register("labDate")}
                        className="text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="doctorName" className="form-label">Ordering Doctor</Label>
                      <Input
                        id="doctorName"
                        {...form.register("doctorName")}
                        placeholder="Dr. Smith"
                        className="text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="form-label">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      {...form.register("notes")}
                      placeholder="Any additional information about your kidney function or medications..."
                      className="text-base min-h-[100px]"
                    />
                    {form.formState.errors.notes && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.notes.message}</p>
                    )}
                  </div>
                </div>

                {/* Consent */}
                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground">Consent to Share Health Information</h3>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      By submitting this form, I consent to share my renal function panel results with the BRASS Study research team led by Sandra Brass, PhD Candidate at Quantum University. I understand that:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                      <li>My health information will be used solely to determine my eligibility for this research study.</li>
                      <li>My data will be kept confidential and handled in compliance with HIPAA regulations.</li>
                      <li>I may withdraw my information at any time by contacting the researcher.</li>
                      <li>Submitting this form does not obligate me to participate in the study.</li>
                    </ul>
                  </div>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="healthConsent"
                      required
                      className="mt-1 h-5 w-5 rounded border-input accent-primary cursor-pointer"
                    />
                    <Label htmlFor="healthConsent" className="text-sm font-normal text-foreground leading-relaxed cursor-pointer">
                      I have read and agree to the above consent. I authorize the sharing of my renal function panel results for eligibility screening purposes. <span className="text-destructive">*</span>
                    </Label>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isSubmitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit Screener"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ScreenerPage;