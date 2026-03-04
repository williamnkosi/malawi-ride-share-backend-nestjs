import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeviceEntity } from '../common/entities/user_device.entity';
import { UserDeviceService } from './user_device/user_device.service';
import { DriverNotificationsService } from './driver_notifications/driver_notifications.service';
import { RiderNotificationsService } from './rider_notifications/rider_notifications.service';
import { NotificationEventEmitter } from './notifications_emitter/notificaiton_emitter';
import { LocationTrackingModule } from '../location_tracking/location_tracking.module';
import { TripModule } from '../trip/trip.module';
import { UsersModule } from '../users/users.module';
import { UserEntity } from '../users/users.entity';

@Module({
  providers: [
    NotificationsService,
    UserDeviceService,
    DriverNotificationsService,
    RiderNotificationsService,
    NotificationEventEmitter,
  ],
  imports: [
    FirebaseModule,
    UsersModule, // ✅ Add UsersModule to provide UsersService
    TypeOrmModule.forFeature([UserDeviceEntity, UserEntity]),
    LocationTrackingModule,
    forwardRef(() => TripModule), // Use forwardRef to break circular dependency
  ],
  exports: [NotificationsService, NotificationEventEmitter],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
