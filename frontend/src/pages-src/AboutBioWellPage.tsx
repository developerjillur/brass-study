"use client";

import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Zap,
  Activity,
  Eye,
  Brain,
  Fingerprint,
  Globe,
  BookOpen,
  Shield,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
const biowellImage = "/images/biowell-energy-field.png";

const AboutBioWellPage = () => {
  const router = useRouter();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="relative container">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
              <Zap className="w-4 h-4" />
              Study Technology
            </div>

            <h1 className="text-heading-lg md:text-display font-serif font-bold text-foreground mb-6">
              About Bio-Well GDV Camera
            </h1>
            <p className="text-body-lg text-muted-foreground leading-relaxed max-w-2xl">
              A revolutionary, non-intrusive way to measure the human energy
              field using Gas Discharge Visualization (GDV) technology — developed
              by Dr. Konstantin Korotkov and used in over 70 countries worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* What is Bio-Well */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center">
              <img
                src={biowellImage}
                alt="Bio-Well GDV energy field scan showing the human biofield aura visualization"
                className="w-64 h-80 md:w-80 md:h-[420px] object-contain"
              />
            </div>
            <div className="space-y-5">
              <h2 className="text-heading font-serif font-bold text-foreground">
                What Is Bio-Well?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Bio-Well has been developed by the team of{" "}
                <strong className="text-foreground">Dr. Konstantin Korotkov</strong>{" "}
                and Gaia to bring the powerful technology known as{" "}
                <strong className="text-foreground">
                  Gas Discharge Visualization (GDV)
                </strong>{" "}
                or{" "}
                <strong className="text-foreground">
                  Electro-Photonic Imaging (EPI)
                </strong>{" "}
                technique to the market in a more accessible way than ever before.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Bio-Well does not measure the anatomical structure of the body, but
                records the <em>functional and energetic condition</em> of organs
                and systems at the moment of measurement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-heading font-serif font-bold text-foreground mb-10 text-center">
              How Does It Work?
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                step={1}
                icon={<Fingerprint className="w-6 h-6" />}
                title="Fingertip Scan"
                description="A weak electrical current is applied to the fingertip for less than a millisecond. In response, the fingertip emits electrons that strike and excite air molecules."
              />
              <StepCard
                step={2}
                icon={<Zap className="w-6 h-6" />}
                title="Gas Discharge Glow"
                description="Excited air molecules create a gas discharge or glow around the fingertip. This glow is captured by the specialized Bio-Well camera."
              />
              <StepCard
                step={3}
                icon={<Eye className="w-6 h-6" />}
                title="Software Analysis"
                description="A digital image of the emission is processed by Bio-Well Software to produce energy and stress evaluations based on acupuncture meridian science."
              />
            </div>

            <div className="mt-10 p-6 bg-card rounded-xl border border-border shadow-soft">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">
                    30+ Years of Clinical Validation
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    The image created in Bio-Well Software is based on the science
                    of acupuncture points and the meridian system, and is verified
                    by more than 30 years of clinical experience by hundreds of
                    medical doctors and researchers via many thousands of patients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Bio-Well Reveals */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-heading font-serif font-bold text-foreground mb-4 text-center">
              What Bio-Well Analysis Reveals
            </h2>
            <p className="text-body text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              Bio-Well presents an analysis of the energy field, allowing
              day-to-day observation of transformations and the influence of
              different treatments, environments, and stimuli.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <FeatureCard
                icon={<Activity className="w-6 h-6" />}
                title="Organ & System Assessment"
                description="Determine which organs and systems of the body may need attention based on their energetic signatures captured through the fingertip scan."
              />
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="Treatment Response Tracking"
                description="Assess how the energy field responds to different influences — therapies, emotions, EMF radiation, medications, supplements, and food."
              />
              <FeatureCard
                icon={<Brain className="w-6 h-6" />}
                title="Psycho-Emotional State"
                description="Provides information on stress levels and anxiety, offering insight into the psycho-emotional wellbeing of the person at the time of measurement."
              />
              <FeatureCard
                icon={<Eye className="w-6 h-6" />}
                title="Daily Energy Tracking"
                description="See day-to-day transformations in the energy field, allowing researchers and individuals to track progress and changes over time."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Bio-Well in This Study */}
      <section className="py-16 md:py-20 bg-secondary/40">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-heading font-serif font-bold text-foreground mb-6">
              Why Is Bio-Well in This Study?
            </h2>
            <p className="text-body text-muted-foreground leading-relaxed mb-6">
              In this photobiomodulation (PBM) study, Bio-Well is used to capture
              objective measurements of participants' energy fields before
              and after the 90-day light therapy intervention. By tracking these
              changes alongside renal function lab panels and validated
              questionnaires, we can build a more comprehensive picture of how PBM
              therapy affects overall well-being.
            </p>
            <p className="text-body text-muted-foreground leading-relaxed">
              Bio-Well provides a unique, non-intrusive data point that complements
              traditional clinical markers — helping us understand the energetic
              dimension of health outcomes in kidney disease management.
            </p>
          </div>
        </div>
      </section>

      {/* Global Reach & Disclaimer */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-card rounded-xl p-6 shadow-soft border border-border text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Available in 70+ Countries
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Bio-Well GDV Camera technology is trusted and used by
                  practitioners and researchers across the globe.
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-soft border border-border text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Non-Medical Instrument
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Bio-Well is not designed for medical diagnostics — it measures
                  the energy and stress of a person.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground italic">
                In case of health concerns, please consult your doctor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

/* Sub-components */

const StepCard = ({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card rounded-xl p-6 shadow-soft border border-border text-center">
    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-3">
      {step}
    </div>
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-3">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-card rounded-xl p-6 shadow-card border border-border flex gap-4">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default AboutBioWellPage;
