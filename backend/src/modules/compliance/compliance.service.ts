import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceAlert } from './entities/compliance-alert.entity';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceAlert)
    private alertRepo: Repository<ComplianceAlert>,
  ) {}

  async findAll(): Promise<ComplianceAlert[]> {
    return this.alertRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByParticipantUserId(userId: string): Promise<ComplianceAlert[]> {
    return this.alertRepo.find({
      where: { participantUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async dismiss(id: string): Promise<ComplianceAlert> {
    const alert = await this.alertRepo.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException('Compliance alert not found');
    }
    alert.isDismissed = true;
    return this.alertRepo.save(alert);
  }
}
