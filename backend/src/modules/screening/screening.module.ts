import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreeningService } from './screening.service';
import { ScreeningController } from './screening.controller';
import { ScreeningSubmission } from './entities/screening-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScreeningSubmission])],
  controllers: [ScreeningController],
  providers: [ScreeningService],
  exports: [ScreeningService],
})
export class ScreeningModule {}
