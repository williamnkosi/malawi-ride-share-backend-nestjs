import { IsEnum, IsString, Matches } from 'class-validator';
import { DevicePlatform } from './device_platform';
import { Column } from 'typeorm';

export class CreateUserDeviceDto {
  @Column({ unique: true })
  @IsString()
  firebaseUserId: string;

  @Column({ unique: true })
  @IsString()
  fcmToken: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'deviceVersion must be a semantic version (e.g. 1.2.3)',
  })
  @IsString()
  deviceVersion: string;
}
