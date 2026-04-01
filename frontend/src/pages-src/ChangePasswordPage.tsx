"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import PublicLayout from "@/components/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ChangePasswordPage = () => {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (newPassword.length < 8) e.newPassword = "Password must be at least 8 characters";
    if (!/[A-Z]/.test(newPassword)) e.newPassword = "Must include an uppercase letter";
    if (!/[a-z]/.test(newPassword)) e.newPassword = "Must include a lowercase letter";
    if (!/[0-9]/.test(newPassword)) e.newPassword = "Must include a number";
    if (!/[!@#$%^&*]/.test(newPassword)) e.newPassword = "Must include a special character (!@#$%^&*)";
    if (newPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/change-password", { newPassword });

      toast.success("Password updated successfully! Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif">Set Your New Password</CardTitle>
              <CardDescription className="text-base">
                For your security, please create a new password to replace your temporary one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-base font-semibold">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10 min-h-[48px]"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword}</p>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1 mt-1">
                    <p>Password must include:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li className={newPassword.length >= 8 ? "text-primary" : ""}>At least 8 characters</li>
                      <li className={/[A-Z]/.test(newPassword) ? "text-primary" : ""}>One uppercase letter</li>
                      <li className={/[a-z]/.test(newPassword) ? "text-primary" : ""}>One lowercase letter</li>
                      <li className={/[0-9]/.test(newPassword) ? "text-primary" : ""}>One number</li>
                      <li className={/[!@#$%^&*]/.test(newPassword) ? "text-primary" : ""}>One special character (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-base font-semibold">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 min-h-[48px]"
                      placeholder="Re-enter your new password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full min-h-[48px] text-base"
                  size="lg"
                >
                  {isLoading ? "Updating..." : "Set New Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ChangePasswordPage;
