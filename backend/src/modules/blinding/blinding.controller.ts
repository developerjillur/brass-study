import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { BlindingService } from './blinding.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/blinding')
@UseGuards(RolesGuard)
export class BlindingController {
  constructor(private readonly blindingService: BlindingService) {}

  @Get()
  @Roles('researcher')
  findAll() {
    return this.blindingService.findAll();
  }

  @Post('assign/:participantId')
  @Roles('researcher')
  assign(@Param('participantId') participantId: string) {
    return this.blindingService.assign(participantId);
  }

  @Post('unblind')
  @Roles('researcher')
  unblind() {
    return this.blindingService.unblindAll();
  }

  @Get('prescribed-duration/:participantId')
  getPrescribedDuration(@Param('participantId') participantId: string) {
    return this.blindingService.getPrescribedDuration(participantId);
  }
}
