import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum DriverStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  ON_TRIP = 'on_trip',
}

export class LocationDto {
  @IsNumber({}, { message: 'Latitude must be a number' })
  @Min(-90, { message: 'Latitude must be >= -90' })
  @Max(90, { message: 'Latitude must be <= 90' })
  latitude: number;

  @IsNumber({}, { message: 'Longitude must be a number' })
  @Min(-180, { message: 'Longitude must be >= -180' })
  @Max(180, { message: 'Longitude must be <= 180' })
  longitude: number;
}

export class DriverLocationDto {
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  location?: LocationDto;
}

export class UpdateDriverLocationDto {
  location: LocationDto;

  @IsEnum(DriverStatus, {
    message: 'Status must be one of: online, offline, busy, on_trip',
  })
  @IsNotEmpty()
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
  @IsOptional()
  initialLocation?: LocationDto;
}
