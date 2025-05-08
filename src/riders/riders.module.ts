import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderEntity } from 'src/common/entities/rider.entity';

import { RiderService } from './riders.service';

@Module({
  imports: [TypeOrmModule.forFeature([RiderEntity])],
  controllers: [],
  providers: [RiderService],
  exports: [RiderService],
})
export class RiderModule {}
