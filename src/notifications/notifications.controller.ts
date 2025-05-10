import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDeviceDto } from 'src/common/dto/user_device/create_user_device.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { NotificationsService } from './notifications.service';
import { ApiResponse } from 'src/common/types/api_response';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Post('register-device')
  async registerDevice(
    @Body() dto: CreateUserDeviceDto,
  ): Promise<ApiResponse<boolean>> {
    try {
      await this.notificationService.registerDevice(dto);
      return new ApiResponse(true, 'Device registered successfully', true);
    } catch {
      throw new CustomError('Error registering device', 500);
    }
  }
}
