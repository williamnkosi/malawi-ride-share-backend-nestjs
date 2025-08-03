import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeviceEntity } from 'src/common/entities/user_device.entity';
import { UserDeviceModule } from 'src/notifications/user_device/user_device.module';
import { DriverNotificationsService } from './driver_notifications/driver_notifications.service';
import { RiderNotificationsService } from './rider_notifications/rider_notifications.service';
import { NotificationEventEmitter } from './notifications_emitter/notificaiton_emitter';

@Module({
  providers: [
    NotificationsService,
    DriverNotificationsService,
    RiderNotificationsService,
    NotificationEventEmitter,
  ],
  imports: [
    FirebaseModule,
    TypeOrmModule.forFeature([UserDeviceEntity]),
    UserDeviceModule,
  ],
  exports: [NotificationsService, NotificationEventEmitter],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
