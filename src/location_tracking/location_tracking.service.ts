import { Injectable, Logger } from '@nestjs/common';
import {
  DriverConnectionDto,
  DriverLocationDto,
  DriverStatus,
  LocationDto,
  UpdateDriverLocationDto,
} from './location_tracking.dto';

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);

  // In-memory store for real-time tracking
  private onlineDrivers = new Map<string, DriverLocationDto>(); // driverId -> location
  private driverSockets = new Map<string, string>(); // driverId -> socketId
  private socketDrivers = new Map<string, string>(); // socketId -> driverId

  registerDriver(
    socketId: string,
    driverConnectionDto: DriverConnectionDto,
  ): void {
    const { firebaseId, initialLocation } = driverConnectionDto;
    this.logger.log(`Registering driver ${firebaseId} for real-time tracking`);

    this.driverSockets.set(firebaseId, socketId);
    this.socketDrivers.set(socketId, firebaseId);

    if (initialLocation) {
      const driverInfo: DriverLocationDto = {
        firebaseId,
        location: initialLocation,
        status: DriverStatus.ONLINE,
      };

      this.onlineDrivers.set(firebaseId, driverInfo);
    }
  }

  /**
   * Find nearby available drivers
   */
  findNearbyDrivers(
    riderLocation: LocationDto,
    radiusKm: number = 5,
  ): DriverLocationDto[] {
    this.logger.log(`Finding drivers within ${radiusKm}km of rider location`);

    const availableDrivers = Array.from(this.onlineDrivers.values()).filter(
      (driver) =>
        driver.status === DriverStatus.ONLINE && driver.location !== undefined,
    );

    if (availableDrivers === undefined || availableDrivers.length === 0) {
      this.logger.warn('No available drivers found');
      return [];
    }
    // Pair each driver with its distance, but keep the original object for return
    const driversWithDistance = availableDrivers
      .map((driverLocation) => ({
        driver: driverLocation,
        distance: this.calculateDistance(
          riderLocation,
          driverLocation.location as LocationDto,
        ),
      }))
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10); // Top 10 closest drivers

    const nearbyDrivers: DriverLocationDto[] = driversWithDistance.map(
      (item) => item.driver,
    );

    this.logger.log(`Found ${nearbyDrivers.length} nearby drivers`);
    return nearbyDrivers;
  }

  updateDriverLocation(updateDto: UpdateDriverLocationDto): DriverLocationDto {
    const { firebaseId, location, status } = updateDto;

    const updatedLocation: DriverLocationDto = {
      firebaseId,
      status,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    this.onlineDrivers.set(firebaseId, updatedLocation);

    this.logger.debug(
      `Updated location for driver ${firebaseId} (memory only) latitude: ${updatedLocation.location?.latitude}, longitude: ${updatedLocation.location?.longitude}`,
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

  private calculateDistance(point1: LocationDto, point2: LocationDto): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.degreesToRadians(point2.latitude - point1.latitude);
    const dLon = this.degreesToRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(point1.latitude)) *
        Math.cos(this.degreesToRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
