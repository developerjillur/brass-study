import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('api/audit-log')
@UseGuards(RolesGuard)
@Roles('researcher')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('tableName') tableName?: string,
  ) {
    return this.auditService.findAll({ userId, action, tableName });
  }
}
