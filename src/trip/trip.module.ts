import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripEntity } from 'src/common/dto/trip/trip.entity';

import { DriverEntity } from 'src/common/entities/driver.entity';
import { RiderEntity } from 'src/common/entities/rider.entity';
import { DriversModule } from 'src/driver/driver.module';
import { RiderModule } from 'src/riders/riders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripEntity, DriverEntity, RiderEntity]),
    RiderModule,
    DriversModule,
  ],
  controllers: [TripController],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}
