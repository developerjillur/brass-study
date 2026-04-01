"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileCheck } from "lucide-react";

interface ConsentFormProps {
  onComplete: (consented: boolean) => void;
  isSubmitting?: boolean;
}

const ConsentForm = ({ onComplete, isSubmitting }: ConsentFormProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [consentsToParticipate, setConsentsToParticipate] = useState(false);
  const [consentsToData, setConsentsToData] = useState(false);

  const allConsented = hasRead && consentsToParticipate && consentsToData;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Informed Consent</CardTitle>
            <CardDescription>IRB-Approved Study Protocol — Version 1.0</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[400px] rounded-lg border border-border p-4">
          <div className="prose prose-sm max-w-none text-foreground space-y-4">
            <h3 className="text-lg font-semibold">Study Title</h3>
            <p>
              Photobiomodulation (PBM) Therapy for Early-Stage Chronic Kidney Disease:
              A Randomized Controlled Trial Investigating the Effects of Near-Infrared
              Light Therapy on Renal Function Biomarkers and Patient-Reported Outcomes.
            </p>

            <h3 className="text-lg font-semibold">Principal Investigator</h3>
            <p>Sandra Brass, PhD Candidate — Quantum University</p>

            <h3 className="text-lg font-semibold">Purpose of the Study</h3>
            <p>
              The purpose of this research study is to evaluate whether daily at-home
              photobiomodulation (PBM) therapy using a near-infrared LED device can
              improve kidney function biomarkers and quality of life in individuals with
              early-stage chronic kidney disease (CKD Stages 3A–4).
            </p>

            <h3 className="text-lg font-semibold">What Will Happen</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You will be randomly assigned to either the treatment group (active PBM device) or the control group (sham device).</li>
              <li>You will use the assigned device daily for 20 minutes over a 90-day period.</li>
              <li>You will log your therapy sessions in this portal each day.</li>
              <li>You will complete health questionnaires at baseline, day 30, day 60, and day 90.</li>
              <li>You will provide renal function lab results at baseline and day 90.</li>
            </ul>

            <h3 className="text-lg font-semibold">Risks and Benefits</h3>
            <p>
              <strong>Risks:</strong> PBM therapy using near-infrared light at the prescribed
              parameters is considered low-risk. Mild warmth at the application site may
              occur. There are no known serious adverse effects.
            </p>
            <p>
              <strong>Benefits:</strong> You may or may not experience improvement in kidney
              function or well-being. Your participation will contribute to scientific
              knowledge about non-invasive therapies for CKD.
            </p>

            <h3 className="text-lg font-semibold">Confidentiality</h3>
            <p>
              All data collected will be stored securely using HIPAA-compliant systems.
              Your personal information will be de-identified in any publications.
              Only the research team will have access to identifiable data.
            </p>

            <h3 className="text-lg font-semibold">Voluntary Participation</h3>
            <p>
              Your participation is entirely voluntary. You may withdraw at any time
              without penalty or loss of benefits. To withdraw, contact the research
              team through the portal or email the principal investigator.
            </p>

            <h3 className="text-lg font-semibold">Contact Information</h3>
            <p>
              For questions about this study, contact Sandra Brass at Quantum University
              through the study portal. For concerns about your rights as a research
              participant, contact the Quantum University IRB.
            </p>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hasRead"
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked === true)}
            />
            <label htmlFor="hasRead" className="text-sm leading-relaxed cursor-pointer">
              I have read and understand the above informed consent document in its entirety.
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consentsToParticipate"
              checked={consentsToParticipate}
              onCheckedChange={(checked) => setConsentsToParticipate(checked === true)}
            />
            <label htmlFor="consentsToParticipate" className="text-sm leading-relaxed cursor-pointer">
              I voluntarily consent to participate in this research study.
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consentsToData"
              checked={consentsToData}
              onCheckedChange={(checked) => setConsentsToData(checked === true)}
            />
            <label htmlFor="consentsToData" className="text-sm leading-relaxed cursor-pointer">
              I consent to the collection, storage, and use of my health data as described above.
            </label>
          </div>
        </div>

        <Button
          onClick={() => onComplete(true)}
          disabled={!allConsented || isSubmitting}
          className="w-full"
          size="lg"
        >
          <FileCheck className="w-4 h-4 mr-2" />
          {isSubmitting ? "Saving Consent..." : "Sign & Continue"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConsentForm;
