import { IsString, IsNumber, Min, Max } from 'class-validator';

export class RiderLocationDto {
  @IsString()
  firebaseId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
