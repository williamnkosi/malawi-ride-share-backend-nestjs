import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

import { GoogleMapsService } from 'src/google_maps_service/google_maps_service.service';
import { DriverLocationDto } from 'src/location_tracking/location_tracking.dto';
import { TripEntity } from 'src/trip/entities/trip.entity';

@Injectable()
export class TripCommunicationService {
  constructor(private readonly googleMapsService: GoogleMapsService) {}
  async notifyUsersOfTripAccepted(
    server: Server,
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

    // Notify driver with confirmation and navigation
    server.to(`driver:${driverId}`).emit('trip:accepted_confirmation', {
      tripId: trip.id,
      status: 'ACCEPTED',
      routeToPickup,
      pickup: {
        latitude: trip.pickupLatitude,
        longitude: trip.pickupLongitude,
        address: trip.pickupAddress,
      },
      destination: {
        latitude: trip.dropoffLatitude,
        longitude: trip.dropoffLongitude,
        address: trip.dropoffAddress,
      },
      rider: {
        firstName: trip.rider?.firstName,
        lastName: trip.rider?.lastName,
      },
      passengerCount: trip.passengerCount,
      notes: trip.notes,
      acceptedAt: new Date().toISOString(),
      estimatedPickupTime: new Date(
        Date.now() + routeToPickup.durationMin * 60000,
      ).toISOString(),
    });

    // Notify rider that driver was found
    server.to(`rider:${riderId}`).emit('trip:driver_found', {
      tripId: trip.id,
      status: 'DRIVER_ASSIGNED',
      driver: {
        id: driverId,
        // Add driver details here when available
      },
      driverLocation: {
        latitude: currentDriverLocation.location?.latitude,
        longitude: currentDriverLocation.location?.longitude,
      },
      estimatedArrival: {
        minutes: Math.ceil(routeToPickup.durationMin),
        time: new Date(
          Date.now() + routeToPickup.durationMin * 60000,
        ).toISOString(),
      },
      driverRoute: {
        polyline: routeToPickup.polyline,
        distanceKm: routeToPickup.distanceKm,
        durationMin: routeToPickup.durationMin,
      },
      acceptedAt: new Date().toISOString(),
      message: `Your driver is on the way! They will arrive in about ${Math.ceil(routeToPickup.durationMin)} minutes.`,
    });
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
}
