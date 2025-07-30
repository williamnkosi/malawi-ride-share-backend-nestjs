import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/users.entity';

export enum TripStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('trips')
export class TripEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === CORE RELATIONSHIPS ===

  // Rider who requested the trip
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'rider_id' })
  rider: UserEntity;

  @Column({ name: 'rider_id' })
  riderId: string;

  // Driver assigned to the trip (nullable until assigned)
  @ManyToOne(() => UserEntity, { eager: true, nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver?: UserEntity;

  @Column({ name: 'driver_id', nullable: true })
  driverId?: string;

  // === BASIC TRIP DATA ===

  @Column({
    type: 'enum',
    enum: TripStatus,
  })
  status: TripStatus;

  // Simple location strings for now
  @Column()
  pickupAddress: string;

  @Column()
  dropoffAddress: string;

  pickUpLocation: Location;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  pickupLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  pickupLongitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  dropoffLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  dropoffLongitude: number;

  @Column({ type: 'int', default: 1 })
  passengerCount: number;

  // === TIMESTAMPS ===

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
