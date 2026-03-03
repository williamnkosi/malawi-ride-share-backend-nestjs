import { IsString } from 'class-validator';

export class StartTripDto {
  @IsString()
  tripId!: string;
}
