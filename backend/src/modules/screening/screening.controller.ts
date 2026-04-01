import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ScreeningService } from './screening.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/screening')
export class ScreeningController {
  constructor(private readonly screeningService: ScreeningService) {}

  @Public()
  @Post()
  create(
    @Body() body: { full_name: string; email: string; consent_to_contact: boolean },
  ) {
    return this.screeningService.create({
      fullName: body.full_name,
      email: body.email,
      consentToContact: body.consent_to_contact,
    });
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findAll() {
    return this.screeningService.findAll();
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.screeningService.updateStatus(id, body);
  }
}
