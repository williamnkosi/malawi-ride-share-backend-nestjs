import { IsNumber, Min, Max } from 'class-validator';
import { Column, Entity } from 'typeorm';

@Entity()
export class RiderLocationDto {
  @Column()
  firebaseId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
