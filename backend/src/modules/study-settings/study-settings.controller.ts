import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { StudySettingsService } from './study-settings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/study-settings')
export class StudySettingsController {
  constructor(private readonly settingsService: StudySettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Put(':key')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  update(
    @Param('key') key: string,
    @Body() body: { value: string },
    @CurrentUser('sub') userId: string,
  ) {
    return this.settingsService.updateByKey(key, body.value, userId);
  }
}
