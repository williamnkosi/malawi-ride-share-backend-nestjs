import { IsEnum } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { DriverEntity } from './drivers/driver_entity';
import { RiderEntity } from './riders/rider_entity';

export enum Gender {
  male,
  female,
}

// src/users/entities/base-user.entity.ts
@Entity()
export abstract class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  firebaseId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ unique: true })
  email: string;

  @IsEnum(Gender)
  status: Gender;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => DriverEntity, (driver) => driver.user, {
    nullable: true,
  })
  driverProfile?: DriverEntity;

  @OneToOne(() => RiderEntity, (rider) => rider.user, { nullable: true })
  riderProfile?: RiderEntity;
}
