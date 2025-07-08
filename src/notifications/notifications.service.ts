import { Injectable } from '@nestjs/common';
import { TokenMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { CreateUserDeviceDto } from 'src/common/dto/user_device/create_user_device.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserDeviceService } from 'src/user_device/user_device.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly firebaseService: FirebaseService,

    private readonly userDeviceRepository: UserDeviceService,
  ) {}
  async sendNotification(
    token: string,
    notification: { title: string; body: string },
    data: Record<string, string | number>,
  ) {
    const message = {
      notification,
      token,
      data: Object.entries(data).reduce(
        (acc, [key, value]) => {
          acc[key] = String(value); // All data values must be strings
          return acc;
        },
        {} as Record<string, string>,
      ),
    };

    try {
      const message1 = this.firebaseService.getMessaging();
      const response = await message1.send(message);
      return response;
    } catch {
      throw new CustomError('Error sending notification', 500);
    }
  }

  sendNotificationWithData(
    token: string,
    notification: { title: string; body: string },
    data: Record<string, string>,
  ) {
    const message: TokenMessage = {
      token,
      data,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      android: {
        priority: 'high',
      },
    };
    const message1 = this.firebaseService.getMessaging();
    const response = message1.send(message);
    return response;
  }

  async registerDevice(dto: CreateUserDeviceDto): Promise<void> {
    try {
      await this.userDeviceRepository.create(dto);
    } catch (error) {
      console.error(error);
      throw new CustomError('Error registering device', 500);
    }
  }
}
