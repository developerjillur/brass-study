"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

export const MESSAGE_TEMPLATES = [
  {
    id: "enrollment",
    label: "Enrollment Confirmed",
    subject: "Enrollment Confirmed",
    body: "Your enrollment has been confirmed. Your study starts today. Welcome to the CKD Photobiomodulation Study!",
  },
  {
    id: "lab-reminder",
    label: "Lab Results Reminder",
    subject: "Lab Results Reminder",
    body: "Reminder: Please submit your latest lab results by the end of this week. You can do this from the Lab Results page on your dashboard.",
  },
  {
    id: "encouragement",
    label: "Encouragement",
    subject: "Great Progress!",
    body: "Thank you for your continued participation! Keep up the great work with your daily therapy sessions.",
  },
  {
    id: "missed-days",
    label: "Missed Days Reminder",
    subject: "Missed Session Check-In",
    body: "We noticed you missed a few days of logging. No worries — please continue when you can. Your participation matters!",
  },
  {
    id: "study-complete",
    label: "Study Complete",
    subject: "Study Complete — Thank You!",
    body: "Congratulations on completing the 90-day study! Thank you for your dedication and participation. Your data has been invaluable for this research.",
  },
  {
    id: "zoom-meeting",
    label: "Zoom Meeting Invite",
    subject: "Scheduled Check-In Meeting",
    body: "I'd like to schedule a check-in call with you. Please join using this Zoom link:\n\nhttps://zoom.us/j/MEETING_ID\n\nPlease replace MEETING_ID with the actual meeting number, or use the Calendly link on your dashboard to book a time that works for you.",
  },
];

interface MessageTemplatesPickerProps {
  onSelect: (template: { subject: string; body: string }) => void;
  label?: string;
}

const MessageTemplatesPicker = ({ onSelect, label = "Use template" }: MessageTemplatesPickerProps) => {
  return (
    <Select
      onValueChange={(id) => {
        const t = MESSAGE_TEMPLATES.find((t) => t.id === id);
        if (t) onSelect({ subject: t.subject, body: t.body });
      }}
    >
      <SelectTrigger className="w-[200px]">
        <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {MESSAGE_TEMPLATES.map((t) => (
          <SelectItem key={t.id} value={t.id}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MessageTemplatesPicker;
