import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { TherapySessionsService } from './therapy-sessions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/therapy-sessions')
export class TherapySessionsController {
  constructor(private readonly sessionsService: TherapySessionsService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      participant_id: string;
      session_date: string;
      study_day?: number;
      duration_minutes?: number;
      device_used?: string;
      body_area?: string;
      pain_level_before?: number;
      pain_level_after?: number;
      fatigue_level?: number;
      notes?: string;
      side_effects?: string;
      skipped?: boolean;
      skip_reason?: string;
    },
  ) {
    return this.sessionsService.create(userId, {
      participantId: body.participant_id,
      sessionDate: new Date(body.session_date),
      studyDay: body.study_day,
      durationMinutes: body.duration_minutes,
      deviceUsed: body.device_used,
      bodyArea: body.body_area,
      painLevelBefore: body.pain_level_before,
      painLevelAfter: body.pain_level_after,
      fatigueLevel: body.fatigue_level,
      notes: body.notes,
      sideEffects: body.side_effects,
      skipped: body.skipped,
      skipReason: body.skip_reason,
    });
  }

  @Get('mine')
  getMine(@CurrentUser('sub') userId: string) {
    return this.sessionsService.findByUserId(userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      duration_minutes?: number;
      device_used?: string;
      body_area?: string;
      pain_level_before?: number;
      pain_level_after?: number;
      fatigue_level?: number;
      notes?: string;
      side_effects?: string;
      skipped?: boolean;
      skip_reason?: string;
    },
  ) {
    const data: Partial<any> = {};
    if (body.duration_minutes !== undefined) data.durationMinutes = body.duration_minutes;
    if (body.device_used !== undefined) data.deviceUsed = body.device_used;
    if (body.body_area !== undefined) data.bodyArea = body.body_area;
    if (body.pain_level_before !== undefined) data.painLevelBefore = body.pain_level_before;
    if (body.pain_level_after !== undefined) data.painLevelAfter = body.pain_level_after;
    if (body.fatigue_level !== undefined) data.fatigueLevel = body.fatigue_level;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.side_effects !== undefined) data.sideEffects = body.side_effects;
    if (body.skipped !== undefined) data.skipped = body.skipped;
    if (body.skip_reason !== undefined) data.skipReason = body.skip_reason;
    return this.sessionsService.update(id, userId, data);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findAll() {
    return this.sessionsService.findAll();
  }
}
