import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RenalPanelsService } from './renal-panels.service';
import { RenalPanelsController } from './renal-panels.controller';
import { RenalPanelSubmission } from './entities/renal-panel-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RenalPanelSubmission])],
  controllers: [RenalPanelsController],
  providers: [RenalPanelsService],
  exports: [RenalPanelsService],
})
export class RenalPanelsModule {}
