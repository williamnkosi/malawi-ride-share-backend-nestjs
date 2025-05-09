import { IsEnum, IsNumber, Min, Max, IsString } from 'class-validator';
import { DriverStatus } from './driver_status';
import { Column } from 'typeorm';

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @IsEnum(DriverStatus)
  status: DriverStatus;
}
