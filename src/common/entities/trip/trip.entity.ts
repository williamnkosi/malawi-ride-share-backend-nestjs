import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TripStatus } from './trip_status';
import { RiderEntity } from 'src/common/entities/rider.entity';
import { DriverEntity } from 'src/common/entities/driver.entity';

@Entity()
export class TripEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RiderEntity, (rider) => rider, { eager: true })
  rider: RiderEntity;

  @ManyToOne(() => DriverEntity, (driver) => driver, {
    eager: true,
    nullable: true,
  })
  driver: DriverEntity;

  @Column({
    type: 'enum',
    enum: TripStatus,
    default: TripStatus.REQUESTED,
  })
  status: TripStatus;

  @Column({ type: 'float', nullable: true })
  distanceKm: number;

  @Column({ type: 'float', nullable: true })
  durationMin: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
