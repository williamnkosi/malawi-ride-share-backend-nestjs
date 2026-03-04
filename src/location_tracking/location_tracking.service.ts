import { Injectable, Logger } from '@nestjs/common';
import {
  DriverLocationDto,
  DriverStatus,
  UpdateDriverLocationDto,
} from './location_tracking.dto';
import { UsersService } from '../users/users.service';
import { Server } from 'socket.io';
import { UserLocationDto } from '../common/dto/location/user_location.dto';
import { AuthenticatedSocket } from '../common/guards/firebase_auth_guard_types';

export interface NearbyDriverResult {
  userId: string;
  location: UserLocationDto;
  status: DriverStatus;
  distance: number; // km
}

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);
  private server: Server;

  // In-memory store for real-time tracking
  private onlineDrivers = new Map<string, DriverLocationDto>(); // userId -> location
  private driverSockets = new Map<string, string>(); // userId -> socketId
  private socketDrivers = new Map<string, string>(); // socketId -> userId

  constructor(private readonly userService: UsersService) {}

  /**
   * Setup driver connection and assign appropriate rooms
   */
  handleDriverConnection(client: AuthenticatedSocket): void {
    this.logger.log(`Setting up driver ${client.userId} for location tracking`);

    // Register socket mapping for tracking
    this.driverSockets.set(client.userId, client.id);
    this.socketDrivers.set(client.id, client.userId);

    this.logger.log(
      `Driver ${client.userId} registered and ready for location tracking`,
    );
  }

  async updateDriverLocation(
    client: AuthenticatedSocket,
    updateDto: UpdateDriverLocationDto,
  ): Promise<void> {
    const { location, status } = updateDto;
    const driverUserEntity = await this.userService.findById(client.userId);

    // ✅ Check if driver is already registered, if not register them
    if (!this.onlineDrivers.has(client.userId)) {
      this.logger.log(
        `Auto-registering driver ${driverUserEntity.id} during location update`,
      );

      // Register driver mappings
      this.driverSockets.set(client.userId, client.id);
      this.socketDrivers.set(client.id, driverUserEntity.id);
    }

    const updatedLocation: DriverLocationDto = {
      status,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    this.onlineDrivers.set(driverUserEntity.id, updatedLocation);

    this.logger.debug(
      `Driver ${driverUserEntity.id} location updated to (${location.latitude}, ${location.longitude}) with status ${status}`,
    );
  }

  updateDriverStatus(userId: string, status: DriverStatus): DriverStatus {
    const driver = this.onlineDrivers.get(userId);
    if (!driver) {
      this.logger.warn(`Cannot update status for driver ${userId}: not found`);
      throw new Error('Driver not found');
    }

    driver.status = status;
    this.logger.log(`Driver ${userId} status updated to ${status}`);

    return status;
  }

  getDriverLocation(driverId: string): DriverLocationDto | null {
    return this.onlineDrivers.get(driverId) || null;
  }

  getAllOnlineDrivers(): DriverLocationDto[] {
    const onlineDrivers = Array.from(this.onlineDrivers.values()).filter(
      (driver) => {
        // Normalize the status comparison to handle string values
        const normalizedStatus =
          typeof driver.status === 'string'
            ? driver.status.toLowerCase()
            : driver.status;
        return (
          normalizedStatus === 'online' || driver.status === DriverStatus.ONLINE
        );
      },
    );

    this.logger.log(`Filtered online drivers: ${onlineDrivers.length}`);
    return onlineDrivers;
  }

  isDriverOnline(firebaseId: string): boolean {
    const driver = this.onlineDrivers.get(firebaseId);
    return driver ? driver.status === DriverStatus.ONLINE : false;
  }

  unregisterDriver(userId: string): void {
    const driverId = this.socketDrivers.get(userId);
    if (!driverId) return;

    this.logger.log(`Unregistering driver ${driverId} from tracking`);

    // Mark as offline before removing
    const driver = this.onlineDrivers.get(driverId);
    if (driver) {
      driver.status = DriverStatus.OFFLINE; // ← Using enum
    }

    this.onlineDrivers.delete(driverId);
    this.driverSockets.delete(driverId);
    this.socketDrivers.delete(driverId);
  }

  /**
   * Find nearby available drivers for a pickup location
   * @param pickupLocation - The pickup location to search around
   * @returns Array of nearby drivers sorted by distance
   */
  findNearbyDrivers(
    pickupLocation: UserLocationDto,
    radius: number = 20,
  ): NearbyDriverResult[] {
    this.logger.log(
      `Finding nearby drivers for pickup location: ${pickupLocation.latitude}, ${pickupLocation.longitude}`,
    );

    const nearbyDrivers: NearbyDriverResult[] = [];

    this.logger.log(`number of online drivers: ${this.onlineDrivers.size}`);

    // Get all online drivers
    for (const [userId, driverData] of this.onlineDrivers.entries()) {
      if (driverData.status !== DriverStatus.ONLINE) {
        continue;
      }

      // Skip if no location data
      if (!driverData.location) {
        continue;
      }

      // Calculate distance
      const distance = this.calculateDistance(
        pickupLocation,
        driverData.location,
      );
      if (distance <= radius) {
        nearbyDrivers.push({
          userId,
          location: driverData.location,
          status: driverData.status,
          distance,
        });
      }
    }

    // Sort by distance (closest first)
    nearbyDrivers.sort((a, b) => a.distance - b.distance);

    this.logger.log(`Found ${nearbyDrivers.length} nearby drivers`);
    return nearbyDrivers;
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param point1 - First location
   * @param point2 - Second location
   * @returns Distance in kilometers
   */
  private calculateDistance(
    point1: UserLocationDto,
    point2: UserLocationDto,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(point2.latitude - point1.latitude);
    const dLon = this.degToRad(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(point1.latitude)) *
        Math.cos(this.degToRad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   * @param deg - Degrees
   * @returns Radians
   */
  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
