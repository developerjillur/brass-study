import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/invitations')
@UseGuards(RolesGuard)
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post('invite-participant')
  @Roles('researcher')
  inviteParticipant(
    @CurrentUser('sub') userId: string,
    @Body() body: { screeningId: string },
  ) {
    return this.invitationsService.inviteParticipant(body.screeningId, userId);
  }
}
