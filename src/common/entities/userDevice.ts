// user-device.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { DevicePlatform } from '../types/device_platform';
import { Matches } from 'class-validator';

@Entity()
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  fcmToken: string;

  @Column({
    type: 'enum',
    enum: DevicePlatform,
  })
  platform: DevicePlatform;

  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'deviceVersion must be a semantic version (e.g. 1.2.3)',
  })
  deviceVersion: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
