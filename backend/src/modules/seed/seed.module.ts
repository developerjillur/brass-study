import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Participant } from '../participants/entities/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, UserRole, Participant])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
