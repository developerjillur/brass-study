import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private roleRepo: Repository<UserRole>,
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

  async getResearcherId(): Promise<string | null> {
    const role = await this.roleRepo.findOne({ where: { role: 'researcher' } });
    return role ? role.userId : null;
  }
}
