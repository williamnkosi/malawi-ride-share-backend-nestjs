import { IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { UserType } from './userType';

export class LocationDto {
  @IsString()
  userId: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  timestamp: number;
}
