import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [TripModule],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway],
  exports: [],
})
export class TrackingModule {}
