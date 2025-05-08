import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DriverReviewEntity } from './driver_review.entity';
import { RiderReviewEntity } from './rider_review.entity';

@Entity('rider')
export class RiderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  firebaseId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  gender: 'male' | 'female' | 'other';

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @OneToMany(() => DriverReviewEntity, (review) => review.rider)
  driverReviews: DriverReviewEntity[]; // Relationship to DriverReview

  @OneToMany(() => RiderReviewEntity, (review) => review.rider)
  riderReviews: RiderReviewEntity[]; // Relationship to RiderReview
}
