import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { TherapySession } from '../therapy-sessions/entities/therapy-session.entity';
import { AssessmentResponse } from '../assessments/entities/assessment-response.entity';
import { ComplianceAlert } from '../compliance/entities/compliance-alert.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Profile } from '../users/entities/profile.entity';
import { EmailService } from '../email/email.service';
import { AuditLog } from '../audit/entities/audit-log.entity';

const ASSESSMENT_SCHEDULE = [
  { studyDay: 14, timePoint: 'week_2', label: 'Week 2' },
  { studyDay: 28, timePoint: 'week_4', label: 'Week 4' },
  { studyDay: 42, timePoint: 'week_6', label: 'Week 6' },
  { studyDay: 56, timePoint: 'week_8', label: 'Week 8' },
  { studyDay: 70, timePoint: 'week_10', label: 'Week 10' },
  { studyDay: 84, timePoint: 'week_12', label: 'Week 12 (Final)' },
];
const ASSESSMENT_WINDOW = 3;

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Participant)
    private participantRepo: Repository<Participant>,
    @InjectRepository(TherapySession)
    private sessionRepo: Repository<TherapySession>,
    @InjectRepository(AssessmentResponse)
    private assessmentRepo: Repository<AssessmentResponse>,
    @InjectRepository(ComplianceAlert)
    private alertRepo: Repository<ComplianceAlert>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    private emailService: EmailService,
  ) {}

  @Cron('0 0 * * *') // Midnight daily
  async updateStudyDays() {
    this.logger.log('Running updateStudyDays...');
    const result = await this.participantRepo
      .createQueryBuilder()
      .update(Participant)
      .set({
        studyDay: () => 'DATEDIFF(CURDATE(), study_start_date)',
      })
      .where('status = :status', { status: 'active' })
      .andWhere('study_start_date IS NOT NULL')
      .execute();

    this.logger.log(`Updated study days for ${result.affected} participants`);
  }

  @Cron('0 1 * * *') // 1 AM daily
  async checkStudyCompletion() {
    this.logger.log('Running checkStudyCompletion...');
    const activeParticipants = await this.participantRepo.find({
      where: { status: 'active' },
    });

    for (const p of activeParticipants) {
      if (p.studyDay && p.studyDay >= 84) {
        const assessmentCount = await this.assessmentRepo
          .createQueryBuilder('a')
          .select('COUNT(DISTINCT a.assessment_type)', 'cnt')
          .where('a.participant_id = :pid', { pid: p.id })
          .andWhere('a.time_point = :tp', { tp: 'week_12' })
          .getRawOne();

        if (parseInt(assessmentCount.cnt) >= 4) {
          p.status = 'completed';
          p.completedAt = new Date();
          await this.participantRepo.save(p);
          this.logger.log(`Participant ${p.id} marked as completed`);
        }
      }
    }
  }

  @Cron('0 8 * * *') // 8 AM daily
  async checkAssessmentReminders() {
    this.logger.log('Running checkAssessmentReminders...');
    const activeParticipants = await this.participantRepo.find({
      where: { status: 'active', onboardingCompleted: true },
    });

    for (const p of activeParticipants) {
      if (!p.studyDay) continue;

      for (const schedule of ASSESSMENT_SCHEDULE) {
        const dayDiff = Math.abs(p.studyDay - schedule.studyDay);
        if (dayDiff <= ASSESSMENT_WINDOW) {
          // Check if already completed
          const existing = await this.assessmentRepo.findOne({
            where: { participantId: p.id, timePoint: schedule.timePoint },
          });
          if (existing) continue;

          // Check if notification already sent today
          const today = new Date().toISOString().split('T')[0];
          const existingNotif = await this.notificationRepo
            .createQueryBuilder('n')
            .where('n.participant_id = :pid', { pid: p.id })
            .andWhere('n.type = :type', { type: 'assessment_reminder' })
            .andWhere('DATE(n.created_at) = :today', { today })
            .getOne();
          if (existingNotif) continue;

          // Create notification
          await this.notificationRepo.save({
            userId: p.userId,
            participantId: p.id,
            type: 'assessment_reminder',
            title: `${schedule.label} Assessment Due`,
            message: `Your ${schedule.label} questionnaires are now due. Please complete them within the assessment window.`,
            metadata: { timePoint: schedule.timePoint, studyDay: schedule.studyDay },
          });

          // Send email
          const profile = await this.profileRepo.findOne({ where: { userId: p.userId } });
          if (profile?.email) {
            await this.emailService.sendAssessmentReminderEmail(
              profile.email,
              profile.fullName,
              schedule.label,
            );
          }
        }
      }
    }
  }

  @Cron('0 20 * * *') // 8 PM daily
  async checkCompliance() {
    this.logger.log('Running checkCompliance...');
    const activeParticipants = await this.participantRepo.find({
      where: { status: 'active' },
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    for (const p of activeParticipants) {
      // Check for missed session yesterday
      const session = await this.sessionRepo.findOne({
        where: { participantId: p.id, sessionDate: yesterday as any },
      });

      if (!session) {
        // Check if alert already exists
        const existingAlert = await this.alertRepo.findOne({
          where: {
            participantId: p.id,
            alertDate: yesterday as any,
            alertType: 'missed_session',
          },
        });

        if (!existingAlert) {
          await this.alertRepo.save({
            participantId: p.id,
            participantUserId: p.userId,
            alertType: 'missed_session',
            alertDate: yesterday,
            message: `Missed therapy session on ${yesterdayStr}`,
          });

          const profile = await this.profileRepo.findOne({ where: { userId: p.userId } });
          if (profile?.email) {
            await this.emailService.sendMissedSessionEmail(
              profile.email,
              profile.fullName,
              yesterdayStr,
            );
          }
        }
      }
    }
  }
}
