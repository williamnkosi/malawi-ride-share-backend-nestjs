import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users.entity';

@Entity()
export class RiderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.rider, { cascade: true })
  @JoinColumn()
  user: UserEntity;
}
