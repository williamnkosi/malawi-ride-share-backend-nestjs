import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TripStatus } from './trip_status';
import { RiderEntity } from 'src/common/entities/rider.entity';
import { DriverEntity } from 'src/common/entities/driver.entity';
import { UserLocationDto } from 'src/common/dto/location/user_location.dto';

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

  @Column(() => UserLocationDto)
  startRiderLocation: UserLocationDto;

  @Column(() => UserLocationDto)
  endRiderLocation: UserLocationDto;

  @Column({ type: 'float', nullable: true })
  distanceKm: number;

  @Column({ type: 'float', nullable: true })
  durationMin: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  updatedAt: Date;
}
