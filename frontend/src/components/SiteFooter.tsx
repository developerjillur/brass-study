"use client";

import { Sun, Mail, Shield, Lock } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      {/* Accent stripe top */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, hsl(185 55% 35%), hsl(35 90% 50%), hsl(185 55% 35%))" }} />

      <div className="container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 p-1.5">
                <img src="/flower-of-life.svg" alt="" className="w-full h-full invert" />
              </div>
              <span className="font-bold text-lg tracking-tight">PBM Study Portal</span>
            </div>
            <p className="text-sm opacity-75 leading-relaxed max-w-xs">
              A research study by Sandra Brass, PhD Candidate at Quantum University, investigating noninvasive light therapy for early-stage kidney disease.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-base tracking-tight">Security & Compliance</h4>
            <ul className="space-y-3 text-sm opacity-80">
              <li className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 flex-shrink-0 opacity-70" />
                IRB Approved Study
              </li>
              <li className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 flex-shrink-0 opacity-70" />
                HIPAA Compliant Portal
              </li>
              <li className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 flex-shrink-0 opacity-70" />
                256-bit Encrypted Data
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-base tracking-tight">Contact</h4>
            <div className="flex items-center gap-2.5 text-sm opacity-80">
              <Mail className="w-4 h-4 flex-shrink-0 opacity-70" />
              <span>Contact through the portal</span>
            </div>
            <p className="text-sm opacity-50 mt-4 leading-relaxed">
              Sandra Brass, PhD Candidate<br />
              Quantum University
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 mt-10 pt-6 text-center text-sm opacity-50 space-y-1">
          <p>© {new Date().getFullYear()} PBM Study — Quantum University. All rights reserved.</p>
          <p>This portal is for study participants only. All data is handled in compliance with HIPAA regulations.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
