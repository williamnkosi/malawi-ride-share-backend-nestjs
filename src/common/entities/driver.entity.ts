import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DriverReview } from './driver_review.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => DriverReview, (review) => review.driver)
  reviews: DriverReview[]; // Relationship to DriverReview
}
