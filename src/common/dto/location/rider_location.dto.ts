import { IsString, IsNumber, Min, Max, IsDate, IsEnum } from 'class-validator';
import { RiderStatus } from './rider_status';

export class RiderLocationDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsDate()
  timestamp: number;

  @IsEnum(RiderStatus)
  status: RiderStatus;
}
