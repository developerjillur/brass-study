"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import DemographicsForm from "@/components/onboarding/DemographicsForm";
import type { DemographicsData } from "@/components/onboarding/DemographicsForm";
import ConsentForm from "@/components/onboarding/ConsentForm";
import AssessmentForm from "@/components/onboarding/AssessmentForm";
import BaselineLabForm from "@/components/onboarding/BaselineLabForm";
import { HADS, PHQ9, GAD7, PSS10 } from "@/data/questionnaires";
import { CheckCircle2, ClipboardList, FileText, Brain, Heart, UserCircle, FlaskConical, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  { label: "Intake", icon: UserCircle },
  { label: "IRB Consent", icon: FileText },
  { label: "HADS", icon: Heart },
  { label: "PHQ-9 & GAD-7", icon: Brain },
  { label: "PSS-10", icon: ClipboardList },
  { label: "Baseline Labs", icon: FlaskConical },
];

const OnboardingPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadProgress();
    }
  }, [user, loading]);

  const loadProgress = async () => {
    if (!user) return;
    const participant = await apiClient.get("/api/participants/me").catch(() => []);

    if (!participant) {
      toast({ title: "No participant record found", description: "Please complete screening first.", variant: "destructive" });
      router.push("/dashboard");
      return;
    }

    if (participant.onboarding_completed) {
      toast({ title: "Onboarding already completed" });
      router.push("/dashboard");
      return;
    }

    setParticipantId(participant.id);
    setCurrentStep(participant.onboarding_step);
    setIsLoading(false);
  };

  const advanceStep = async (nextStep: number) => {
    if (!participantId) return;

    const isComplete = nextStep > STEPS.length;
    try {
      await apiClient.put(`/api/participants/${participantId}`, {
        onboarding_step: isComplete ? STEPS.length : nextStep,
        onboarding_completed: isComplete,
        status: isComplete ? "active" as const : "onboarding" as const,
        ...(isComplete ? { enrolled_at: new Date().toISOString(), study_start_date: new Date().toISOString().split("T")[0] } : {}),
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
      return;
    }

    if (isComplete) {
      setShowCompletion(true);
    } else {
      setCurrentStep(nextStep);
      // Scroll to top so the new step is visible
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Step 1: Demographics/Intake
  const handleDemographicsComplete = async (data: DemographicsData) => {
    if (!user || !participantId) return;
    setIsSubmitting(true);

    try {
      await apiClient.post("/api/participant-intake", {
        participant_id: participantId,
        user_id: user.id,
        age: data.age,
        sex: data.sex,
        ethnicity: data.ethnicity,
        ckd_diagnosis_year: data.ckd_diagnosis_year,
        current_medications: data.current_medications,
        comorbidities: data.comorbidities,
        allergies: data.allergies,
        primary_doctor_name: data.primary_doctor_name,
        primary_doctor_phone: data.primary_doctor_phone,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
        signature_text: data.signature_text,
        signed_at: new Date().toISOString(),
      });

      await advanceStep(2);
    } catch (error: any) {
      toast({ title: "Error saving intake form", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Consent
  const handleConsentComplete = async (consented: boolean) => {
    if (!user || !participantId) return;
    setIsSubmitting(true);

    try {
      const result = await apiClient.post("/api/consent", {
        participant_id: participantId,
        user_id: user.id,
        consent_type: "irb_consent",
        consented,
        consent_version: "1.0",
        signed_at: new Date().toISOString(),
      });

      await advanceStep(3);
    } catch (error: any) {
      toast({ title: "Error saving consent", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssessmentComplete = async (
    assessmentType: string,
    responses: Record<string, number>,
    totalScore: number,
    subscaleScores?: Record<string, number>,
    nextStep?: number
  ) => {
    if (!user || !participantId) return;
    setIsSubmitting(true);

    try {
      const result = await apiClient.post("/api/assessments", {
        participant_id: participantId,
        user_id: user.id,
        assessment_type: assessmentType,
        responses: responses as any,
        total_score: totalScore,
        subscale_scores: subscaleScores ? (subscaleScores as any) : null,
        time_point: "baseline",
        completed_at: new Date().toISOString(),
      });

      await advanceStep(nextStep ?? currentStep + 1);
    } catch (error: any) {
      toast({ title: "Error saving assessment", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4 combines PHQ-9 and GAD-7
  const [phq9Done, setPhq9Done] = useState(false);
  const [phq9Data, setPhq9Data] = useState<{ responses: Record<string, number>; total: number } | null>(null);

  const handlePhq9Complete = (responses: Record<string, number>, total: number) => {
    setPhq9Data({ responses, total });
    setPhq9Done(true);
  };

  const handleGad7Complete = async (responses: Record<string, number>, total: number) => {
    if (!phq9Data) return;
    setIsSubmitting(true);

    try {
      await handleAssessmentComplete("phq9", phq9Data.responses, phq9Data.total, undefined, undefined);

      if (!user || !participantId) return;
      const result = await apiClient.post("/api/assessments", {
        participant_id: participantId,
        user_id: user.id,
        assessment_type: "gad7",
        responses: responses as any,
        total_score: total,
        time_point: "baseline",
        completed_at: new Date().toISOString(),
      });

      await advanceStep(5);
    } catch (error: any) {
      toast({ title: "Error saving assessments", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 6: Baseline Labs
  const handleBaselineLabComplete = async (submitted: boolean) => {
    await advanceStep(STEPS.length + 1);
  };

  if (loading || isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your setup...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Completion screen
  if (showCompletion) {
    return (
      <PublicLayout>
        <div className="container py-12 md:py-20">
          <div className="max-w-lg mx-auto text-center">
            <Card className="shadow-card border-primary/20">
              <CardContent className="py-12 px-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <PartyPopper className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-3">
                  You're All Set!
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Your study setup is complete. Sandra Brass will review your information and reach out to schedule your kickoff Zoom meeting where you'll receive your PBM light therapy device.
                </p>
                <div className="space-y-3 text-left bg-muted/30 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold text-foreground text-sm">Next steps:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Schedule a Zoom meeting</strong> with the research team from your dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Submit your <strong>daily therapy log</strong> once your device arrives and you start sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Watch <strong>Messages</strong> on your dashboard for updates from Sandra</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Submit your <strong>follow-up lab results</strong> at Day 90 (you'll get a reminder)</span>
                    </li>
                  </ul>
                </div>
                <Button size="lg" className="w-full min-h-[48px] text-base" onClick={() => router.push("/dashboard")}>
                  Go to My Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Step indicator */}
          <div className="mb-8">
            <h1 className="text-heading font-serif font-bold text-foreground mb-2 text-center">
              Join the Study
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              Complete these steps to get started. Step {currentStep} of {STEPS.length}.
            </p>

            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                const Icon = step.icon;

                return (
                  <div key={step.label} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {idx > 0 && (
                        <div
                          className={`h-0.5 flex-1 ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : isActive
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isActive ? "font-semibold text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          {currentStep === 1 && (
            <DemographicsForm onComplete={handleDemographicsComplete} isSubmitting={isSubmitting} />
          )}

          {currentStep === 2 && (
            <ConsentForm onComplete={handleConsentComplete} isSubmitting={isSubmitting} />
          )}

          {currentStep === 3 && (
            <AssessmentForm
              questionnaire={HADS}
              onComplete={(responses, total, subscales) =>
                handleAssessmentComplete("hads", responses, total, subscales)
              }
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 4 && !phq9Done && (
            <AssessmentForm
              questionnaire={PHQ9}
              onComplete={handlePhq9Complete}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 4 && phq9Done && (
            <AssessmentForm
              questionnaire={GAD7}
              onComplete={handleGad7Complete}
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 5 && (
            <AssessmentForm
              questionnaire={PSS10}
              onComplete={(responses, total) =>
                handleAssessmentComplete("pss10", responses, total, undefined, 6)
              }
              isSubmitting={isSubmitting}
            />
          )}

          {currentStep === 6 && participantId && user && (
            <BaselineLabForm
              participantId={participantId}
              userId={user.id}
              onComplete={handleBaselineLabComplete}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default OnboardingPage;
