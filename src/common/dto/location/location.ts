import { IsNumber, IsString } from 'class-validator/types/decorator/decorators';
import { UserType } from './userType';

export class LocationDto {
  @IsString()
  userId: string;

  @IsString()
  userType: UserType;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  timestamp: number;
}
