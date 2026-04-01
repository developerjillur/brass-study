import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';

@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private participantRepo: Repository<Participant>,
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
    data: Partial<Pick<Participant, 'onboardingStep' | 'onboardingCompleted' | 'status' | 'researcherNotes' | 'studyStartDate'>>,
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
}
