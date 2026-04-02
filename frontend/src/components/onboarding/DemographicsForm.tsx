"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCircle, Stethoscope, Phone, PenLine } from "lucide-react";

interface DemographicsFormProps {
  onComplete: (data: DemographicsData) => void;
  isSubmitting?: boolean;
}

export interface DemographicsData {
  date_of_birth: string;
  age: number | null;
  sex: string;
  ethnicity: string;
  ckd_diagnosis_year: number | null;
  current_medications: string;
  comorbidities: string[];
  allergies: string;
  primary_doctor_name: string;
  primary_doctor_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  signature_text: string;
}

const COMORBIDITY_OPTIONS = [
  "Hypertension",
  "Type 2 Diabetes",
  "Heart Disease",
  "Anemia",
  "Bone/Mineral Disorder",
  "Gout",
  "None of the above",
];

const DemographicsForm = ({ onComplete, isSubmitting }: DemographicsFormProps) => {
  const [section, setSection] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<DemographicsData>({
    date_of_birth: "",
    age: null,
    sex: "",
    ethnicity: "",
    ckd_diagnosis_year: null,
    current_medications: "",
    comorbidities: [],
    allergies: "",
    primary_doctor_name: "",
    primary_doctor_phone: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    signature_text: "",
  });
  const [signatureConfirm, setSignatureConfirm] = useState(false);

  const update = (key: keyof DemographicsData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleComorbidity = (item: string) => {
    setForm((prev) => {
      const current = prev.comorbidities;
      if (item === "None of the above") {
        return { ...prev, comorbidities: current.includes(item) ? [] : [item] };
      }
      const filtered = current.filter((c) => c !== "None of the above");
      return {
        ...prev,
        comorbidities: filtered.includes(item)
          ? filtered.filter((c) => c !== item)
          : [...filtered, item],
      };
    });
  };

  const canAdvance1 = form.date_of_birth && form.age && form.age > 0 && form.sex && form.ethnicity;
  const canAdvance2 = form.comorbidities.length > 0;
  const canAdvance3 = form.emergency_contact_name && form.emergency_contact_phone;
  const canSubmit = form.signature_text.length >= 3 && signatureConfirm;

  const sectionTitles = [
    { title: "Demographics", icon: UserCircle },
    { title: "Medical History & Medications", icon: Stethoscope },
    { title: "Emergency Contact", icon: Phone },
    { title: "Digital Signature", icon: PenLine },
  ];

  const Icon = sectionTitles[section - 1].icon;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {sectionTitles[section - 1].title}
            </CardTitle>
            <CardDescription>
              Section {section} of 4 — Study Intake Form
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: Demographics */}
        {section === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.date_of_birth}
                onChange={(e) => {
                  update("date_of_birth", e.target.value);
                  if (e.target.value) {
                    const birthDate = new Date(e.target.value);
                    const today = new Date();
                    let calcAge = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calcAge--;
                    update("age", calcAge);
                  }
                }}
                className="max-w-[250px]"
              />
              {form.date_of_birth && form.age && (
                <p className="text-sm text-muted-foreground">Age: {form.age} years old</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={120}
                  placeholder="Auto-calculated from DOB"
                  value={form.age ?? ""}
                  onChange={(e) => update("age", e.target.value ? parseInt(e.target.value) : null)}
                  readOnly={!!form.date_of_birth}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Biological Sex *</Label>
                <Select value={form.sex} onValueChange={(v) => update("sex", v)}>
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other / Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity *</Label>
              <Select value={form.ethnicity} onValueChange={(v) => update("ethnicity", v)}>
                <SelectTrigger id="ethnicity">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black or African American</SelectItem>
                  <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="native">American Indian or Alaska Native</SelectItem>
                  <SelectItem value="pacific">Native Hawaiian or Pacific Islander</SelectItem>
                  <SelectItem value="multiracial">Multiracial</SelectItem>
                  <SelectItem value="other">Other / Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Section 2: Medical History */}
        {section === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ckd_year">Year of CKD Diagnosis</Label>
              <Input
                id="ckd_year"
                type="number"
                min={1950}
                max={new Date().getFullYear()}
                placeholder="e.g. 2020"
                value={form.ckd_diagnosis_year ?? ""}
                onChange={(e) => update("ckd_diagnosis_year", e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Comorbidities (select all that apply) *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COMORBIDITY_OPTIONS.map((item) => (
                  <div key={item} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                    <Checkbox
                      id={`comorbidity-${item}`}
                      checked={form.comorbidities.includes(item)}
                      onCheckedChange={() => toggleComorbidity(item)}
                    />
                    <label htmlFor={`comorbidity-${item}`} className="text-sm cursor-pointer">
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meds">Current Medications</Label>
              <Textarea
                id="meds"
                placeholder="List all current medications, dosages, and frequencies..."
                value={form.current_medications}
                onChange={(e) => update("current_medications", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <Input
                id="allergies"
                placeholder="e.g. Penicillin, Sulfa drugs, None"
                value={form.allergies}
                onChange={(e) => update("allergies", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc_name">Primary Doctor Name</Label>
                <Input
                  id="doc_name"
                  placeholder="Dr. Smith"
                  value={form.primary_doctor_name}
                  onChange={(e) => update("primary_doctor_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc_phone">Doctor Phone</Label>
                <Input
                  id="doc_phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.primary_doctor_phone}
                  onChange={(e) => update("primary_doctor_phone", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Emergency Contact */}
        {section === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide an emergency contact. This information is required for participant safety.
            </p>
            <div className="space-y-2">
              <Label htmlFor="ec_name">Contact Name *</Label>
              <Input
                id="ec_name"
                placeholder="Full name"
                value={form.emergency_contact_name}
                onChange={(e) => update("emergency_contact_name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ec_phone">Contact Phone *</Label>
                <Input
                  id="ec_phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={form.emergency_contact_phone}
                  onChange={(e) => update("emergency_contact_phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec_relation">Relationship</Label>
                <Select value={form.emergency_contact_relation} onValueChange={(v) => update("emergency_contact_relation", v)}>
                  <SelectTrigger id="ec_relation">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse / Partner</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Adult Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Digital Signature */}
        {section === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                By typing your full legal name below, you confirm that the information you have
                provided is accurate to the best of your knowledge. This serves as your digital
                signature for the study intake form.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signature">Full Legal Name *</Label>
              <Input
                id="signature"
                placeholder="Type your full name as a digital signature"
                value={form.signature_text}
                onChange={(e) => update("signature_text", e.target.value)}
                className="text-lg font-serif italic"
              />
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="sigConfirm"
                checked={signatureConfirm}
                onCheckedChange={(checked) => setSignatureConfirm(checked === true)}
              />
              <label htmlFor="sigConfirm" className="text-sm leading-relaxed cursor-pointer">
                I confirm that I have completed this intake form truthfully and that the above is my digital signature.
              </label>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {section > 1 ? (
            <Button variant="outline" onClick={() => setSection((s) => (s - 1) as any)}>
              Previous
            </Button>
          ) : (
            <div />
          )}

          {section < 4 ? (
            <Button
              onClick={() => setSection((s) => (s + 1) as any)}
              disabled={
                (section === 1 && !canAdvance1) ||
                (section === 2 && !canAdvance2) ||
                (section === 3 && !canAdvance3)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => onComplete(form)}
              disabled={!canSubmit || isSubmitting}
              className="min-w-[160px]"
            >
              <PenLine className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Sign & Continue"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DemographicsForm;
