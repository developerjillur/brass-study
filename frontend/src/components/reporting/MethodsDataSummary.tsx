"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  totalParticipants: number;
  activeCount: number;
  completedCount: number;
}

const MethodsDataSummary = ({ totalParticipants, activeCount, completedCount }: Props) => {
  const { toast } = useToast();

  const text = `Data was collected from N=${totalParticipants} participants over a 90-day period via a HIPAA-compliant web portal (Study Participant Portal). Participants were randomly assigned to one of two conditions using a computer-generated, double-masked randomization protocol: Group S (active photobiomodulation, stepped duration protocol: 20 min/day for Days 1–30, 25 min/day for Days 31–60, 30 min/day for Days 61–90) or Group C (placebo, consistent 20 min/day throughout). Neither participants nor the researcher were aware of group assignments during the active study period.

Validated psychological assessments were administered at four time points: baseline, Week 4, Week 8, and Week 12. Instruments included the Hospital Anxiety and Depression Scale (HADS; Zigmond & Snaith, 1983), Patient Health Questionnaire-9 (PHQ-9; Kroenke et al., 2001), Generalized Anxiety Disorder-7 (GAD-7; Spitzer et al., 2006), and the Perceived Stress Scale (PSS-10; Cohen et al., 1983). All assessments were auto-scored by the portal system.

Renal function was monitored via self-reported lab values (eGFR, Creatinine, BUN, Calcium, Phosphorus, Albumin) submitted at baseline, Week 4, Week 8, and Week 12. Participants submitted daily therapy logs recording application site (navel or wrist), session duration, pain levels (before/after), fatigue level, and any side effects or notes.

Of the ${totalParticipants} enrolled participants, ${completedCount} completed the full 90-day protocol. Daily log compliance was tracked as the ratio of submitted sessions to elapsed study days.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Methods text copied to clipboard." });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Auto-Generated Methods Section
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Copy this text directly into your dissertation's Methods chapter. Edit participant counts as needed.
        </p>
        <div className="p-4 bg-muted/30 rounded-lg border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap font-serif">
          {text}
        </div>
        <Button variant="outline" onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
        </Button>
      </CardContent>
    </Card>
  );
};

export default MethodsDataSummary;
