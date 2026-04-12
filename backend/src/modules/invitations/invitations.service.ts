import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { ScreeningSubmission } from '../screening/entities/screening-submission.entity';
import { AuthService } from '../auth/auth.service';
import { BlindingService } from '../blinding/blinding.service';
import { AuditService } from '../audit/audit.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Participant)
    private participantRepo: Repository<Participant>,
    @InjectRepository(ScreeningSubmission)
    private screeningRepo: Repository<ScreeningSubmission>,
    private authService: AuthService,
    private blindingService: BlindingService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  async inviteParticipant(
    screeningId: string,
    researcherUserId: string,
  ) {
    const screening = await this.screeningRepo.findOne({
      where: { id: screeningId },
    });
    if (!screening) {
      throw new BadRequestException('Screening submission not found');
    }

    // Create user with temp password
    const { user, tempPassword } = await this.authService.createUserWithTempPassword(
      screening.email,
      screening.fullName,
      'participant',
    );

    // Create participant record
    const participant = this.participantRepo.create({
      userId: user.id,
      screeningId: screening.id,
      status: 'onboarding',
      onboardingStep: 1,
    });
    await this.participantRepo.save(participant);

    // Assign to randomized group
    const record = await this.blindingService.assign(participant.id);
    const groupCode = record.groupCode;

    // Update screening status
    screening.status = 'invited';
    screening.reviewedBy = researcherUserId;
    await this.screeningRepo.save(screening);

    // Send invitation email with credentials
    if (tempPassword) {
      await this.emailService.sendInviteCredentialsEmail(
        screening.email,
        screening.fullName,
        tempPassword,
      );
    }

    // Also send the eligibility notification email
    await this.emailService.sendScreeningStatusEmail(
      screening.email,
      screening.fullName,
      'invited',
    );

    // Audit log
    await this.auditService.log(
      researcherUserId,
      'invite_participant',
      'participants',
      participant.id,
      {
        screening_id: screeningId,
        email: screening.email,
        group_assigned: groupCode,
      },
    );

    return {
      participant_id: participant.id,
      user_id: user.id,
      temp_password: tempPassword,
      email: screening.email,
      group_code: groupCode,
      message: `Participant invited successfully. ${tempPassword ? 'Temp password: ' + tempPassword : 'User already existed.'}`,
    };
  }

  async resendTempPassword(userId: string, researcherUserId: string) {
    const { user, tempPassword } = await this.authService.resetUserPassword(userId);

    await this.emailService.sendInviteCredentialsEmail(
      user.email,
      user.fullName,
      tempPassword,
    );

    await this.auditService.log(
      researcherUserId,
      'resend_temp_password',
      'users',
      user.id,
      { email: user.email },
    );

    return {
      user_id: user.id,
      email: user.email,
      temp_password: tempPassword,
      message: 'Temporary password reset and emailed.',
    };
  }
}
