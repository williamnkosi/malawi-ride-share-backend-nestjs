import { Module } from '@nestjs/common';
import { DriverTripManagerService } from './driver_trip_manager.service';

@Module({
  providers: [DriverTripManagerService],
})
export class DriverTripManagerModule {}
