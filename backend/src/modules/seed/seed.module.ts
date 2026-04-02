import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { Participant } from '../participants/entities/participant.entity';
import { StudySetting } from '../study-settings/entities/study-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, UserRole, Participant, StudySetting])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
