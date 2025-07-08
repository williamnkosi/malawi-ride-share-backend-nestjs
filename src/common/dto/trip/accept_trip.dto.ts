import { IsString } from 'class-validator';

export class AcceptTripDto {
  @IsString()
  driverId: string;
  @IsString()
  tripId: string;
}
