import { JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users.entity';

export class RiderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.driverProfile, { cascade: true })
  @JoinColumn()
  user: UserEntity;
}
