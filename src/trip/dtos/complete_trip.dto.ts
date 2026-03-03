import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteTripDto {
  @IsNotEmpty()
  @IsString()
  tripId!: string;
}
