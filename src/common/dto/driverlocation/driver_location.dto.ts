import { IsEnum, IsObject, ValidateNested } from 'class-validator';
import { DriverStatus } from './driver_status';
import { Column } from 'typeorm';
import { UserLocationDto } from '../location/user_location.dto';

export class DriverLocationDto {
  @Column()
  firebaseId: string;

  @IsObject()
  @ValidateNested()
  @Column(() => UserLocationDto)
  driverLocation: UserLocationDto;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @IsEnum(DriverStatus)
  status: DriverStatus;
}
