import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      participant_id: string;
      consent_type: string;
      consented: boolean;
      consent_version?: string;
      ip_address?: string;
      signed_at?: string;
    },
  ) {
    return this.consentService.create(userId, {
      participantId: body.participant_id,
      consentType: body.consent_type,
      consented: body.consented,
      consentVersion: body.consent_version,
      ipAddress: body.ip_address,
      signedAt: body.signed_at ? new Date(body.signed_at) : undefined,
    });
  }

  @Get('mine')
  getMine(@CurrentUser('sub') userId: string) {
    return this.consentService.findByUserId(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findAll() {
    return this.consentService.findAll();
  }
}
