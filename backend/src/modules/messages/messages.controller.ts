import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  send(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      recipient_id: string;
      subject?: string;
      body?: string;
      participant_id?: string;
    },
  ) {
    return this.messagesService.send(userId, {
      recipientId: body.recipient_id,
      subject: body.subject,
      body: body.body,
      participantId: body.participant_id,
    });
  }

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  broadcast(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      recipientIds: string[];
      subject?: string;
      body?: string;
      participantId?: string;
    },
  ) {
    return this.messagesService.broadcast(
      userId,
      body.recipientIds,
      body.subject,
      body.body,
      body.participantId,
    );
  }

  @Get()
  findMine(@CurrentUser('sub') userId: string) {
    return this.messagesService.findByUserId(userId);
  }

  @Put(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.messagesService.markAsRead(id, userId);
  }
}
