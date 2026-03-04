import { IsString } from 'class-validator';

export class RejectTripDto {
  @IsString()
  driverId: string;
  @IsString()
  tripId: string;
}
