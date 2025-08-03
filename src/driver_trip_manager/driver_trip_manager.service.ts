import { Injectable, Logger } from '@nestjs/common';
import { LocationTrackingService } from 'src/location_tracking/location_tracking.service';
import { TripService } from 'src/trip/trip.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  DriverLocationDto,
  DriverStatus,
  LocationDto,
} from 'src/location_tracking/location_tracking.dto';
import { TripEntity } from 'src/trip/entities/trip_entity';

@Injectable()
export class DriverTripManagerService {
  private readonly logger = new Logger(DriverTripManagerService.name);
  constructor(
    private readonly locationTrackingService: LocationTrackingService,
    private readonly tripService: TripService, // ✅ Add TripService
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('trip.requested')
  handleDriverTripRequested(payload: { trip: TripEntity }) {
    try {
      // Implementation for handling driver trip requests
      this.logger.log(
        `Processing trip request for trip ID: ${payload.trip.id}`,
      );

      const availableDrivers =
        this.locationTrackingService.getAllOnlineDrivers();

      if (availableDrivers.length === 0) {
        this.logger.warn('No available drivers for trip request');
        return;
      }

      const nearbyDrivers = this.findNearbyDrivers(
        payload.trip,
        availableDrivers,
      );

      if (nearbyDrivers.length === 0) {
        this.logger.warn(`No nearby drivers found for trip ${payload.trip.id}`);

        // ✅ Emit event for no drivers found
        this.eventEmitter.emit('trip.no_drivers_found', {
          trip: payload.trip,
          searchRadius: 5,
          reason: 'no_drivers_in_range',
          availableDrivers: availableDrivers.length,
          timestamp: new Date(),
        });
        return;
      }

      this.logger.log(
        `Found ${nearbyDrivers.length} suitable drivers for trip ${payload.trip.id}`,
      );

      // ✅ Emit event with found drivers for DriverNotificationService
      this.eventEmitter.emit('trip.drivers_found', {
        trip: payload.trip,
        drivers: nearbyDrivers,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`Failed to handle trip request: ${errorMessage}`);
    }
  }

  /**
   * Find nearby available drivers
   */
  findNearbyDrivers(
    trip: TripEntity,
    onlineDrivers: DriverLocationDto[],
    radiusKm: number = 5,
  ): DriverLocationDto[] {
    this.logger.log(`Finding drivers within ${radiusKm}km of rider location`);

    const availableDrivers = Array.from(onlineDrivers.values()).filter(
      (driver) =>
        driver.status === DriverStatus.ONLINE && driver.location !== undefined,
    );

    if (availableDrivers === undefined || availableDrivers.length === 0) {
      this.logger.warn('No available drivers found');
      return [];
    }

    const pickupLocation: LocationDto = {
      latitude: trip.pickupLatitude,
      longitude: trip.pickupLongitude,
    };
    // Pair each driver with its distance, but keep the original object for return
    const driversWithDistance = availableDrivers
      .map((driverLocation) => ({
        driver: driverLocation,
        distance: this.calculateDistance(
          pickupLocation,
          driverLocation.location as LocationDto,
        ),
      }))
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 10 closest drivers

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
