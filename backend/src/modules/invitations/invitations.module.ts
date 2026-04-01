import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { Participant } from '../participants/entities/participant.entity';
import { ScreeningSubmission } from '../screening/entities/screening-submission.entity';
import { AuthModule } from '../auth/auth.module';
import { BlindingModule } from '../blinding/blinding.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participant, ScreeningSubmission]),
    AuthModule,
    BlindingModule,
    AuditModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
