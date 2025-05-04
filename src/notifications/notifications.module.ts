import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  providers: [NotificationsService],
  imports: [FirebaseModule],
  exports: [NotificationsService],
})
export class NotificationsModule {}
