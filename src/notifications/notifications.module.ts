import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeviceEntity } from 'src/common/entities/user_device.entity';
import { UserDeviceService } from './user_device/user_device.service';
import { DriverNotificationsService } from './driver_notifications/driver_notifications.service';
import { RiderNotificationsService } from './rider_notifications/rider_notifications.service';
import { NotificationEventEmitter } from './notifications_emitter/notificaiton_emitter';
import { LocationTrackingModule } from 'src/location_tracking/location_tracking.module';
import { TripModule } from 'src/trip/trip.module';

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
    TypeOrmModule.forFeature([UserDeviceEntity]),
    LocationTrackingModule,
    forwardRef(() => TripModule), // Use forwardRef to break circular dependency
  ],
  exports: [NotificationsService, NotificationEventEmitter],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
