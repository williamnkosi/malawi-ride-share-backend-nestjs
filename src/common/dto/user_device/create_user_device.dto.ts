import { IsEnum, IsString, Matches } from 'class-validator';
import { DevicePlatform } from './device_platform';

export class CreateUserDeviceDto {
  @IsString()
  userId: string;

  @IsString()
  fcmToken: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'deviceVersion must be a semantic version (e.g. 1.2.3)',
  })
  deviceVersion: string;
}
