import { Injectable } from '@nestjs/common';
import { Server } from 'http';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driverlLocationDto';
import { RiderLocationDto } from 'src/common/dto/location/riderLocationDto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@Injectable()
export class TrackingService {
  server: Server;

  private riderLocations: Record<string, RiderLocationDto> = {};
  private driverLocations: Record<string, DriverLocationDto> = {};

  constructor() {
    setInterval(() => this.removeStaleEntries(), 30 * 1000);
  }

  handleUpdateRiderLocation(data: RiderLocationDto) {
    try {
      this.riderLocations[data.userId] = data;
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
      this.driverLocations[data.userId] = data;
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
