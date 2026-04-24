import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RenalPanelSubmission } from './entities/renal-panel-submission.entity';
import { ScreeningSubmission } from '../screening/entities/screening-submission.entity';

@Injectable()
export class RenalPanelsService {
  constructor(
    @InjectRepository(RenalPanelSubmission)
    private renalPanelRepo: Repository<RenalPanelSubmission>,
    @InjectRepository(ScreeningSubmission)
    private screeningRepo: Repository<ScreeningSubmission>,
  ) {}

  async createScreeningSubmission(data: Partial<RenalPanelSubmission>): Promise<RenalPanelSubmission> {
    const submission = this.renalPanelRepo.create({
      ...data,
      submissionType: 'screening',
    });
    const saved = await this.renalPanelRepo.save(submission);

    // Advance the linked screening's status so it shows "Ready for Review"
    // instead of being stuck on "Awaiting Lab Results".
    if (saved.screeningId) {
      const screening = await this.screeningRepo.findOne({ where: { id: saved.screeningId } });
      if (screening && screening.status === 'pending') {
        screening.status = 'screener_completed';
        await this.screeningRepo.save(screening);
      }
    }
    return saved;
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
