import { Module } from '@nestjs/common';
import { RiderLocationTrackingController } from './rider_location_tracking.controller';
import { RiderLocationTrackingGateway } from './rider_location_tracking.gateway';
import { RiderLocationTrackingService } from './rider_location_tracking.service';

@Module({
  controllers: [RiderLocationTrackingController],
  providers: [RiderLocationTrackingGateway, RiderLocationTrackingService],
})
export class RiderLocationTrackingModule {}
