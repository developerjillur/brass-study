"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

const MfaSetupPage = () => {
  const router = useRouter();

  return (
    <PublicLayout>
      <div className="container py-12 md:py-20">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-base">
                MFA is not available in self-hosted mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Multi-factor authentication is not supported in the current deployment configuration.
                Contact your administrator for more information.
              </p>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default MfaSetupPage;
