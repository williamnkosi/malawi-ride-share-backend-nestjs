import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripGateway } from './trip.gateway';

@Module({
  controllers: [TripController],
  providers: [TripService, TripGateway],
})
export class TripModule {}
