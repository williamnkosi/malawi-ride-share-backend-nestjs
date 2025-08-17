import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDeviceDto } from 'src/common/dto/user_device/create_user_device.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { NotificationsService } from './notifications.service';
import { ApiResponse } from 'src/common/types/api_response';
import { UserDeviceService } from 'src/notifications/user_device/user_device.service';
import { AuthenticatedRequest } from 'src/common/guards/firebase_auth_guard_types';
import { FirebaseAuthGuard } from 'src/common/guards/firebase_auth_guard';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly userDeviceService: UserDeviceService,
  ) {}

  @Post('register-device')
  @UseGuards(FirebaseAuthGuard)
  async registerDevice(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateUserDeviceDto,
  ): Promise<ApiResponse<boolean>> {
    try {
      await this.userDeviceService.registerOrUpdateDevice(request.userId, dto);
      return new ApiResponse(true, 'Device registered successfully', true);
    } catch {
      throw new CustomError('Error registering device', 500);
    }
  }

  // @Post('get-device')
  // async getDevice(
  //   @Body('firebaseUserId') firebaseUserId: string,
  // ): Promise<ApiResponse<any>> {
  //   try {
  //     if (!device) {
  //       return new ApiResponse(false, 'Device not found', null);
  //     }
  //     return new ApiResponse(true, 'Device retrieved successfully', device);
  //   } catch {
  //     throw new CustomError('Error retrieving device', 500);
  //   }
  // }
}
