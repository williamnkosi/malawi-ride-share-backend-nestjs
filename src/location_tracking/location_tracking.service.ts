import { Injectable, Logger } from '@nestjs/common';
import {
  DriverConnectionDto,
  DriverLocationDto,
  DriverStatus,
  UpdateDriverLocationDto,
} from './location_tracking.dto';
import { UsersService } from 'src/users/users.service';
import { AuthenticatedSocket } from 'src/common/guards/firebase_auth_guard_types';
import { UserLocationDto } from 'src/common/dto/location/user_location.dto';

export interface NearbyDriverResult {
  userId: string;
  location: UserLocationDto;
  status: DriverStatus;
  distance: number; // km
}

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);

  // In-memory store for real-time tracking
  private onlineDrivers = new Map<string, DriverLocationDto>(); // userId -> location
  private driverSockets = new Map<string, string>(); // userId -> socketId
  private socketDrivers = new Map<string, string>(); // socketId -> userId

  constructor(private readonly userService: UsersService) {}

  async registerDriver(
    client: AuthenticatedSocket,
    driverConnectionDto: DriverConnectionDto,
  ): Promise<void> {
    const { initialLocation } = driverConnectionDto;
    this.logger.log(
      `Registering driver ${client.firebaseId} for real-time tracking`,
    );
    const driverUserEntity = await this.userService.findByFirebaseId(
      client.firebaseId,
    );

    this.driverSockets.set(driverUserEntity.id, client.id);
    this.socketDrivers.set(client.id, driverUserEntity.id);

    if (initialLocation) {
      const driverInfo: DriverLocationDto = {
        location: initialLocation,
        status: DriverStatus.ONLINE,
      };

      this.onlineDrivers.set(driverUserEntity.id, driverInfo);
    }
  }

  async updateDriverLocation(
    firebaseId: string,
    updateDto: UpdateDriverLocationDto,
  ): Promise<DriverLocationDto> {
    const { location, status } = updateDto;
    const driverUserEntity =
      await this.userService.findByFirebaseId(firebaseId);

    const updatedLocation: DriverLocationDto = {
      status,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    this.onlineDrivers.set(driverUserEntity.id, updatedLocation);

    this.logger.debug(
      `Updated location for driver ${driverUserEntity.id} (memory only) latitude: ${updatedLocation.location?.latitude}, longitude: ${updatedLocation.location?.longitude}`,
    );
    return updatedLocation;
  }

  updateDriverStatus(firebaseId: string, status: DriverStatus): void {
    const driver = this.onlineDrivers.get(firebaseId);
    if (driver) {
      driver.status = status; // ← Type-safe enum usage
    }
  }

  getDriverLocation(firebaseId: string): DriverLocationDto | null {
    return this.onlineDrivers.get(firebaseId) || null;
  }

  getAllOnlineDrivers(): DriverLocationDto[] {
    this.logger.log('Retrieving all online drivers');
    this.logger.log(this.onlineDrivers);
    return Array.from(this.onlineDrivers.values()).filter(
      (driver) => driver.status === DriverStatus.ONLINE,
    );
  }

  isDriverOnline(firebaseId: string): boolean {
    const driver = this.onlineDrivers.get(firebaseId);
    return driver ? driver.status === DriverStatus.ONLINE : false;
  }

  unregisterDriver(socketId: string): void {
    const driverId = this.socketDrivers.get(socketId);
    if (!driverId) return;

    this.logger.log(`Unregistering driver ${driverId} from tracking`);

    // Mark as offline before removing
    const driver = this.onlineDrivers.get(driverId);
    if (driver) {
      driver.status = DriverStatus.OFFLINE; // ← Using enum
    }

    this.onlineDrivers.delete(driverId);
    this.driverSockets.delete(driverId);
    this.socketDrivers.delete(socketId);
  }

  /**
   * Find nearby available drivers for a pickup location
   * @param pickupLocation - The pickup location to search around
   * @returns Array of nearby drivers sorted by distance
   */
  findNearbyDrivers(
    pickupLocation: UserLocationDto,
    radius: number = 2,
  ): NearbyDriverResult[] {
    this.logger.log(
      `Finding nearby drivers for pickup location: ${pickupLocation.latitude}, ${pickupLocation.longitude}`,
    );

    const nearbyDrivers: NearbyDriverResult[] = [];

    // Get all online drivers
    for (const [userId, driverData] of this.onlineDrivers.entries()) {
      // Skip if driver not available
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
