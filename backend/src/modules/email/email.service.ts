import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendScreeningStatusEmail(
    email: string,
    fullName: string,
    status: string,
  ) {
    const subjects: Record<string, string> = {
      screener_sent: 'BRASS Study – Your Screening Form is Ready',
      declined: 'BRASS Study – Screening Update',
      invited: 'BRASS Study – You Are Eligible!',
    };

    const bodies: Record<string, string> = {
      screener_sent: `Dear ${fullName},\n\nThank you for your interest in the BRASS CKD Photobiomodulation Study. Your screening form is ready to complete.\n\nPlease log in to complete the screening process.\n\nBest regards,\nBRASS Research Team`,
      declined: `Dear ${fullName},\n\nThank you for your interest in the BRASS CKD Photobiomodulation Study. After careful review, we have determined that you do not meet the eligibility criteria at this time.\n\nWe appreciate your willingness to participate.\n\nBest regards,\nBRASS Research Team`,
      invited: `Dear ${fullName},\n\nCongratulations! You are eligible to participate in the BRASS CKD Photobiomodulation Study. Your login credentials will be sent separately.\n\nBest regards,\nBRASS Research Team`,
    };

    const subject = subjects[status] || `BRASS Study – Status Update: ${status}`;
    const body = bodies[status] || `Dear ${fullName},\n\nYour screening status has been updated to: ${status}.\n\nBest regards,\nBRASS Research Team`;

    console.log(`[EMAIL] To: ${email} | Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${body}`);

    return { to: email, subject, body, sentAt: new Date().toISOString() };
  }

  async sendAssessmentReminderEmail(
    email: string,
    fullName: string,
    label: string,
  ) {
    const subject = `BRASS Study – ${label} Assessment Due`;
    const body = `Dear ${fullName},\n\nYour ${label} assessment is now due. Please log in to complete your questionnaires.\n\nBest regards,\nBRASS Research Team`;

    console.log(`[EMAIL] To: ${email} | Subject: ${subject}`);
    return { to: email, subject, sentAt: new Date().toISOString() };
  }

  async sendMissedSessionEmail(email: string, fullName: string, date: string) {
    const subject = 'BRASS Study – Missed Therapy Session';
    const body = `Dear ${fullName},\n\nWe noticed you missed your therapy session on ${date}. Please try to complete your daily session to maintain compliance.\n\nBest regards,\nBRASS Research Team`;

    console.log(`[EMAIL] To: ${email} | Subject: ${subject}`);
    return { to: email, subject, sentAt: new Date().toISOString() };
  }

  async sendDailyReminderEmail(email: string, fullName: string) {
    const subject = 'BRASS Study – Daily Session Reminder';
    const body = `Dear ${fullName},\n\nThis is a friendly reminder to complete your daily therapy session.\n\nBest regards,\nBRASS Research Team`;

    console.log(`[EMAIL] To: ${email} | Subject: ${subject}`);
    return { to: email, subject, sentAt: new Date().toISOString() };
  }

  async sendPlaceboNotification(email: string, fullName: string) {
    const subject = 'BRASS Study – Important Study Information';
    const body = `Dear ${fullName},\n\nNow that the study has concluded, we want to share some important information. You were assigned to the control (placebo) group during the study. This means your device was set to a non-therapeutic setting.\n\nYour participation was invaluable to the scientific integrity of this research. We would like to offer you the opportunity to receive active treatment now that the study is complete.\n\nPlease contact the research team if you would like to discuss this further.\n\nBest regards,\nBRASS Research Team`;

    console.log(`[EMAIL] To: ${email} | Subject: ${subject}`);
    return { to: email, subject, sentAt: new Date().toISOString() };
  }
}
