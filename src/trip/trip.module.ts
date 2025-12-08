import { Module, forwardRef } from '@nestjs/common';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripGateway } from './trip.gateway';
import { LocationTrackingModule } from 'src/location_tracking/location_tracking.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TripEntity } from './entities/trip.entity';
import { SequentialNotifcationService } from './services/sequential_notifcation/sequential_notifcation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripEntity]),
    LocationTrackingModule,
    FirebaseModule,
    UsersModule,
    forwardRef(() => NotificationsModule), // Use forwardRef to break circular dependency
  ],
  controllers: [TripController],
  providers: [TripService, TripGateway, SequentialNotifcationService],
  exports: [TripService, TripGateway], // Export services for use in other modules
})
export class TripModule {}
