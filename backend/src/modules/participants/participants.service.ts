import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';
import { Profile } from '../users/entities/profile.entity';
import { ParticipantIntake } from '../participant-intake/entities/participant-intake.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private participantRepo: Repository<Participant>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(ParticipantIntake)
    private intakeRepo: Repository<ParticipantIntake>,
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async findByUserId(userId: string): Promise<Participant> {
    const participant = await this.participantRepo.findOne({ where: { userId } });
    if (!participant) {
      throw new NotFoundException('Participant record not found');
    }
    return participant;
  }

  async findAll(): Promise<Participant[]> {
    return this.participantRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Participant> {
    const participant = await this.participantRepo.findOne({ where: { id } });
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }
    return participant;
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        Participant,
        | 'onboardingStep'
        | 'onboardingCompleted'
        | 'status'
        | 'researcherNotes'
        | 'studyStartDate'
        | 'complianceRate'
      >
    >,
  ): Promise<Participant> {
    const participant = await this.findOne(id);
    Object.assign(participant, data);
    return this.participantRepo.save(participant);
  }

  async withdraw(id: string): Promise<Participant> {
    const participant = await this.findOne(id);
    participant.status = 'withdrawn';
    participant.withdrawnAt = new Date();
    return this.participantRepo.save(participant);
  }

  /**
   * Withdraw participant and anonymize all PHI per HIPAA §164.514
   * This is IRREVERSIBLE.
   */
  async withdrawAndAnonymize(
    id: string,
    researcherUserId?: string,
  ): Promise<{ message: string; anonymized_label: string }> {
    const participant = await this.findOne(id);

    // Generate anonymous label
    const count = await this.participantRepo.count({
      where: { status: 'withdrawn' },
    });
    const anonymizedLabel = `WITHDRAWN_${String(count + 1).padStart(3, '0')}`;

    // 1. Anonymize profile (name, email, phone, address, DOB)
    const profile = await this.profileRepo.findOne({
      where: { userId: participant.userId },
    });
    if (profile) {
      profile.fullName = anonymizedLabel;
      profile.email = `${anonymizedLabel.toLowerCase()}@redacted.study`;
      profile.phone = null;
      profile.dateOfBirth = null;
      profile.address = null;
      await this.profileRepo.save(profile);
    }

    // 2. Anonymize participant intake (demographics, medical, emergency contact)
    const intake = await this.intakeRepo.findOne({
      where: { participantId: participant.id },
    });
    if (intake) {
      intake.age = null;
      intake.sex = null;
      intake.ethnicity = null;
      intake.currentMedications = null;
      intake.comorbidities = null;
      intake.allergies = null;
      intake.primaryDoctorName = null;
      intake.primaryDoctorPhone = null;
      intake.emergencyContactName = null;
      intake.emergencyContactPhone = null;
      intake.emergencyContactRelationship = null;
      intake.signatureText = '[REDACTED]';
      await this.intakeRepo.save(intake);
    }

    // 3. Update participant record
    participant.status = 'withdrawn';
    participant.withdrawnAt = new Date();
    participant.researcherNotes = `${participant.researcherNotes || ''}\n[${new Date().toISOString()}] Withdrawn and PHI anonymized. Label: ${anonymizedLabel}`.trim();
    await this.participantRepo.save(participant);

    // 4. Log to audit trail
    await this.auditRepo.save(
      this.auditRepo.create({
        userId: researcherUserId || null,
        action: 'ANONYMIZE_WITHDRAWN',
        tableName: 'participants',
        recordId: participant.id,
        details: {
          anonymized_label: anonymizedLabel,
          original_user_id: participant.userId,
        },
      }),
    );

    return {
      message: `Participant withdrawn and PHI anonymized as ${anonymizedLabel}`,
      anonymized_label: anonymizedLabel,
    };
  }
}
