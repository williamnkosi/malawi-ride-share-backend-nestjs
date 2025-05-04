import { Controller, HttpStatus, Param, Post } from '@nestjs/common';
import { CustomErrorResonse } from 'src/common/types/errorMessageResponse';
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
    } catch (e) {
      throw new CustomErrorResonse('Failed', HttpStatus.BAD_REQUEST);
    }
  }
}
