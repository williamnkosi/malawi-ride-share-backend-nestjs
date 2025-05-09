import { Module } from '@nestjs/common';
import { RiderLocationTrackingController } from './rider_location_tracking.controller';
import { RiderLocationTrackingGateway } from './rider_location_tracking.gateway';

@Module({
  controllers: [RiderLocationTrackingController],
  providers: [RiderLocationTrackingGateway],
})
export class RiderLocationTrackingModule {}
