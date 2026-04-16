import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from '../participants/entities/participant.entity';
import { ScreeningSubmission } from '../screening/entities/screening-submission.entity';
import { User } from '../users/entities/user.entity';
import { StudySetting } from '../study-settings/entities/study-setting.entity';
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
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(StudySetting)
    private settingRepo: Repository<StudySetting>,
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

    // Guard: a participant record may already exist for this user from a prior
    // invitation or test — inserting a second one would violate the unique index
    // on participants.user_id and surface as a generic 500 to the researcher.
    const existingParticipant = await this.participantRepo.findOne({ where: { userId: user.id } });
    if (existingParticipant) {
      throw new BadRequestException(
        `A participant record already exists for ${screening.email}. ` +
        `If this person needs a fresh invitation, remove the existing participant first, ` +
        `or use "Resend Password" from the Participants page to send them a new temporary password.`
      );
    }

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

  async sendSchedulingInvite(userId: string, researcherUserId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const setting = await this.settingRepo.findOne({ where: { settingKey: 'calendly_url' } });
    if (!setting?.settingValue) {
      throw new BadRequestException('No scheduling link configured. Go to Researcher Dashboard → Scheduling to set your Calendly URL first.');
    }

    await this.emailService.sendSchedulingInvite(user.email, user.fullName, setting.settingValue);

    await this.auditService.log(
      researcherUserId,
      'send_scheduling_invite',
      'users',
      user.id,
      { email: user.email, calendly_url: setting.settingValue },
    );

    return {
      user_id: user.id,
      email: user.email,
      message: `Scheduling invite emailed to ${user.email}.`,
    };
  }
}
