import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiderEntity } from 'src/common/entities/rider.entity';

import { RidersService } from './riders.service';

@Module({
  imports: [TypeOrmModule.forFeature([RiderEntity])],
  controllers: [],
  providers: [RidersService],
  exports: [RidersService],
})
export class RiderModule {}
