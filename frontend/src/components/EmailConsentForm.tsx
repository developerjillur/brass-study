"use client";

import { useState } from "react";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const emailConsentSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  consent: z.boolean().refine((val) => val === true, "You must consent to be contacted"),
});

type EmailConsentData = z.infer<typeof emailConsentSchema>;

const EmailConsentForm = () => {
  const [formData, setFormData] = useState({ fullName: "", email: "", consent: false });
  const [errors, setErrors] = useState<Partial<Record<keyof EmailConsentData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = emailConsentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof EmailConsentData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post("/api/screening", {
        full_name: result.data.fullName,
        email: result.data.email,
        consent_to_contact: result.data.consent,
      });

      setSubmitted(true);
      toast.success("Your information has been submitted successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-heading-sm font-serif font-bold text-foreground mb-3">
          Thank You!
        </h3>
        <p className="text-body text-muted-foreground max-w-md mx-auto leading-relaxed">
          We received your information. You will receive an email with a brief health questionnaire within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="form-label flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
          className="w-full h-14 px-4 rounded-lg border-2 border-input bg-background text-foreground text-body focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          placeholder="Enter your full name"
          autoComplete="name"
        />
        {errors.fullName && (
          <p className="text-destructive text-sm mt-2 font-medium" role="alert">
            ⚠️ {errors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="form-label flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full h-14 px-4 rounded-lg border-2 border-input bg-background text-foreground text-body focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          placeholder="Enter your email address"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-destructive text-sm mt-2 font-medium" role="alert">
            ⚠️ {errors.email}
          </p>
        )}
      </div>

      {/* Consent Checkbox */}
      <div>
        <label
          htmlFor="consent"
          className="flex items-start gap-3 p-4 rounded-lg border-2 border-input bg-secondary/30 cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input
            id="consent"
            type="checkbox"
            checked={formData.consent}
            onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
            className="mt-1 w-6 h-6 rounded border-2 border-input text-primary focus:ring-primary flex-shrink-0"
          />
          <span className="text-base text-foreground leading-relaxed">
            I consent to being contacted by the researcher regarding this study. I understand my information will be kept confidential and secure.
          </span>
        </label>
        {errors.consent && (
          <p className="text-destructive text-sm mt-2 font-medium" role="alert">
            ⚠️ {errors.consent}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="cta"
        size="xl"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          <>
            Submit My Information
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        🔒 Your information is encrypted and protected under HIPAA regulations.
      </p>
    </form>
  );
};

export default EmailConsentForm;
