import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentResponse } from './entities/assessment-response.entity';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(AssessmentResponse)
    private assessmentRepo: Repository<AssessmentResponse>,
  ) {}

  async create(
    userId: string,
    data: Partial<AssessmentResponse>,
  ): Promise<AssessmentResponse> {
    const response = this.assessmentRepo.create({
      ...data,
      userId,
    });
    return this.assessmentRepo.save(response);
  }

  async findByUserId(userId: string): Promise<AssessmentResponse[]> {
    return this.assessmentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<AssessmentResponse[]> {
    return this.assessmentRepo.find({ order: { createdAt: 'DESC' } });
  }
}
