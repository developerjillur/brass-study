import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    userId: string | null,
    action: string,
    tableName?: string,
    recordId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
  ): Promise<AuditLog> {
    const entry = this.auditRepo.create({
      userId,
      action,
      tableName: tableName || null,
      recordId: recordId || null,
      details: details || null,
      ipAddress: ipAddress || null,
    });
    return this.auditRepo.save(entry);
  }

  async findAll(filters?: {
    userId?: string;
    action?: string;
    tableName?: string;
  }): Promise<AuditLog[]> {
    const query = this.auditRepo.createQueryBuilder('audit');

    if (filters?.userId) {
      query.andWhere('audit.user_id = :userId', { userId: filters.userId });
    }
    if (filters?.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }
    if (filters?.tableName) {
      query.andWhere('audit.table_name = :tableName', { tableName: filters.tableName });
    }

    query.orderBy('audit.created_at', 'DESC');
    return query.getMany();
  }
}
