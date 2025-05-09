import { Injectable } from '@nestjs/common';
import { Server } from 'http';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driver_location.dto';
import { RiderLocationDto } from 'src/common/dto/rider/rider_location.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@Injectable()
export class TrackingService {
  server: Server;

  private riderLocations: Record<string, RiderLocationDto> = {};
  private driverLocations: Record<string, DriverLocationDto> = {};
  private readonly TIMEOUT_MS = 1 * 60 * 1000; // 1 minutes

  handleUpdateRiderLocation(data: RiderLocationDto) {
    try {
      this.riderLocations[data.firebaseId] = data;
    } catch {
      throw new CustomError('Error sending recieving rider location', 500);
    }
  }

  handleGetRiderLocation(userId: string): RiderLocationDto | null {
    try {
      return this.riderLocations[userId] || null;
    } catch {
      throw new CustomError('Error getting rider location', 500);
    }
  }

  handleUpdateDriverLocation(data: DriverLocationDto) {
    try {
      this.driverLocations[data.firebaseId] = data;
    } catch {
      throw new CustomError('Error sending recieving driver location', 500);
    }
  }

  handleGetDriverLocation(userId: string): DriverLocationDto | null {
    try {
      return this.driverLocations[userId] || null;
    } catch {
      throw new CustomError('Error getting driver location', 500);
    }
  }
}
