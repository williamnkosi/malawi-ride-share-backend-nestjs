import {
  IsNumber,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

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
  driverId: string;

  @IsString()
  firebaseId: string;

  @IsBoolean()
  isAvailable: boolean;

  @IsString()
  status: 'online' | 'offline' | 'busy' | 'on_trip';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  lastUpdate: Date;
}

export class UpdateDriverLocationDto {
  @IsString()
  driverId: string;

  @IsString()
  firebaseId: string;

  location: LocationDto;

  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsString()
  status?: 'online' | 'offline' | 'busy' | 'on_trip';

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsOptional()
  @IsNumber()
  speed?: number;
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
