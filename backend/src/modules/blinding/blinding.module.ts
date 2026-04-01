import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlindingService } from './blinding.service';
import { BlindingController } from './blinding.controller';
import { BlindingRecord } from './entities/blinding-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlindingRecord])],
  controllers: [BlindingController],
  providers: [BlindingService],
  exports: [BlindingService],
})
export class BlindingModule {}
