import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get('me')
  getMe(@CurrentUser('sub') userId: string) {
    return this.participantsService.findByUserId(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findAll() {
    return this.participantsService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findOne(@Param('id') id: string) {
    return this.participantsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      onboarding_step?: number;
      onboarding_completed?: boolean;
      status?: string;
      researcher_notes?: string;
      study_start_date?: string;
    },
  ) {
    return this.participantsService.update(id, {
      onboardingStep: body.onboarding_step,
      onboardingCompleted: body.onboarding_completed,
      status: body.status,
      researcherNotes: body.researcher_notes,
      studyStartDate: body.study_start_date ? new Date(body.study_start_date) : undefined,
    });
  }

  @Post(':id/withdraw')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  withdraw(@Param('id') id: string) {
    return this.participantsService.withdraw(id);
  }
}
