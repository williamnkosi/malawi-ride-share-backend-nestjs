import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DriverReviewEntity } from './driver_review.entity';
import { RiderReviewEntity } from './rider_review.entity';

@Entity('riders')
export class RiderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => DriverReviewEntity, (review) => review.rider)
  driverReviews: DriverReviewEntity[]; // Relationship to DriverReview

  @OneToMany(() => RiderReviewEntity, (review) => review.rider)
  riderReviews: RiderReviewEntity[]; // Relationship to RiderReview
}
