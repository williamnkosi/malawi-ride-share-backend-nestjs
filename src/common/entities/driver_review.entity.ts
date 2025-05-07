import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Driver } from './driver.entity'; // Assuming you have a Driver entity
import { Rider } from './rider.entity'; // Assuming you have a Rider entity

@Entity('driver_reviews')
export class DriverReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // Rating given by the rider (e.g., 1-5)

  @Column({ type: 'text', nullable: true })
  comment: string; // Optional review comment

  @ManyToOne(() => Driver, (driver) => driver.reviews, { eager: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver; // Reference to the Driver being reviewed

  @ManyToOne(() => Rider, (rider) => rider.riderReviews, { eager: true })
  @JoinColumn({ name: 'rider_id' })
  rider: Rider; // Reference to the Rider leaving the review
}
