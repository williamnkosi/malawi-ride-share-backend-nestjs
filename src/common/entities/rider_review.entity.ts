import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Driver,
} from 'typeorm';
import { DriverEntity } from './driver.entity';
import { RiderEntity } from './rider.entity';

@Entity('rider_reviews')
export class RiderReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // Rating given by the driver (e.g., 1-5)

  @Column({ type: 'text', nullable: true })
  comment: string; // Optional review comment

  @ManyToOne(() => DriverEntity, (driver) => driver.reviews, { eager: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver; // Reference to the Driver leaving the review

  @ManyToOne(() => RiderEntity, (rider) => rider.riderReviews, { eager: true })
  @JoinColumn({ name: 'rider_id' })
  rider: RiderEntity;
}
