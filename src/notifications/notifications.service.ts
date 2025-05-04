import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseService: FirebaseService) {}
  async sendNotification(token: string, title: string, body: string) {
    const message = {
      notification: { title, body },
      token,
    };

    try {
      const message1 = this.firebaseService.getMessaging();
      const response = await message1.send(message);
      console.log('✅ Notification sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      // Optional: throw an HTTP exception or handle gracefully
      throw new Error('Push notification failed');
    }
  }
}
