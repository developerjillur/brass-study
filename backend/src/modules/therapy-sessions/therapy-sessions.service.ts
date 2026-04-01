import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TherapySession } from './entities/therapy-session.entity';

@Injectable()
export class TherapySessionsService {
  constructor(
    @InjectRepository(TherapySession)
    private sessionRepo: Repository<TherapySession>,
  ) {}

  async create(
    userId: string,
    data: Partial<TherapySession>,
  ): Promise<TherapySession> {
    const session = this.sessionRepo.create({
      ...data,
      userId,
    });
    return this.sessionRepo.save(session);
  }

  async findByUserId(userId: string): Promise<TherapySession[]> {
    return this.sessionRepo.find({
      where: { userId },
      order: { sessionDate: 'DESC' },
    });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<TherapySession>,
  ): Promise<TherapySession> {
    const session = await this.sessionRepo.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Therapy session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException('You can only update your own sessions');
    }
    Object.assign(session, data);
    return this.sessionRepo.save(session);
  }

  async findAll(): Promise<TherapySession[]> {
    return this.sessionRepo.find({ order: { createdAt: 'DESC' } });
  }
}
