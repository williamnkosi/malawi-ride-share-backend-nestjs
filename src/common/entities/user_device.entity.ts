// user-device.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DevicePlatform } from '../types/device_platform';
import { Matches } from 'class-validator';
import { UserEntity } from '../../users/users.entity'; // ✅ Import actual class

@Entity()
export class UserDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' }) // ✅ Specify column name
  user: UserEntity;

  // ✅ Remove redundant userId column since @JoinColumn creates it

  @Unique(['fcmToken'])
  @Column({ nullable: false })
  fcmToken: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: DevicePlatform,
  })
  platform: DevicePlatform;

  @Column()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'deviceVersion must be a semantic version (e.g. 1.2.3)',
  })
  deviceVersion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
