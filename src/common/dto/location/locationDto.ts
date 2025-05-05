import { IsString, IsEnum, IsNumber } from 'class-validator';
import { UserType } from './userType';

export class LocationDto {
  @IsString()
  userId: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  timestamp: number;
}
