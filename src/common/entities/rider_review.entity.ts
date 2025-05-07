import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver.entity';
import { Rider } from './rider.entity';

@Entity('rider_reviews')
export class RiderReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // Rating given by the driver (e.g., 1-5)

  @Column({ type: 'text', nullable: true })
  comment: string; // Optional review comment

  @ManyToOne(() => Driver, (driver) => driver.reviews, { eager: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver; // Reference to the Driver leaving the review

  @ManyToOne(() => Rider, (rider) => rider.riderReviews, { eager: true })
  @JoinColumn({ name: 'rider_id' })
  rider: Rider;
}
