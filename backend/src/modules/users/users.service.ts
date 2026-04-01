import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getMyProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateMyProfile(
    userId: string,
    data: Partial<Pick<Profile, 'fullName' | 'phone' | 'dateOfBirth' | 'address'>>,
  ): Promise<Profile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    Object.assign(profile, data);
    return this.profileRepo.save(profile);
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.profileRepo.find({ order: { createdAt: 'DESC' } });
  }
}
