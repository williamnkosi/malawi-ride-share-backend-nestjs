import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripGateway } from './trip.gateway';
import { LocationTrackingService } from 'src/location_tracking/location_tracking.service';
import { LocationTrackingGateway } from 'src/location_tracking/location_tracking.gateway';

@Module({
  controllers: [TripController],
  providers: [TripService, TripGateway],
  imports: [LocationTrackingService, LocationTrackingGateway],
})
export class TripModule {}
