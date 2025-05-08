import { IsEnum, IsNumber, Min, Max, IsString, IsDate } from 'class-validator';
import { DriverStatus } from './driverStatus';

export class DriverLocationDto {
  @IsString()
  userId: string;
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsDate()
  timestamp: number; // Assume it's a Unix timestamp in milliseconds

  @IsEnum(DriverStatus)
  status: DriverStatus;
}
