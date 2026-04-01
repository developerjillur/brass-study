import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      participant_id: string;
      assessment_type: string;
      responses?: Record<string, any>;
      total_score?: number;
      subscale_scores?: Record<string, any>;
      time_point?: string;
      study_day?: number;
      completed_at?: string;
    },
  ) {
    return this.assessmentsService.create(userId, {
      participantId: body.participant_id,
      assessmentType: body.assessment_type,
      responses: body.responses,
      totalScore: body.total_score,
      subscaleScores: body.subscale_scores,
      timePoint: body.time_point,
      studyDay: body.study_day,
      completedAt: body.completed_at ? new Date(body.completed_at) : undefined,
    });
  }

  @Get('mine')
  getMine(@CurrentUser('sub') userId: string) {
    return this.assessmentsService.findByUserId(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findAll() {
    return this.assessmentsService.findAll();
  }
}
