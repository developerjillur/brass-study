"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PublicLayout from "@/components/PublicLayout";

const forgotSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = forgotSchema.safeParse({ email });
    if (!result.success) {
      setErrors({ email: result.error.issues[0].message });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/forgot-password", { email: result.data.email });
      setSent(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <PublicLayout>
        <div className="container py-16 md:py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-heading font-serif font-bold text-foreground mb-4">Check Your Email</h1>
            <p className="text-body text-muted-foreground mb-6">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
            </p>
            <Link href="/login">
              <Button variant="outline-accent" size="lg">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-heading font-serif font-bold text-foreground mb-2">Reset Password</h1>
            <p className="text-body text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="form-label flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-4 rounded-lg border-2 border-input bg-background text-foreground text-body focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-2 font-medium" role="alert">⚠️ {errors.email}</p>
                )}
              </div>

              <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-primary font-medium hover:underline text-base flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForgotPasswordPage;
