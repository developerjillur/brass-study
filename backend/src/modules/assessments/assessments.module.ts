import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { AssessmentResponse } from './entities/assessment-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssessmentResponse])],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
