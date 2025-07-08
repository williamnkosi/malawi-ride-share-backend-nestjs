import { Module } from '@nestjs/common';
import { LocationTrackingController } from './location_tracking.controller';
import { LocationTrackingService } from './location_tracking.service';

@Module({
  controllers: [LocationTrackingController],
  providers: [LocationTrackingService],
})
export class LocationTrackingModule {}
