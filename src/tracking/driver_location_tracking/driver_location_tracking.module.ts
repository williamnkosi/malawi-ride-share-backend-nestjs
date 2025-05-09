import { Module } from '@nestjs/common';
import { DriverLocationTrackingGateway } from './driver_location_tracking.gateway';
import { DriverLocationTrackingService } from './driver_location_tracking.service';
import { DriverLocationTrackingController } from './driver_location_tracking.controller';

@Module({
  providers: [DriverLocationTrackingGateway, DriverLocationTrackingService],
  controllers: [DriverLocationTrackingController],
})
export class DriverLocationTrackingModule {}
