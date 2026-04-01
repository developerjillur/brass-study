import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { databaseConfig } from './config/database.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ScreeningModule } from './modules/screening/screening.module';
import { RenalPanelsModule } from './modules/renal-panels/renal-panels.module';
import { ParticipantsModule } from './modules/participants/participants.module';
import { ParticipantIntakeModule } from './modules/participant-intake/participant-intake.module';
import { ConsentModule } from './modules/consent/consent.module';
import { TherapySessionsModule } from './modules/therapy-sessions/therapy-sessions.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { BlindingModule } from './modules/blinding/blinding.module';
import { StudySettingsModule } from './modules/study-settings/study-settings.module';
import { AuditModule } from './modules/audit/audit.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { EmailModule } from './modules/email/email.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ScreeningModule,
    RenalPanelsModule,
    ParticipantsModule,
    ParticipantIntakeModule,
    ConsentModule,
    TherapySessionsModule,
    AssessmentsModule,
    MessagesModule,
    NotificationsModule,
    ComplianceModule,
    BlindingModule,
    StudySettingsModule,
    AuditModule,
    InvitationsModule,
    SchedulerModule,
    EmailModule,
    FileUploadModule,
    SeedModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
