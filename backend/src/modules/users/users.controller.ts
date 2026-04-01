import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.getMyProfile(userId);
  }

  @Put('me/profile')
  updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() body: { full_name?: string; phone?: string; date_of_birth?: string; address?: string },
  ) {
    return this.usersService.updateMyProfile(userId, {
      fullName: body.full_name,
      phone: body.phone,
      dateOfBirth: body.date_of_birth ? new Date(body.date_of_birth) : undefined,
      address: body.address,
    });
  }

  @Get('profiles')
  @UseGuards(RolesGuard)
  @Roles('researcher')
  getAllProfiles() {
    return this.usersService.getAllProfiles();
  }
}
