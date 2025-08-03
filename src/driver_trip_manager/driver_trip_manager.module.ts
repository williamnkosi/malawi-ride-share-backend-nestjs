import { Module } from '@nestjs/common';
import { DriverTripManagerService } from './driver_trip_manager.service';
import { LocationTrackingModule } from 'src/location_tracking/location_tracking.module';
import { TripModule } from 'src/trip/trip.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [LocationTrackingModule, TripModule, EventEmitterModule],
  providers: [DriverTripManagerService],
})
export class DriverTripManagerModule {}
