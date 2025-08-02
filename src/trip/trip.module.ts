import { Module } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripGateway } from './trip.gateway';
import { LocationTrackingModule } from 'src/location_tracking/location_tracking.module';
import { LocationTrackingGateway } from 'src/location_tracking/location_tracking.gateway';
import { LocationTrackingService } from 'src/location_tracking/location_tracking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripEntity } from './entities/trip_entity';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripEntity]),
    LocationTrackingModule,
    FirebaseModule,
  ],
  controllers: [TripController],
  providers: [
    TripService,
    TripGateway,
    LocationTrackingGateway,
    LocationTrackingService,
  ],
})
export class TripModule {}
