import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { DriverEntity } from './driver.entity';
import { RiderEntity } from './rider.entity';

@Entity('driver_reviews')
export class DriverReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // Rating given by the rider (e.g., 1-5)

  @Column({ type: 'text', nullable: true })
  comment: string; // Optional review comment

  @ManyToOne(() => DriverEntity, (driver) => driver.reviews, { eager: true })
  @JoinColumn({ name: 'driver_id' })
  driver: DriverEntity; // Reference to the Driver being reviewed

  @ManyToOne(() => RiderEntity, (rider) => rider.riderReviews, { eager: true })
  @JoinColumn({ name: 'rider_id' })
  rider: RiderEntity; // Reference to the Rider leaving the review
}
