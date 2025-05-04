// location.dto.ts
import { IsString, IsNumber } from 'class-validator';

export class LocationDto {
  @IsString()
  userId: string; // Unique ID for the user (driver, rider, etc.)

  @IsString()
  userType: string; // User type, e.g., 'driver', 'rider'

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  timestamp: number; // Optional: Track when the data was last updated
}
