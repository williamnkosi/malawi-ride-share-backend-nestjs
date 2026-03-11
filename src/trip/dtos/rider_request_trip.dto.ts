import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class RiderRequestTripDto {
  @IsString()
  @IsNotEmpty()
  pickupAddress!: string;

  @IsString()
  @IsNotEmpty()
  destinationAddress!: string;

  @IsNumber()
  @IsNotEmpty()
  pickupLat!: number;

  @IsNumber()
  @IsNotEmpty()
  pickupLng!: number;

  @IsNumber()
  @IsNotEmpty()
  destinationLat!: number;

  @IsNumber()
  @IsNotEmpty()
  destinationLng!: number;
}
