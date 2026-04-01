import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScreeningSubmission } from './entities/screening-submission.entity';

@Injectable()
export class ScreeningService {
  constructor(
    @InjectRepository(ScreeningSubmission)
    private screeningRepo: Repository<ScreeningSubmission>,
  ) {}

  async create(data: {
    fullName: string;
    email: string;
    consentToContact: boolean;
  }): Promise<ScreeningSubmission> {
    const submission = this.screeningRepo.create(data);
    return this.screeningRepo.save(submission);
  }

  async findAll(): Promise<ScreeningSubmission[]> {
    return this.screeningRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(
    id: string,
    data: { status: string; notes?: string },
  ): Promise<ScreeningSubmission> {
    const submission = await this.screeningRepo.findOne({ where: { id } });
    if (!submission) {
      throw new NotFoundException('Screening submission not found');
    }
    submission.status = data.status;
    if (data.notes !== undefined) {
      submission.notes = data.notes;
    }
    return this.screeningRepo.save(submission);
  }
}
