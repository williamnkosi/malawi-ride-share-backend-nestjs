import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeviceEntity } from 'src/common/entities/user_device.entity';
import { UserDeviceModule } from 'src/user_device/user_device.module';
import { DriverNotificationsService } from './driver_notifications/driver_notifications.service';
import { RiderNotificationsService } from './rider_notifications/rider_notifications.service';

@Module({
  providers: [
    NotificationsService,
    DriverNotificationsService,
    RiderNotificationsService,
  ],
  imports: [
    FirebaseModule,
    TypeOrmModule.forFeature([UserDeviceEntity]),
    UserDeviceModule,
  ],
  exports: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
