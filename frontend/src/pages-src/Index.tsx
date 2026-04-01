"use client";

import PublicLayout from "@/components/PublicLayout";
import EmailConsentForm from "@/components/EmailConsentForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Shield,
  Clock,
  Users,
  Sparkles,
  Heart,
  CheckCircle,
  ArrowDown,
  ArrowRight,
  Zap,
  Activity,
  Eye,
  Brain,
  Video,
  Scan,
  BookOpen,
  Pill,
} from "lucide-react";
const heroImage = "/images/hero-study.jpg";
const biowellImage = "/images/biowell-energy-field.png";
const sandyPhoto = "/images/sandy-brass.jpg";

const Index = () => {
  const scrollToEligibility = () => {
    document.getElementById("eligibility")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Photobiomodulation therapy illustration showing light therapy for kidney health"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              University-Approved Research Study
            </div>

            <h1 className="text-heading-lg md:text-display font-serif font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Noninvasive Support for Early-Stage Kidney Disease
            </h1>

            <p className="text-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              A university-approved research study exploring light therapy (photobiomodulation) as a gentle, noninvasive approach to preserve renal function and improve quality of life. Led by Sandra Brass, PhD Candidate at Quantum University.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button variant="cta" size="xl" onClick={scrollToEligibility}>
                <Sparkles className="w-5 h-5" />
                Check If I'm Eligible
              </Button>
              <Button variant="outline-accent" size="lg" onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
                Learn More
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About the Study */}
      <section id="about" className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-heading font-serif font-bold text-foreground mb-4">
              What Is This Study About?
            </h2>
            <p className="text-body text-muted-foreground leading-relaxed">
              We are studying whether a safe LED light device, used at home once each day, can help preserve renal function and improve quality of life in people with early-stage chronic kidney disease (CKD).
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <InfoCard
              icon={<Users className="w-7 h-7" />}
              title="24 Participants"
              description="We are seeking 24 participants with early-stage kidney disease. Participants will continue their prescribed medications, normal exercise routine, and current diet."
            />
            <InfoCard
              icon={<Clock className="w-7 h-7" />}
              title="Daily Light Therapy at Home"
              description="Use the provided LED device once each day as directed. The treatment is painless and takes 20–30 minutes. Your daily session journal takes less than 2 minutes."
            />
            <InfoCard
              icon={<Heart className="w-7 h-7" />}
              title="Noninvasive & Safe"
              description="Photobiomodulation (PBM) uses gentle light — no needles, no medications, no side effects expected. Accurate record-keeping of sessions is vital for the study."
            />
          </div>
        </div>
      </section>

      {/* What's Involved */}
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-heading font-serif font-bold text-foreground mb-8 text-center">
              What Does Participation Involve?
            </h2>

            <div className="space-y-4">
              <StepItem number={1} title="Check Your Eligibility" description="Fill out a short form with your name and email. We'll send you a brief health questionnaire." />
              <StepItem number={2} title="Share Your Lab Results" description="Enter your most recent kidney lab results (like eGFR and creatinine) so we can confirm eligibility." />
              <StepItem number={3} title="Join the Study" description="Sign a consent form and answer a few health questionnaires. This takes about 15 minutes." />
              <StepItem number={4} title="Daily Light Therapy at Home" description="Use the provided LED device once each day as directed. The treatment is painless and takes 20–30 minutes. Log your session in the portal — it takes less than 2 minutes." />
              <StepItem number={5} title="Periodic Check-ins" description="The researcher will be reviewing daily logs weekly for compliance. The researcher will check in on days 30, 60, and 90 to answer any questions you may have." />
              <StepItem number={6} title="Bio-Well Energy Scans" description="A Bio-Well GDV scan will be performed when your light device is delivered and again at the completion of the study to measure changes in your energy field." />
            </div>
          </div>
        </div>
      </section>

      {/* About Bio-Well */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-4">
                <Zap className="w-4 h-4" />
                Study Technology
              </div>
              <h2 className="text-heading font-serif font-bold text-foreground mb-4">
                About Bio-Well GDV Camera
              </h2>
              <p className="text-body text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                A revolutionary, non-intrusive way to measure the human energy field using a specialized camera and software system.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
              <div className="flex justify-center">
                <div className="relative w-64 h-80 md:w-72 md:h-96">
                  <img
                    src={biowellImage}
                    alt="Bio-Well GDV energy field scan showing the human biofield aura visualization"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-base text-muted-foreground leading-relaxed">
                  Bio-Well has been developed by the team of <strong className="text-foreground">Dr. Konstantin Korotkov</strong> and Gaia, bringing the powerful <strong className="text-foreground">Gas Discharge Visualization (GDV)</strong> technology to market in an accessible way.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  When a scan is conducted, a weak electrical current is applied to the fingertip for less than a millisecond. The fingertip emits electrons that excite air molecules, creating a glow captured by the camera and processed by the Bio-Well Software to show energy and stress evaluations.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  The analysis is based on <strong className="text-foreground">acupuncture points and meridian science</strong>, verified by 30+ years of clinical experience by hundreds of medical doctors and researchers.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <BioWellFeature
                icon={<Activity className="w-5 h-5" />}
                title="Organ & System Analysis"
                description="Determine which organs and systems may need attention"
              />
              <BioWellFeature
                icon={<Zap className="w-5 h-5" />}
                title="Treatment Response"
                description="Assess energy field responses to different therapies"
              />
              <BioWellFeature
                icon={<Brain className="w-5 h-5" />}
                title="Stress Assessment"
                description="Evaluate psycho-emotional state and stress levels"
              />
              <BioWellFeature
                icon={<Eye className="w-5 h-5" />}
                title="Daily Tracking"
                description="See day-to-day transformations in energy field"
              />
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border text-center">
              <p className="text-sm text-muted-foreground italic">
                Bio-Well is not a medical instrument; it is not designed for medical diagnostics — it measures the energy and stress of a person. Available in 70+ countries. Visit{" "}
                <a href="https://www.bio-well.com" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                  www.bio-well.com
                </a>{" "}
                for more information.
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/about-biowell">
                    Learn More About Bio-Well <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Criteria */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-heading font-serif font-bold text-foreground mb-4">
              Who Can Participate?
            </h2>
            <p className="text-body text-muted-foreground">
              This study is for adults with confirmed early-stage chronic kidney disease.
              Participants must be open to the idea that a simple LED light device may help their body maintain renal function and improve the quality of their life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-heading-sm font-serif font-bold text-success mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                You May Be Eligible If:
              </h3>
              <ul className="space-y-3">
                <EligibilityItem text="You are an adult (ages 18–85)" eligible />
                <EligibilityItem text="You have been diagnosed with CKD Stage 3A, 3B, or 4" eligible />
                <EligibilityItem text="You can use a device at home daily for 90 days" eligible />
                <EligibilityItem text="You are willing to participate in periodic Zoom check-in meetings" eligible />
                <EligibilityItem text="You agree to a Bio-Well scan at device delivery and at study completion" eligible />
                <EligibilityItem text="You have access to a phone or computer" eligible />
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-heading-sm font-serif font-bold text-destructive mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                This Study Is Not For:
              </h3>
              <ul className="space-y-3">
                <EligibilityItem text="People with a heart pacemaker" />
                <EligibilityItem text="CKD Stage 1, 2, or Stage 5 / dialysis patients" />
                <EligibilityItem text="People without a CKD diagnosis" />
                <EligibilityItem text="Those unable to commit to 90 days" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Email Consent / CTA Section */}
      <section id="eligibility" className="py-16 md:py-20 bg-secondary/40">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-heading font-serif font-bold text-foreground mb-3">
                Interested? Let's Get Started
              </h2>
              <p className="text-body text-muted-foreground">
                Fill out the form below with your name and email. We'll then send you a brief health questionnaire and a Renal Function Panel form to confirm your eligibility.
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border">
              <EmailConsentForm />
            </div>
          </div>
        </div>
      </section>

      {/* Researcher Info */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-heading font-serif font-bold text-foreground mb-6">
              About the Researcher
            </h2>
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
              <img
                src={sandyPhoto}
                alt="Sandra Brass, PhD Candidate"
                className="w-40 h-40 rounded-full object-cover object-top mx-auto mb-4 border-4 border-primary/20 shadow-soft"
              />
              <h3 className="text-heading-sm font-serif font-bold text-foreground mb-2">
                Sandra Brass, PhD Candidate
              </h3>
              <p className="text-primary font-medium mb-4">Quantum University</p>
              <p className="text-body text-muted-foreground leading-relaxed">
                Sandra is completing her doctoral dissertation on photobiomodulation as a noninvasive intervention for chronic kidney disease. This study has been reviewed and approved by the Institutional Review Board (IRB).
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

/* Sub-components */

const InfoCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card rounded-xl p-6 shadow-card border border-border text-center hover:shadow-elevated transition-shadow">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const StepItem = ({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) => (
  <div className="flex gap-4 p-5 bg-card rounded-xl shadow-soft border border-border">
    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

const EligibilityItem = ({
  text,
  eligible = false,
}: {
  text: string;
  eligible?: boolean;
}) => (
  <li className="flex items-start gap-3">
    <span className={`flex-shrink-0 mt-0.5 text-lg ${eligible ? "text-success" : "text-destructive"}`}>
      {eligible ? "✅" : "❌"}
    </span>
    <span className="text-base text-foreground leading-relaxed">{text}</span>
  </li>
);
const BioWellFeature = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card rounded-xl p-5 shadow-soft border border-border text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3">
      {icon}
    </div>
    <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

export default Index;
