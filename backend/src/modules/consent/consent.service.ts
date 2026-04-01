import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentResponse } from './entities/consent-response.entity';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(ConsentResponse)
    private consentRepo: Repository<ConsentResponse>,
  ) {}

  async create(
    userId: string,
    data: Partial<ConsentResponse>,
  ): Promise<ConsentResponse> {
    const consent = this.consentRepo.create({
      ...data,
      userId,
    });
    return this.consentRepo.save(consent);
  }

  async findByUserId(userId: string): Promise<ConsentResponse[]> {
    return this.consentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<ConsentResponse[]> {
    return this.consentRepo.find({ order: { createdAt: 'DESC' } });
  }
}
