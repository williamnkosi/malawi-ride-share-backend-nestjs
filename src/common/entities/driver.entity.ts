import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DriverReviewEntity } from './driver_review.entity';

@Entity('drivers')
export class DriverEntity {
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

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  driverLicenseNumber: string;

  @OneToMany(() => DriverReviewEntity, (review) => review.driver)
  reviews: DriverReviewEntity[]; // Relationship to DriverReview
}
