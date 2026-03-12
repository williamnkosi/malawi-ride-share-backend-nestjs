import { Injectable, Logger } from '@nestjs/common';
import { RouteResponseDto } from '../../../google_maps_service/dtos/route-response.dto';
import { GoogleMapsService } from '../../../google_maps_service/google_maps_service.service';
import { NearbyDriverResult } from '../../../location_tracking/location_tracking.service';

import { TripEntity } from '../../entities/trip.entity';
import { TripCommunicationService } from '../trip_communication/trip_communication.service';

const TIMEOUT_MS = 15000; // 15 seconds

interface TripNotificationState {
  currentDriverId: string;
  notifiedDrivers: string[]; // Drivers already notified (declined/timeout)
  startedAt: Date;
}

@Injectable()
export class DriverMatchingService {
  private readonly logger = new Logger(DriverMatchingService.name);

  // Track which driver is currently being notified for each trip
  private activeNotifications = new Map<string, TripNotificationState>();

  private pendingResponses = new Map<
    string,
    {
      resolve: (driverId: string | null) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  constructor(
    private readonly tripCommunicationService: TripCommunicationService,
    private readonly googleMapsService: GoogleMapsService,
  ) {}
  async searchForAvailableDriver(
    trip: TripEntity,
    drivers: NearbyDriverResult[],
  ) {
    const route = await this.googleMapsService.calculateRoute(
      `${trip.pickupLatitude},${trip.pickupLongitude}`,
      `${trip.dropoffLatitude},${trip.dropoffLongitude}`,
    );

    // Initialize tracking for this trip
    this.activeNotifications.set(trip.id, {
      currentDriverId: '',
      notifiedDrivers: [],
      startedAt: new Date(),
    });

    try {
      for (let i = 0; i < drivers.length; i++) {
        const driver = drivers[i];

        // Update current driver being notified
        const state = this.activeNotifications.get(trip.id)!;
        state.currentDriverId = driver.userId;

        this.logger.log(
          `Notifying driver ${driver.userId} about trip request ${trip.id} (${i + 1}/${drivers.length})`,
        );

        const driverResponse = await this.waitForDriverResponse(
          trip,
          driver.userId,
          TIMEOUT_MS,
          route,
        );

        if (driverResponse === 'trip:accept') {
          this.logger.log(`Driver ${driver.userId} accepted trip ${trip.id}`);
          this.activeNotifications.delete(trip.id);
          return driver.userId; // ✅ Driver accepted, stop loop
        }

        // Track this driver as notified (declined or timeout)
        state.notifiedDrivers.push(driver.userId);
      }

      // All drivers exhausted, no one accepted
      this.logger.warn(`No driver accepted trip ${trip.id}`);
      this.activeNotifications.delete(trip.id);
      return null;
    } catch (error) {
      this.activeNotifications.delete(trip.id);
      throw error;
    }
  }

  private waitForDriverResponse(
    trip: TripEntity,
    driverId: string,
    timeoutMs: number,
    route: RouteResponseDto,
  ): Promise<'trip:accept' | 'trip:declined' | 'trip:timeout'> {
    return new Promise((resolve) => {
      const key = `${trip.id}:${driverId}`;

      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(key);

        // Notify the driver that they timed out
        this.tripCommunicationService.driverNotifyTimeout({
          tripId: trip.id,
          driverId,
        });

        resolve('trip:timeout');
      }, timeoutMs);

      // Store the resolver
      this.pendingResponses.set(key, {
        resolve: (response: 'trip:accept' | 'trip:declined') => {
          clearTimeout(timeout);
          this.pendingResponses.delete(key);
          resolve(response);
        },
        timeout,
        reject: function (error: Error): void {
          console.log(error);
          throw new Error('Function not implemented.');
        },
      });

      // Send WebSocket message to driver
      this.tripCommunicationService.driverNotifyTripRequested({
        tripId: trip.id,
        driverId,
        timeoutMs,
        route,
        trip,
      });
    });
  }

  // Called from TripGateway when driver responds
  handleDriverAccept(tripId: string, driverId: string): boolean {
    const key = `${tripId}:${driverId}`;
    const pending = this.pendingResponses.get(key);

    if (pending) {
      pending.resolve('trip:accept');
      return true; // Valid acceptance - trip was waiting for this driver
    }

    return false; // Invalid - no pending request for this driver/trip
  }

  handleDriverReject(tripId: string, driverId: string): boolean {
    const key = `${tripId}:${driverId}`;
    const pending = this.pendingResponses.get(key);

    if (pending) {
      pending.resolve('trip:declined');
      return true; // Valid rejection - trip was waiting for this driver
    }

    return false; // Invalid - no pending request for this driver/trip
  }

  /**
   * Cancel the driver search for a trip (e.g., when rider cancels)
   */
  cancelDriverSearch(tripId: string): void {
    const state = this.activeNotifications.get(tripId);
    if (state?.currentDriverId) {
      // Clear the pending response for current driver
      const key = `${tripId}:${state.currentDriverId}`;
      const pending = this.pendingResponses.get(key);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingResponses.delete(key);
      }

      // Notify current driver that trip was cancelled
      this.tripCommunicationService.driverNotifyTripCancelled({
        tripId,
        driverId: state.currentDriverId,
      });
    }
    this.activeNotifications.delete(tripId);
    this.logger.log(`Driver search cancelled for trip ${tripId}`);
  }
}
