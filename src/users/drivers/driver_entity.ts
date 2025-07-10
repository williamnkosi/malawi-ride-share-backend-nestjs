import { Column } from 'typeorm';
import { UserEntity } from '../users.entity';

export class DriverEntity extends UserEntity {
  @Column()
  driverLicenseNumber: string;
}
