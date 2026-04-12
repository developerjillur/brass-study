import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Use environment variable to determine transport
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      // Use configured SMTP server
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Use local sendmail (available on the VPS via Postfix)
      this.transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail',
      });
    }
  }

  private async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    const from = process.env.EMAIL_FROM || 'BRASS Study <noreply@brassphdstudy.com>';

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
      });
      this.logger.log(`Email sent to ${to}: ${subject} (messageId: ${info.messageId})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      // Don't throw — email failure shouldn't break the main operation
      return false;
    }
  }

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
      screener_sent: `Dear ${fullName},\n\nThank you for your interest in the BRASS CKD Photobiomodulation Study. Your screening form is ready to complete.\n\nPlease visit https://brassphdstudy.com/screener to complete the screening process.\n\nBest regards,\nSandra Brass\nBRASS Research Team`,
      declined: `Dear ${fullName},\n\nThank you for your interest in the BRASS CKD Photobiomodulation Study. After careful review, we have determined that you do not meet the eligibility criteria at this time.\n\nWe appreciate your willingness to participate.\n\nBest regards,\nSandra Brass\nBRASS Research Team`,
      invited: `Dear ${fullName},\n\nCongratulations! You are eligible to participate in the BRASS CKD Photobiomodulation Study.\n\nYour login credentials will be sent to you separately. Please visit https://brassphdstudy.com/login to access the study portal once you receive them.\n\nBest regards,\nSandra Brass\nBRASS Research Team`,
    };

    const subject = subjects[status] || `BRASS Study – Status Update: ${status}`;
    const body = bodies[status] || `Dear ${fullName},\n\nYour screening status has been updated to: ${status}.\n\nBest regards,\nSandra Brass\nBRASS Research Team`;

    const sent = await this.sendEmail(email, subject, body);
    return { to: email, subject, body, sent, sentAt: new Date().toISOString() };
  }

  async sendPasswordResetEmail(email: string, fullName: string, resetToken: string) {
    const resetLink = `https://brassphdstudy.com/reset-password?token=${resetToken}`;
    const subject = 'BRASS Study – Password Reset Request';
    const body = `Dear ${fullName || 'Participant'},\n\nWe received a request to reset the password for your BRASS CKD Study Portal account.\n\nTo reset your password, click the link below (or copy and paste it into your browser). This link will expire in 1 hour.\n\n${resetLink}\n\nIMPORTANT: If you don't see this email in your inbox, please check your spam or junk folder. You may want to mark it as "not spam" so future emails from the study team reach you directly.\n\nIf you did not request a password reset, you can safely ignore this email — your password will not change.\n\nBest regards,\nSandra Brass\nBRASS Research Team`;

    const sent = await this.sendEmail(email, subject, body);
    return { to: email, subject, sent, sentAt: new Date().toISOString() };
  }

  async sendInviteCredentialsEmail(
    email: string,
    fullName: string,
    tempPassword: string,
  ) {
    const subject = 'BRASS Study – Your Portal Login Credentials';
    const body = `Dear ${fullName},\n\nYour account for the BRASS CKD Study Portal has been created.\n\nHere are your login credentials:\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease visit https://brassphdstudy.com/login to sign in. You will be asked to change your password on your first login.\n\nIMPORTANT: If you don't see this email in your inbox, please check your spam or junk folder. You may want to mark it as "not spam" so future emails from the study team reach you directly.\n\nIf you have any questions, please reply to this email or contact the research team through the portal.\n\nBest regards,\nSandra Brass\nBRASS Research Team`;

    const sent = await this.sendEmail(email, subject, body);
    return { to: email, subject, sent, sentAt: new Date().toISOString() };
  }

  async sendAssessmentReminderEmail(
    email: string,
    fullName: string,
    label: string,
  ) {
    const subject = `BRASS Study – ${label} Assessment Due`;
    const body = `Dear ${fullName},\n\nYour ${label} assessment is now due. Please log in to https://brassphdstudy.com to complete your questionnaires.\n\nBest regards,\nSandra Brass\nBRASS Research Team`;

    const sent = await this.sendEmail(email, subject, body);
    return { to: email, subject, sent, sentAt: new Date().toISOString() };
  }

  async sendMissedSessionEmail(email: string, fullName: string, date: string) {
    const subject = 'BRASS Study – Missed Therapy Session';
    const body = `Dear ${fullName},\n\nWe noticed you missed your therapy session on ${date}. Please try to complete your daily session to maintain compliance.\n\nLog in at https://brassphdstudy.com/daily-log to submit your session.\n\nBest regards,\nSandra Brass\nBRASS Research Team`;

    const sent = await this.sendEmail(email, subject, body);
    return { to: email, subject, sent, sentAt: new Date().toISOString() };
  }

  async sendDailyReminderEmail(email: string, fullName: string) {
    const subject = 'BRASS Study – Daily Session Reminder';
    const body = `Dear ${fullName},\n\nThis is a friendly reminder to complete your daily therapy session.\n\nLog in at https://brassphdstudy.com/daily-log to submit your session.\n\nBest regards,\nSandra Brass\nBRASS Research Team`;

    const sent = await this.sendEmail(email, subject, body);
    return { to: email, subject, sent, sentAt: new Date().toISOString() };
  }

  async sendPlaceboNotification(email: string, fullName: string) {
    const subject = 'BRASS Study – Important Study Information';
    const body = `Dear ${fullName},\n\nNow that the study has concluded, we want to share some important information. You were assigned to the control (placebo) group during the study. This means your device was set to a non-therapeutic setting.\n\nYour participation was invaluable to the scientific integrity of this research. We would like to offer you the opportunity to receive active treatment now that the study is complete.\n\nPlease contact the research team if you would like to discuss this further.\n\nBest regards,\nSandra Brass\nBRASS Research Team`;

    const sent = await this.sendEmail(email, subject, body);
    return { to: email, subject, sent, sentAt: new Date().toISOString() };
  }
}
