// user-device.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { DevicePlatform } from '../types/device_platform';
import { Matches } from 'class-validator';

@Entity()
export class UserDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Unique(['firebaseUserId'])
  @Column({ nullable: false })
  firebaseUserId: string;

  @Unique(['fcmToken'])
  @Column({ nullable: false })
  fcmToken: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: DevicePlatform,
  })
  platform: DevicePlatform;

  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'deviceVersion must be a semantic version (e.g. 1.2.3)',
  })
  deviceVersion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
