"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PublicLayout from "@/components/PublicLayout";

const resetSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[!@#$%^&*]/, "Must include a special character (!@#$%^&*)"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") {
      setIsRecovery(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/reset-password", { newPassword: password });
      toast.success("Password updated successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isRecovery) {
    return (
      <PublicLayout>
        <div className="container py-16 md:py-24">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-heading font-serif font-bold text-foreground mb-4">Invalid Link</h1>
            <p className="text-body text-muted-foreground">This password reset link is invalid or has expired. Please request a new one.</p>
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
            <h1 className="text-heading font-serif font-bold text-foreground mb-2">Set New Password</h1>
            <p className="text-body text-muted-foreground">Choose a strong password for your account.</p>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="password" className="form-label flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 px-4 pr-12 rounded-lg border-2 border-input bg-background text-foreground text-body focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-2 font-medium" role="alert">⚠️ {errors.password}</p>
                )}
                <div className="text-xs text-muted-foreground space-y-1 mt-1">
                  <p>Password must include:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li className={password.length >= 8 ? "text-primary" : ""}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(password) ? "text-primary" : ""}>One uppercase letter</li>
                    <li className={/[a-z]/.test(password) ? "text-primary" : ""}>One lowercase letter</li>
                    <li className={/[0-9]/.test(password) ? "text-primary" : ""}>One number</li>
                    <li className={/[!@#$%^&*]/.test(password) ? "text-primary" : ""}>One special character (!@#$%^&*)</li>
                  </ul>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="form-label flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-14 px-4 rounded-lg border-2 border-input bg-background text-foreground text-body focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-2 font-medium" role="alert">⚠️ {errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ResetPasswordPage;
