import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { Participant } from '../participants/entities/participant.entity';
import { ScreeningSubmission } from '../screening/entities/screening-submission.entity';
import { User } from '../users/entities/user.entity';
import { StudySetting } from '../study-settings/entities/study-setting.entity';
import { AuthModule } from '../auth/auth.module';
import { BlindingModule } from '../blinding/blinding.module';
import { AuditModule } from '../audit/audit.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participant, ScreeningSubmission, User, StudySetting]),
    AuthModule,
    BlindingModule,
    AuditModule,
    EmailModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
