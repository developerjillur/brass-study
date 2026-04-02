import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Participant } from '../participants/entities/participant.entity';
import { StudySetting } from '../study-settings/entities/study-setting.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
    @InjectRepository(Participant)
    private participantRepo: Repository<Participant>,
    @InjectRepository(StudySetting)
    private settingRepo: Repository<StudySetting>,
  ) {}

  async seedTestUsers() {
    const results: any[] = [];

    // Create researcher
    const researcherResult = await this.createTestUser(
      'researcher@test.com',
      'Researcher123!',
      'Dr. Sandra Brass',
      'researcher',
    );
    results.push(researcherResult);

    // Create participant
    const participantResult = await this.createTestUser(
      'participant@test.com',
      'Participant123!',
      'Robert Jenkins',
      'participant',
    );
    results.push(participantResult);

    // Create participant record if not exists
    if (participantResult.created) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);

      const participant = this.participantRepo.create({
        userId: participantResult.userId,
        status: 'active',
        studyStartDate: startDate,
        studyDay: 14,
        onboardingStep: 5,
        onboardingCompleted: true,
        enrolledAt: startDate,
      });
      await this.participantRepo.save(participant);
    }

    // Seed study settings
    const existingSetting = await this.settingRepo.findOne({ where: { settingKey: 'calendly_url' } });
    if (!existingSetting) {
      await this.settingRepo.save(
        this.settingRepo.create({
          settingKey: 'calendly_url',
          settingValue: 'https://calendly.com/sandybrass-quantumuniversity',
        }),
      );
    }

    return { message: 'Test users seeded', results };
  }

  private async createTestUser(
    email: string,
    password: string,
    fullName: string,
    role: 'researcher' | 'participant',
  ) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      return { email, created: false, userId: existing.id, message: 'Already exists' };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({
      email,
      passwordHash,
      fullName,
      emailConfirmed: true,
    });
    await this.userRepo.save(user);

    await this.profileRepo.save(
      this.profileRepo.create({ userId: user.id, fullName, email }),
    );

    await this.roleRepo.save(
      this.roleRepo.create({ userId: user.id, role }),
    );

    return { email, created: true, userId: user.id, message: 'Created' };
  }
}
