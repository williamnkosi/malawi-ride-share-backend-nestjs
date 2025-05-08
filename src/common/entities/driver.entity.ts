import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DriverReviewEntity } from './driver_review.entity';

@Entity('drivers')
export class DriverEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => DriverReviewEntity, (review) => review.driver)
  reviews: DriverReviewEntity[]; // Relationship to DriverReview
}
