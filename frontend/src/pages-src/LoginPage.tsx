"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

const LoginPage = () => {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
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
      const data = await apiClient.post<{ access_token: string; user: any }>("/api/auth/login", {
        email: result.data.email,
        password: result.data.password,
      });

      localStorage.setItem("auth_token", data.access_token);
      await refreshUser();

      if (data.user?.force_password_change) {
        router.push("/change-password");
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(
        err.message === "Invalid credentials"
          ? "The email or password you entered is incorrect. Please try again."
          : err.message
      );
    }
    setIsLoading(false);
  };

  return (
    <PublicLayout>
      <div className="container py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-heading font-serif font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-body text-muted-foreground">
              Sign in to your study portal account
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border">
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
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

              <div>
                <label htmlFor="password" className="form-label flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 px-4 pr-12 rounded-lg border-2 border-input bg-background text-foreground text-body focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-2 font-medium" role="alert">⚠️ {errors.password}</p>
                )}
              </div>

              {/* Remember device */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-input accent-primary cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                  Remember this device (HIPAA-approved with disclaimer)
                </label>
              </div>

              <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <Link
                href="/forgot-password"
                className="text-primary font-medium hover:underline text-base block"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            🔒 This portal is HIPAA-compliant. Your session will automatically end after 30 minutes of inactivity.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
