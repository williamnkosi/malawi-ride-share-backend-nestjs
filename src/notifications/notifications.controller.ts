import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDeviceDto } from 'src/common/dto/user_device/create_user_device.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { NotificationsService } from './notifications.service';
import { ApiResponse } from 'src/common/types/api_response';
import { UserDeviceService } from 'src/user_device/user_device.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationsService,
    private readonly userDeviceRepository: UserDeviceService,
  ) {}

  @Post('register-device')
  async registerDevice(
    @Body() dto: CreateUserDeviceDto,
  ): Promise<ApiResponse<boolean>> {
    try {
      await this.userDeviceRepository.registerOrUpdateDevice(dto);
      return new ApiResponse(true, 'Device registered successfully', true);
    } catch {
      throw new CustomError('Error registering device', 500);
    }
  }

  @Post('get-device')
  async getDevice(
    @Body('firebaseUserId') firebaseUserId: string,
  ): Promise<ApiResponse<any>> {
    try {
      const device = await this.userDeviceRepository.findOne(firebaseUserId);
      if (!device) {
        return new ApiResponse(false, 'Device not found', null);
      }
      return new ApiResponse(true, 'Device retrieved successfully', device);
    } catch {
      throw new CustomError('Error retrieving device', 500);
    }
  }
}
