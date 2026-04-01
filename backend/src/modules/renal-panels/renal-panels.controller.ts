import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RenalPanelsService } from './renal-panels.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/renal-panels')
export class RenalPanelsController {
  constructor(private readonly renalPanelsService: RenalPanelsService) {}

  @Public()
  @Post('screening')
  createScreening(
    @Body()
    body: {
      screeningId: string;
      full_name?: string;
      ckd_stage?: string;
      bun?: number;
      creatinine?: number;
      egfr?: number;
      calcium?: number;
      phosphorus?: number;
      albumin?: number;
      lab_date?: string;
      doctor_name?: string;
      notes?: string;
      is_eligible?: boolean;
    },
  ) {
    return this.renalPanelsService.createScreeningSubmission({
      screeningId: body.screeningId,
      fullName: body.full_name,
      ckdStage: body.ckd_stage,
      bun: body.bun,
      creatinine: body.creatinine,
      egfr: body.egfr,
      calcium: body.calcium,
      phosphorus: body.phosphorus,
      albumin: body.albumin,
      labDate: body.lab_date ? new Date(body.lab_date) : undefined,
      doctorName: body.doctor_name,
      notes: body.notes,
      isEligible: body.is_eligible,
    });
  }

  @Post('follow-up')
  createFollowUp(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      ckd_stage?: string;
      bun?: number;
      creatinine?: number;
      egfr?: number;
      calcium?: number;
      phosphorus?: number;
      albumin?: number;
      lab_date?: string;
      doctor_name?: string;
      notes?: string;
    },
  ) {
    return this.renalPanelsService.createFollowUpSubmission(userId, {
      ckdStage: body.ckd_stage,
      bun: body.bun,
      creatinine: body.creatinine,
      egfr: body.egfr,
      calcium: body.calcium,
      phosphorus: body.phosphorus,
      albumin: body.albumin,
      labDate: body.lab_date ? new Date(body.lab_date) : undefined,
      doctorName: body.doctor_name,
      notes: body.notes,
    });
  }

  @Get('mine')
  getMyPanels(@CurrentUser('sub') userId: string) {
    return this.renalPanelsService.findByParticipantUserId(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findAll() {
    return this.renalPanelsService.findAll();
  }
}
