import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';

export enum DriverStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  ON_TRIP = 'on_trip',
}

export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class DriverLocationDto {
  @IsString()
  firebaseId: string;

  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  location?: LocationDto;
}

export class UpdateDriverLocationDto {
  @IsString()
  firebaseId: string;

  location: LocationDto;

  @IsEnum(DriverStatus)
  status: DriverStatus;
}

export class FindNearbyDriversDto {
  location: LocationDto;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  radius?: number; // km, default 5
}

export class DriverConnectionDto {
  @IsString()
  firebaseId: string;

  @IsOptional()
  initialLocation?: LocationDto;
}
