import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantIntakeService } from './participant-intake.service';
import { ParticipantIntakeController } from './participant-intake.controller';
import { ParticipantIntake } from './entities/participant-intake.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipantIntake])],
  controllers: [ParticipantIntakeController],
  providers: [ParticipantIntakeService],
  exports: [ParticipantIntakeService],
})
export class ParticipantIntakeModule {}
