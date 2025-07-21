import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users.entity';

export class DriverEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn()
  user: UserEntity;

  @Column({ unique: true })
  driversLicenseNumber: string;
}
