import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { Participant } from '../participants/entities/participant.entity';
import { TherapySession } from '../therapy-sessions/entities/therapy-session.entity';
import { AssessmentResponse } from '../assessments/entities/assessment-response.entity';
import { ComplianceAlert } from '../compliance/entities/compliance-alert.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Profile } from '../users/entities/profile.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Participant,
      TherapySession,
      AssessmentResponse,
      ComplianceAlert,
      Notification,
      Profile,
      AuditLog,
    ]),
    EmailModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
