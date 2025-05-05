import { Injectable } from '@nestjs/common';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
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
      return response;
    } catch {
      throw new CustomError('Error sending notification', 500);
    }
  }
}
