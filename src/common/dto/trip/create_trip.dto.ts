import { IsString } from 'class-validator';
import { Column } from 'typeorm';

export class CreateTripDto {
  @IsString()
  firebaseId: string;

  @Column(() => Location)
  startLocation: Location;

  @Column(() => Location)
  endLocation: Location;
}
