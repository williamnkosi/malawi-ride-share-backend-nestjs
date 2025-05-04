import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [NotificationsService],
  imports: [FirebaseService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
