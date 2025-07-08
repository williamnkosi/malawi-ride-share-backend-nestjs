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

export class DriverLocationDto extends LocationDto {
  @IsString()
  firebaseId: string;

  @IsEnum(DriverStatus)
  status: DriverStatus;
}

export class UpdateDriverLocationDto extends LocationDto {
  @IsString()
  driverId: string;

  @IsString()
  firebaseId: string;

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
  driverId: string;

  @IsString()
  firebaseId: string;

  @IsOptional()
  initialLocation?: LocationDto;
}
