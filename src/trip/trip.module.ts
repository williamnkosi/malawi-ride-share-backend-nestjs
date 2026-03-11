import { Module, forwardRef } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripGateway } from './trip.gateway';
import { LocationTrackingModule } from '../location_tracking/location_tracking.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { FirebaseModule } from '../firebase/firebase.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TripEntity } from './entities/trip.entity';
import { DriverMatchingService } from './services/sequential_notifcation/sequential_notifcation.service';
import { GoogleMapsServiceModule } from '../google_maps_service/google_maps_service.module';
import { TripCommunicationService } from './services/trip_communication/trip_communication.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripEntity]),
    LocationTrackingModule,
    FirebaseModule,
    UsersModule,
    GoogleMapsServiceModule,
    forwardRef(() => NotificationsModule), // Use forwardRef to break circular dependency
  ],
  controllers: [TripController],
  providers: [
    TripService,
    TripGateway,
    DriverMatchingService,
    TripCommunicationService,
  ],
  exports: [TripService, TripGateway], // Export services for use in other modules
})
export class TripModule {}
