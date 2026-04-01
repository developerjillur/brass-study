import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParticipantIntake } from './entities/participant-intake.entity';

@Injectable()
export class ParticipantIntakeService {
  constructor(
    @InjectRepository(ParticipantIntake)
    private intakeRepo: Repository<ParticipantIntake>,
  ) {}

  async create(
    userId: string,
    data: Partial<ParticipantIntake>,
  ): Promise<ParticipantIntake> {
    const intake = this.intakeRepo.create({
      ...data,
      userId,
    });
    return this.intakeRepo.save(intake);
  }

  async findByUserId(userId: string): Promise<ParticipantIntake> {
    const intake = await this.intakeRepo.findOne({ where: { userId } });
    if (!intake) {
      throw new NotFoundException('Intake record not found');
    }
    return intake;
  }

  async updateByUserId(
    userId: string,
    data: Partial<ParticipantIntake>,
  ): Promise<ParticipantIntake> {
    const intake = await this.findByUserId(userId);
    Object.assign(intake, data);
    return this.intakeRepo.save(intake);
  }

  async findByParticipantId(participantId: string): Promise<ParticipantIntake> {
    const intake = await this.intakeRepo.findOne({ where: { participantId } });
    if (!intake) {
      throw new NotFoundException('Intake record not found');
    }
    return intake;
  }
}
