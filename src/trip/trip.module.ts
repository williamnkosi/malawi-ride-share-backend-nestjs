import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripEntity } from 'src/common/dto/trip/trip.entity';

import { DriverEntity } from 'src/common/entities/driver.entity';
import { RiderEntity } from 'src/common/entities/rider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TripEntity, DriverEntity, RiderEntity])],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
