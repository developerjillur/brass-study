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

  async findByParticipantId(participantId: string): Promise<BlindingRecord | null> {
    return this.blindingRepo.findOne({ where: { participantId } });
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

  async manualAssign(participantId: string, groupCode: string): Promise<BlindingRecord> {
    if (groupCode !== 'S' && groupCode !== 'C') {
      throw new ConflictException('Group code must be S or C');
    }

    const existing = await this.blindingRepo.findOne({ where: { participantId } });
    if (existing) {
      existing.groupCode = groupCode;
      existing.assignedAt = new Date();
      return this.blindingRepo.save(existing);
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

  /**
   * Study Protocol:
   * - Group C (Control): 20 minutes constant for 90 days
   * - Group S (Stepped): 20 min days 1-29, 25 min days 30-59, 30 min days 60-90
   */
  async getPrescribedDuration(
    participantId: string,
    studyDay?: number,
  ): Promise<{
    participantId: string;
    groupCode: string;
    groupLabel: string;
    prescribedMinutes: number;
    protocol: string;
  }> {
    const record = await this.blindingRepo.findOne({ where: { participantId } });
    if (!record) {
      throw new NotFoundException('Blinding record not found for participant');
    }

    const day = studyDay ?? 1;
    let prescribedMinutes: number;
    let protocol: string;
    let groupLabel: string;

    if (record.groupCode === 'C') {
      // Control group: constant 20 minutes
      prescribedMinutes = 20;
      protocol = '20 minutes daily for 90 days';
      groupLabel = 'Control (Constant 20 min)';
    } else {
      // Stepped group: increases at day 30 and 60
      if (day >= 60) {
        prescribedMinutes = 30;
      } else if (day >= 30) {
        prescribedMinutes = 25;
      } else {
        prescribedMinutes = 20;
      }
      protocol = '20 min (days 1-29) → 25 min (days 30-59) → 30 min (days 60-90)';
      groupLabel = 'Stepped (20→25→30 min)';
    }

    return {
      participantId: record.participantId,
      groupCode: record.groupCode,
      groupLabel,
      prescribedMinutes,
      protocol,
    };
  }
}
