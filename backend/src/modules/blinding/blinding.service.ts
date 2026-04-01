import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlindingRecord } from './entities/blinding-record.entity';

@Injectable()
export class BlindingService {
  constructor(
    @InjectRepository(BlindingRecord)
    private blindingRepo: Repository<BlindingRecord>,
  ) {}

  async findAll(): Promise<BlindingRecord[]> {
    return this.blindingRepo.find({ order: { assignedAt: 'DESC' } });
  }

  async assign(participantId: string): Promise<BlindingRecord> {
    const existing = await this.blindingRepo.findOne({ where: { participantId } });
    if (existing) {
      throw new ConflictException('Participant already has a blinding assignment');
    }

    // Balanced randomization: count S vs C, assign to smaller group
    const countS = await this.blindingRepo.count({ where: { groupCode: 'S' } });
    const countC = await this.blindingRepo.count({ where: { groupCode: 'C' } });

    let groupCode: string;
    if (countS <= countC) {
      groupCode = 'S';
    } else {
      groupCode = 'C';
    }

    const record = this.blindingRepo.create({
      participantId,
      groupCode,
      assignedAt: new Date(),
    });
    return this.blindingRepo.save(record);
  }

  async unblindAll(): Promise<{ affected: number }> {
    const result = await this.blindingRepo.update(
      { isRevealed: false },
      { isRevealed: true, revealedAt: new Date() },
    );
    return { affected: result.affected || 0 };
  }

  async getPrescribedDuration(participantId: string): Promise<{
    participantId: string;
    groupCode: string;
    prescribedMinutes: number;
  }> {
    const record = await this.blindingRepo.findOne({ where: { participantId } });
    if (!record) {
      throw new NotFoundException('Blinding record not found for participant');
    }

    // Group S = study group (actual treatment duration)
    // Group C = control group (sham/minimal duration)
    // These can be adjusted based on study protocol
    const prescribedMinutes = record.groupCode === 'S' ? 30 : 5;

    return {
      participantId: record.participantId,
      groupCode: record.groupCode,
      prescribedMinutes,
    };
  }
}
