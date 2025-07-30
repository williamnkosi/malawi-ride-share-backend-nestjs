import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users.entity';

@Entity()
export class DriverEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.driver) // Fix relationship
  @JoinColumn()
  user: UserEntity;

  @Column({ unique: true })
  driversLicenseNumber: string;
}
