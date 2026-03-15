import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Server } from 'socket.io';

import { GoogleMapsService } from '../../../google_maps_service/google_maps_service.service';
import { DriverLocationDto } from '../../../location_tracking/location_tracking.dto';
import { TripEntity } from '../../entities/trip.entity';
import { RouteResponseDto } from 'src/google_maps_service/dtos/route-response.dto';
import { DriverTripRequestDto } from 'src/trip/dtos/driver-trip-request.dto';
import { TripConfirmationBuilder } from '../../builders/trip-confirmation.builder';
import { TripGateway } from '../../trip.gateway';

@Injectable()
export class TripCommunicationService {
  private readonly confirmationBuilder: TripConfirmationBuilder;

  constructor(
    @Inject(forwardRef(() => TripGateway))
    private readonly tripGateway: TripGateway,
    private readonly googleMapsService: GoogleMapsService,
  ) {
    this.confirmationBuilder = new TripConfirmationBuilder(googleMapsService);
  }

  private get server(): Server {
    return this.tripGateway.server;
  }
  async notifyUsersOfTripAccepted(
    trip: TripEntity,
    currentDriverLocation: DriverLocationDto,
  ): Promise<void> {
    const driverId = trip.driverId;
    const riderId = trip.riderId;

    // Calculate route from driver to pickup
    const routeToPickup = await this.googleMapsService.calculateRoute(
      `${currentDriverLocation.location?.latitude},${currentDriverLocation.location?.longitude}`,
      `${trip.pickupLatitude},${trip.pickupLongitude}`,
    );

    // Build confirmation DTOs
    const confirmationDto =
      this.confirmationBuilder.buildDriverTripConfirmationDto(
        trip,
        routeToPickup,
      );

    // Notify driver with confirmation and navigation
    this.server
      .to(`driver:${driverId}`)
      .emit('trip:accepted_confirmation', confirmationDto);

    // Notify rider that driver was found
    const riderConfirmationDto =
      this.confirmationBuilder.buildRiderTripConfirmationDto(
        trip,
        driverId!,
        routeToPickup,
      );

    this.server
      .to(`rider:${riderId}`)
      .emit('trip:driver_found', riderConfirmationDto);
  }

  /**
   * Notify both parties when trip starts to destination
   */
  async notifyTripStarted(
    server: Server,
    trip: TripEntity,
    currentDriverLocation: DriverLocationDto,
  ): Promise<void> {
    const driverId = trip.driverId;
    const riderId = trip.riderId;

    // Calculate route from current location to destination
    const routeToDestination = await this.googleMapsService.calculateRoute(
      `${currentDriverLocation.location?.latitude},${currentDriverLocation.location?.longitude}`,
      `${trip.dropoffLatitude},${trip.dropoffLongitude}`,
    );

    const startedAt = new Date().toISOString();
    const estimatedArrivalTime = new Date(
      Date.now() + routeToDestination.durationMin * 60000,
    ).toISOString();

    // Emit to driver with navigation route
    server.to(`driver:${driverId}`).emit('trip:started', {
      tripId: trip.id,
      status: 'IN_PROGRESS',
      startedAt,
      routeToDestination: {
        polyline: routeToDestination.polyline,
        distanceKm: routeToDestination.distanceKm,
        durationMin: routeToDestination.durationMin,
      },
      destination: {
        latitude: trip.dropoffLatitude,
        longitude: trip.dropoffLongitude,
        address: trip.dropoffAddress,
      },
      estimatedArrival: {
        minutes: Math.ceil(routeToDestination.durationMin),
        time: estimatedArrivalTime,
      },
      message: 'Trip started! Navigate to destination.',
    });

    // Emit to rider with ETA
    server.to(`rider:${riderId}`).emit('trip:started', {
      tripId: trip.id,
      status: 'IN_PROGRESS',
      startedAt,
      destination: {
        latitude: trip.dropoffLatitude,
        longitude: trip.dropoffLongitude,
        address: trip.dropoffAddress,
      },
      route: {
        polyline: routeToDestination.polyline,
        distanceKm: routeToDestination.distanceKm,
        durationMin: routeToDestination.durationMin,
      },
      estimatedArrival: {
        minutes: Math.ceil(routeToDestination.durationMin),
        time: estimatedArrivalTime,
      },
      message: `Trip started! Estimated arrival in ${Math.ceil(routeToDestination.durationMin)} minutes.`,
    });
  }

  /**
   * Notify both parties when trip is completed
   */
  notifyTripCompleted(server: Server, trip: TripEntity): void {
    const driverId = trip.driverId;
    const riderId = trip.riderId;
    const completedAt = new Date().toISOString();

    // Emit to driver
    server.to(`driver:${driverId}`).emit('trip:completed', {
      tripId: trip.id,
      status: 'COMPLETED',
      completedAt,
      destination: {
        latitude: trip.dropoffLatitude,
        longitude: trip.dropoffLongitude,
        address: trip.dropoffAddress,
      },
      message: 'Trip completed successfully!',
    });

    // Emit to rider
    server.to(`rider:${riderId}`).emit('trip:completed', {
      tripId: trip.id,
      status: 'COMPLETED',
      completedAt,
      destination: {
        latitude: trip.dropoffLatitude,
        longitude: trip.dropoffLongitude,
        address: trip.dropoffAddress,
      },
      message: 'You have arrived at your destination!',
    });
  }

  driverNotifyTripRequested({
    tripId,
    driverId,
    timeoutMs,
    route,
    trip,
  }: {
    tripId: string;
    driverId: string;
    timeoutMs: number;
    route: RouteResponseDto;
    trip: TripEntity;
  }): void {
    this.server.to(`driver:${driverId}`).emit('trip:request', {
      id: tripId,
      timeoutSeconds: timeoutMs / 1000,
      data: this.toTripResponse(trip, route),
      // ... trip details
    });
  }
  driverNotifyTimeout({
    tripId,
    driverId,
  }: {
    tripId: string;
    driverId: string;
  }): void {
    this.server.to(`driver:${driverId}`).emit('trip:timeout', {
      tripId: tripId,
      data: {
        message: 'Trip request expired. You did not respond in time.',
      },
    });
  }
  driverNotifyTripCancelled({
    tripId,
    driverId,
  }: {
    tripId: string;
    driverId: string;
  }): void {
    this.server.to(`driver:${driverId}`).emit('trip:cancelled', {
      tripId,
      message: 'Rider cancelled the trip request.',
    });
  }

  private toTripResponse(
    trip: TripEntity,
    route: RouteResponseDto,
  ): DriverTripRequestDto {
    const dto = new DriverTripRequestDto();
    dto.tripId = trip.id;
    dto.status = trip.status;
    dto.pickupLocation = {
      latitude: trip.pickupLatitude,
      longitude: trip.pickupLongitude,
      address: trip.pickupAddress ?? '',
    };
    dto.dropoffLocation = {
      latitude: trip.dropoffLatitude,
      longitude: trip.dropoffLongitude,
      address: trip.dropoffAddress ?? '',
    };
    dto.riderFirstName = trip.rider.firstName;
    dto.riderLastName = trip.rider.lastName;
    dto.passengerCount = trip.passengerCount;
    dto.createdAt = trip.createdAt;
    dto.route = route;
    return dto;
  }
}
