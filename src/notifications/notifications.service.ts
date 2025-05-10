import { Injectable } from '@nestjs/common';
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

  async registerDevice(dto: CreateUserDeviceDto): Promise<void> {
    try {
      await this.userDeviceRepository.create(dto);
    } catch (error) {
      console.error(error);
      throw new CustomError('Error registering device', 500);
    }
  }
}
