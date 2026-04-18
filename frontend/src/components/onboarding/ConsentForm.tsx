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
            <CardTitle className="text-xl">Information and Consent Form</CardTitle>
            <CardDescription>Please review the study details and provide your consent to participate.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScrollArea className="h-[500px] rounded-lg border border-border p-4">
          <div className="prose prose-sm max-w-none text-foreground space-y-4">
            <div className="text-center space-y-1 pb-3 border-b border-border">
              <h2 className="text-xl font-bold">Information and Consent Form for Approved Research Study</h2>
              <p className="text-sm italic text-muted-foreground">Dissertation Title: Noninvasive Support for Early-Stage Kidney Disease</p>
            </div>

            <p><strong>Quantum University Dissertation Professor:</strong> Dr. Or Pondak, PhD, DNM</p>

            <p>
              <strong>Description of study:</strong> This study investigates the effects of daily, home-based light therapy on kidney function in individuals with stage 3A-4 chronic kidney disease. Participants will use a safe, non-invasive treatment daily and share their experiences and health measures. Participants will continue their prescribed medications and maintain their usual diet and exercise routine, thereby enabling the study to examine photobiomodulation (PBM) therapy in everyday life. The study follows the natural and integrative medicine approach promoted by Quantum University.
            </p>

            <p>
              <strong>Participant Requirements:</strong> Eligible participants must be between 18 and 85 years of age and have a documented diagnosis of stage 3A-4 CKD with an eGFR between 15 and 59. Participants should be willing to use a small handheld PBM light device at home, applied to either the wrist or the navel — locations corresponding to acupuncture points traditionally associated with the kidney and bladder meridians in Traditional Chinese Medicine (TCM).
            </p>

            <p>
              <strong>Time commitment:</strong> One 20-30 minute PBM therapy session per day, 7 days a week, for 12 weeks; daily journaling of each session&apos;s duration; and submission of pre- and post-study blood and urine laboratory results for kidney function, as well as surveys measuring your energy, perceived stress, and anxiety; and Bio-Wells scans (see definitions below). Daily journal entries should include the date, a W or N indicating whether the wrist or navel was used, and the session length. Each entry should take about a minute to complete.
            </p>

            <p>
              <strong>Protocol:</strong> Once an individual responds to the Marketing and Recruitment Message, they will be contacted via email to submit an Assessment Form for study participants, a Renal Function Panel survey, and three pre-study surveys measuring perceived stress, anxiety, and energy levels. A calendar invite for a 30-minute Zoom meeting will be sent. Upon approval to enter the study, the researcher will send the participant another calendar invitation for an in-person Bio-Well scan. The participant will then be shown how to conduct a PBM light therapy session safely and will receive their light device.
            </p>

            <p>
              Participants will self-administer PBM light therapy daily for 90 days. Follow-up assessment communications will be sent weekly, asking for a photo of that week&apos;s journal page. Adherence will be monitored through daily therapy journals and reviewed weekly and at the final in-person visit. The study will use a double-masked design, meaning neither you nor the researcher will know whether you are receiving active light therapy or a placebo.
            </p>

            <p>
              There will be two therapy groups: The first group will use the assigned device daily for 20 minutes over a 90-day period. The second group will use the assigned device daily for 20 minutes for the first 30 days, increase to 25 minutes for days 31-60 and finally 30 minutes for days 61-90.
            </p>

            <p>
              There will be 24 study participants: 12 in the active group and 12 in the placebo group. To ensure fairness, participants will be randomly assigned to the two groups. Upon completion of the study, participants will be allowed to retain the PBM light devices. After the study, those in the placebo group will receive active lights. Before-and-after Bio-Well reports will be emailed to each participant.
            </p>

            <p>
              <strong>How the results will be measured:</strong> The study will measure outcomes using self-reported standard blood and urine tests that reflect kidney health, as well as surveys assessing physical function and well-being. Results collected before and after the PBM light therapy will be compared to determine whether changes occurred over the 90 days.
            </p>

            <p><strong>Definitions:</strong></p>
            <p>
              <strong>PBM:</strong> The regulation or adjustment of biological (living) processes using light. A non-invasive therapy that uses low-level red light from LEDs to stimulate cells, triggering beneficial healing responses in the body and boosting mitochondrial cellular energy (ATP).
            </p>
            <p>
              <strong>Bio-Well scans:</strong> Measure light emitted by the fingers to produce images that indirectly reflect the body&apos;s energy and that of its organs, including the kidneys. These exploratory measures will help us understand bioenergetic changes during the study, though they are not diagnostic.
            </p>

            <p>
              <strong>Payment:</strong> There is no charge to participate in the study; however, participants who do not complete the study will need to return the PBM light device, which will incur a small shipping fee.
            </p>

            <p>
              <strong>Risks:</strong> Due to LED lighting, do not shine the PBM light device into the eyes. No risks beyond those of day-to-day life are anticipated. Please contact the researcher immediately if any adverse events occur. Your safety and well-being are our top priority.
            </p>

            <p>
              <strong>Benefits:</strong> Study participants may experience improvements in kidney function, increased energy, and reduced stress and/or anxiety, which can contribute to a better quality of life and well-being.
            </p>

            <p>
              <strong>Confidentiality:</strong> Any information from this study that could identify you will be kept private. Your participation will help advance understanding of chronic kidney disease management and is highly valued. You may withdraw at any time without penalty, and data collected before withdrawal may be retained unless you request removal.
            </p>

            <p>
              <strong>Question and Contact Information:</strong> If you have any questions or need further information regarding this thesis study, please feel free to contact the researcher, Sandy Brass, at Sandybrass9032@gmail.com.
            </p>

            <p>
              <strong>Right to Withdraw:</strong> Your participation is voluntary; refusal to participate will involve no penalty or loss of benefits to which you are otherwise entitled.
            </p>

            <p>
              <strong>Dissertation Professor Committee Approval:</strong> This research proposal has been reviewed and approved by the Dissertation Professor Committee, and it has been determined that this study meets the ethical obligation required by Quantum University policies.
            </p>

            <p>
              <strong>Participant Signature:</strong> My signature below formally acknowledges that I have read this document and understand the information contained herein. The research has answered my questions and concerns.
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
