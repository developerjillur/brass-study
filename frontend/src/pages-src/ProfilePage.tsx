"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User, Shield, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  phone: z.string().trim().max(20, "Phone must be under 20 characters").optional().or(z.literal("")),
  address: z.string().trim().max(300, "Address must be under 300 characters").optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
});

const ProfilePage = () => {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Participant-specific
  const [participantStatus, setParticipantStatus] = useState("");
  const [studyDay, setStudyDay] = useState<number | null>(null);
  const [enrolledAt, setEnrolledAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const data = await apiClient.get("/api/users/me/profile").catch(() => []);

      if (data) {
        setFullName(data.full_name || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setDateOfBirth(data.date_of_birth || "");
      }

      if (userRole === "participant") {
        const participant = await apiClient.get("/api/participants/me").catch(() => []);

        if (participant) {
          setParticipantStatus(participant.status);
          setStudyDay(participant.study_day);
          setEnrolledAt(participant.enrolled_at);
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user, userRole]);

  const handleSave = async () => {
    const result = profileSchema.safeParse({
      full_name: fullName,
      phone,
      address,
      date_of_birth: dateOfBirth,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      await apiClient.put("/api/users/me/profile", {
        full_name: result.data.full_name,
        phone: result.data.phone || null,
        address: result.data.address || null,
        date_of_birth: result.data.date_of_birth || null,
      });
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-heading font-serif font-bold text-foreground">My Profile</h1>
              <p className="text-body text-muted-foreground">View and update your personal information.</p>
            </div>
          </div>

          {/* Study Info Card (participant only) */}
          {userRole === "participant" && participantStatus && (
            <Card className="mb-6 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Study Information</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <Badge variant="default" className="capitalize">{participantStatus}</Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Study Day</span>
                    <p className="font-medium text-foreground">{studyDay ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Enrolled</span>
                    <p className="font-medium text-foreground">
                      {enrolledAt ? new Date(enrolledAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                <Input id="email" value={email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-base font-semibold">Full Name *</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  placeholder="Enter your full name"
                />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-base font-semibold">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold">Mailing Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={300}
                  placeholder="123 Main St, City, State ZIP"
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto mt-2">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ProfilePage;
