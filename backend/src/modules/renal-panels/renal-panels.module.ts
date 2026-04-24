import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenalPanelsService } from './renal-panels.service';
import { RenalPanelsController } from './renal-panels.controller';
import { RenalPanelSubmission } from './entities/renal-panel-submission.entity';
import { ScreeningSubmission } from '../screening/entities/screening-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RenalPanelSubmission, ScreeningSubmission])],
  controllers: [RenalPanelsController],
  providers: [RenalPanelsService],
  exports: [RenalPanelsService],
})
export class RenalPanelsModule {}
