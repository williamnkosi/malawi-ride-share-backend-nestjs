import { Injectable, Logger } from '@nestjs/common';
import {
  DriverLocationDto,
  DriverStatus,
  LocationDto,
} from './location_tracking.dto';

@Injectable()
export class LocationTrackingService {
  private readonly logger = new Logger(LocationTrackingService.name);

  // In-memory store for real-time tracking
  private onlineDrivers = new Map<string, DriverLocationDto>(); // driverId -> location
  private driverSockets = new Map<string, string>(); // driverId -> socketId
  private socketDrivers = new Map<string, string>(); // socketId -> driverId

  /**
   * Find nearby available drivers
   */
  findNearbyDrivers(
    riderLocation: LocationDto,
    radiusKm: number = 5,
  ): DriverLocationDto[] {
    this.logger.log(`Finding drivers within ${radiusKm}km of rider location`);

    const availableDrivers = Array.from(this.onlineDrivers.values()).filter(
      (driver) => driver.status === DriverStatus.ONLINE,
    );

    // Pair each driver with its distance, but keep the original object for return
    const driversWithDistance = availableDrivers
      .map((driverLocation) => ({
        driver: driverLocation,
        distance: this.calculateDistance(riderLocation, driverLocation),
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
