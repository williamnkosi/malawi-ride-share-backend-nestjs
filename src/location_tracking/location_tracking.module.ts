import { Module } from '@nestjs/common';
import { LocationTrackingController } from './location_tracking.controller';
import { LocationTrackingService } from './location_tracking.service';
import { LocationTrackingGateway } from './location_tracking.gateway';

@Module({
  controllers: [LocationTrackingController],
  providers: [LocationTrackingService, LocationTrackingGateway],
})
export class LocationTrackingModule {}
