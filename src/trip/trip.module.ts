import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripEntity } from 'src/common/entities/trip/trip.entity';

import { DriverEntity } from 'src/common/entities/driver.entity';
import { RiderEntity } from 'src/common/entities/rider.entity';
import { DriversModule } from 'src/driver/driver.module';
import { RiderModule } from 'src/riders/riders.module';
import { GoogleMapsServiceModule } from 'src/google_maps_service/google_maps_service.module';
import { DriverLocationTrackingModule } from 'src/tracking/driver_location_tracking/driver_location_tracking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripEntity, DriverEntity, RiderEntity]),
    RiderModule,
    DriversModule,
    DriverLocationTrackingModule,
    GoogleMapsServiceModule,
  ],
  controllers: [TripController],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}
