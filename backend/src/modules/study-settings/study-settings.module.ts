import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySettingsService } from './study-settings.service';
import { StudySettingsController } from './study-settings.controller';
import { StudySetting } from './entities/study-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudySetting])],
  controllers: [StudySettingsController],
  providers: [StudySettingsService],
  exports: [StudySettingsService],
})
export class StudySettingsModule {}
