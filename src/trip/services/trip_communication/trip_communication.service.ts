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
}

// function toRiderTripMessage(trip: TripEntity, route: any) {
//   return {
//     tripId: trip.id,
//     driverId: trip.driverId,
//     pickupLatitude: trip.pickupLatitude,
//     pickupLongitude: trip.pickupLongitude,
//     dropoffLatitude: trip.dropoffLatitude,
//     dropoffLongitude: trip.dropoffLongitude,
//     route: route,
//     // Add other necessary trip details
//   };
// }
