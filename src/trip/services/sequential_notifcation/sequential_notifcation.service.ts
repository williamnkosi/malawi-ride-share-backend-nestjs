import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { RouteResponseDto } from 'src/google_maps_service/dtos/route-response.dto';
import { GoogleMapsService } from 'src/google_maps_service/google_maps_service.service';
import { NearbyDriverResult } from 'src/location_tracking/location_tracking.service';

import { TripEntity } from 'src/trip/entities/trip.entity';
import { TripGateway } from 'src/trip/trip.gateway';

const TIMEOUT_MS = 15000; // 15 seconds
@Injectable()
export class SequentialNotifcationService {
  private readonly logger = new Logger(SequentialNotifcationService.name);
  private pendingResponses = new Map<
    string,
    {
      resolve: (driverId: string | null) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  >();
  constructor(
    @Inject(forwardRef(() => TripGateway))
    private readonly tripGateway: TripGateway,
    //private readonly logger: Logger,
    private readonly googleMapsService: GoogleMapsService,
  ) {}
  async sendNotificationsInSequence(
    trip: TripEntity,
    drivers: NearbyDriverResult[],
  ) {
    const route = await this.googleMapsService.calculateRoute(
      `${trip.pickupLatitude},${trip.pickupLongitude}`,
      `${trip.dropoffLatitude},${trip.dropoffLongitude}`,
    );
    for (const driver of drivers) {
      this.logger.log(
        `Notifying driver ${driver.userId} about trip request ${trip.id}`,
      );

      const driverResponse = await this.waitForDriverResponse(
        trip,
        driver.userId,
        TIMEOUT_MS,
        route,
      );

      if (driverResponse === 'accepted') {
        this.logger.log(`Driver ${driver.userId} accepted trip ${trip.id}`);
        return driver.userId; // ✅ Driver accepted, stop loop
      }

      if (driverResponse === 'rejected') {
        this.logger.log(`Driver ${driver.userId} rejected trip ${trip.id}`);
        // Continue to next driver
      }

      if (driverResponse === 'timeout') {
        this.logger.warn(
          `Driver ${driver.userId} timed out for trip ${trip.id}`,
        );
        // Continue to next driver
      }
    }
  }

  private waitForDriverResponse(
    trip: TripEntity,
    driverId: string,
    timeoutMs: number,
    route: RouteResponseDto,
  ): Promise<'accepted' | 'rejected' | 'timeout'> {
    return new Promise((resolve) => {
      const key = `${trip.id}:${driverId}`;

      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(key);
        resolve('timeout');
      }, timeoutMs);

      // Store the resolver
      this.pendingResponses.set(key, {
        resolve: (response: 'accepted' | 'rejected') => {
          clearTimeout(timeout);
          this.pendingResponses.delete(key);
          resolve(response);
        },
        timeout,
        reject: function (error: Error): void {
          throw new Error('Function not implemented.');
        },
      });

      // Send WebSocket message to driver
      this.tripGateway.server.to(`driver:${driverId}`).emit('trip:request', {
        id: trip.id,
        timeoutSeconds: timeoutMs / 1000,
        data: toTripResponse(trip, route),
        // ... trip details
      });
    });
  }

  // Called from TripGateway when driver responds
  handleDriverAccept(tripId: string, driverId: string): void {
    const key = `${tripId}:${driverId}`;
    const pending = this.pendingResponses.get(key);

    if (pending) {
      pending.resolve('accepted');
    }
  }

  handleDriverReject(tripId: string, driverId: string): void {
    const key = `${tripId}:${driverId}`;
    const pending = this.pendingResponses.get(key);

    if (pending) {
      pending.resolve('rejected');
    }
  }
}

function toTripResponse(trip: TripEntity, route: RouteResponseDto) {
  return {
    tripId: trip.id,
    status: trip.status,
    pickupLocation: {
      latitude: trip.pickupLatitude,
      longitude: trip.pickupLongitude,
      address: trip.pickupAddress ?? '',
    },
    dropoffLocation: {
      latitude: trip.dropoffLatitude,
      longitude: trip.dropoffLongitude,
      address: trip.dropoffAddress ?? '',
    },
    riderFirstName: trip.rider.firstName,
    riderLastName: trip.rider.lastName,
    passengerCount: trip.passengerCount,
    createdAt: trip.createdAt,
    route,
  };
}
