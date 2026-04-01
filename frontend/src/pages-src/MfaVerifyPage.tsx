"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";

const MfaVerifyPage = () => {
  const router = useRouter();

  useEffect(() => {
    // MFA not available in self-hosted mode, redirect to dashboard
    router.push("/dashboard");
  }, [router]);

  return (
    <PublicLayout>
      <div className="container py-12 md:py-20">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default MfaVerifyPage;
