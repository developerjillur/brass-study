import { Controller, Get, Put, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('mine')
  getMine(@CurrentUser('sub') userId: string) {
    return this.notificationsService.findByUserId(userId);
  }

  @Put('read-all')
  markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Put(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
