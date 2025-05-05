import { Controller, Param, Post } from '@nestjs/common';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { NotificationsService } from 'src/notifications/notifications.service';

@Controller('testing')
export class TestingController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-notification/:token')
  async ping(@Param('token') token: string) {
    try {
      const title = 'Test Notification';
      const body = 'This is a test notification';
      await this.notificationsService.sendNotification(token, title, body);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new CustomError('Failed', 500);
    }
  }
}
