import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsNumber()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude: number;

  @IsNumber()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;
}

export class RequestTripDto {
  @IsNotEmpty({ message: 'Pickup location is required' })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  readonly pickupLocation: LocationDto;

  @IsNotEmpty({ message: 'Dropoff location is required' })
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  readonly dropoffLocation: LocationDto;

  @IsOptional()
  @IsDateString({}, { message: 'Scheduled time must be a valid date' })
  readonly scheduledTime?: string;

  @IsNumber({}, { message: 'Passenger count must be a number' })
  @Min(1, { message: 'At least 1 passenger is required' })
  @Max(8, { message: 'Maximum 8 passengers allowed' })
  readonly passengerCount: number;

  @IsOptional()
  @IsString()
  readonly notes?: string;

  @IsNotEmpty({ message: 'Rider ID is required' })
  @IsString()
  readonly riderId: string;
}
