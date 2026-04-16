import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RenalPanelSubmission } from './entities/renal-panel-submission.entity';

@Injectable()
export class RenalPanelsService {
  constructor(
    @InjectRepository(RenalPanelSubmission)
    private renalPanelRepo: Repository<RenalPanelSubmission>,
  ) {}

  async createScreeningSubmission(data: Partial<RenalPanelSubmission>): Promise<RenalPanelSubmission> {
    const submission = this.renalPanelRepo.create({
      ...data,
      submissionType: 'screening',
    });
    return this.renalPanelRepo.save(submission);
  }

  async createBaselineSubmission(
    userId: string,
    data: Partial<RenalPanelSubmission>,
  ): Promise<RenalPanelSubmission> {
    const submission = this.renalPanelRepo.create({
      ...data,
      participantUserId: userId,
      submissionType: 'baseline',
    } as Partial<RenalPanelSubmission>);
    return this.renalPanelRepo.save(submission as RenalPanelSubmission);
  }

  async createFollowUpSubmission(
    userId: string,
    data: Partial<RenalPanelSubmission>,
  ): Promise<RenalPanelSubmission> {
    const submission = this.renalPanelRepo.create({
      ...data,
      participantUserId: userId,
      submissionType: 'followup',
    });
    return this.renalPanelRepo.save(submission);
  }

  async findByParticipantUserId(userId: string): Promise<RenalPanelSubmission[]> {
    return this.renalPanelRepo.find({
      where: { participantUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<RenalPanelSubmission[]> {
    return this.renalPanelRepo.find({ order: { createdAt: 'DESC' } });
  }
}
