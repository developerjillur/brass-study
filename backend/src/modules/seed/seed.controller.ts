import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/seed')
export class SeedController {
  constructor(private seedService: SeedService) {}

  @Public()
  @Post('test-users')
  seedTestUsers() {
    return this.seedService.seedTestUsers();
  }
}
