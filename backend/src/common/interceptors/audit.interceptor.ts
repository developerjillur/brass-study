import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const userId = request.user?.sub || null;
      const ip = request.ip || request.connection?.remoteAddress || null;

      return next.handle().pipe(
        tap((responseData) => {
          const action =
            method === 'POST'
              ? 'INSERT'
              : method === 'DELETE'
                ? 'DELETE'
                : 'UPDATE';

          this.auditRepo
            .save({
              userId,
              action,
              tableName: request.route?.path || null,
              recordId: responseData?.id || request.params?.id || null,
              details: { body: request.body, params: request.params },
              ipAddress: ip,
            })
            .catch(() => {});
        }),
      );
    }

    return next.handle();
  }
}
