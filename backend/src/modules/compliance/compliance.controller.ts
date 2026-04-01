import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/compliance-alerts')
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('researcher')
  findAll() {
    return this.complianceService.findAll();
  }

  @Get('mine')
  getMine(@CurrentUser('sub') userId: string) {
    return this.complianceService.findByParticipantUserId(userId);
  }

  @Put(':id/dismiss')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  dismiss(@Param('id') id: string) {
    return this.complianceService.dismiss(id);
  }
}
