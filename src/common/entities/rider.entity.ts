import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DriverReview } from './driver_review.entity';
import { RiderReview } from './rider_review.entity';

@Entity('riders')
export class Rider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => DriverReview, (review) => review.rider)
  driverReviews: DriverReview[]; // Relationship to DriverReview

  @OneToMany(() => RiderReview, (review) => review.rider)
  riderReviews: RiderReview[]; // Relationship to RiderReview
}
