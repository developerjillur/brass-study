import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TherapySessionsService } from './therapy-sessions.service';
import { TherapySessionsController } from './therapy-sessions.controller';
import { TherapySession } from './entities/therapy-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TherapySession])],
  controllers: [TherapySessionsController],
  providers: [TherapySessionsService],
  exports: [TherapySessionsService],
})
export class TherapySessionsModule {}
