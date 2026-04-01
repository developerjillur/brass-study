"use client";

import { useState } from "react";
import { HelpCircle, X, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const NeedHelpButton = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 bg-card border border-border rounded-xl shadow-elevated p-5 w-72 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground">Need Help?</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about the study or need assistance, you can message the research team directly.
          </p>
          <div className="space-y-2">
            {user && (
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  router.push("/messages");
                  setOpen(false);
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Research Team
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Or call: <strong>(760) 887-9181</strong>
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-elevated hover:bg-primary/90 transition-colors min-h-[48px] text-base font-semibold"
        aria-label="Need help?"
      >
        <HelpCircle className="w-5 h-5" />
        Need help?
      </button>
    </div>
  );
};

export default NeedHelpButton;
