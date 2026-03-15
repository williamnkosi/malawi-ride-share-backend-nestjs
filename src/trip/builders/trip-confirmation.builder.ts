import { GoogleMapsService } from '../../google_maps_service/google_maps_service.service';
import { TripEntity } from '../entities/trip.entity';
import { RouteResponseDto } from '../../google_maps_service/dtos/route-response.dto';
import { DriverTripConfirmationDto } from '../dtos/driver_trip_confirmation.dto';
import { RiderTripConfirmationDto } from '../dtos/rider_trip_confirmation.dto';

export class TripConfirmationBuilder {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  buildDriverTripConfirmationDto(
    trip: TripEntity,
    routeToPickup: RouteResponseDto,
  ): DriverTripConfirmationDto {
    const now = new Date();
    const estimatedPickupTime = new Date(
      now.getTime() + routeToPickup.durationMin * 60000,
    );

    return {
      tripId: trip.id,
      status: 'ACCEPTED',
      routeToPickup,
      pickup: {
        latitude: trip.pickupLatitude,
        longitude: trip.pickupLongitude,
        address: trip.pickupAddress!,
      },
      destination: {
        latitude: trip.dropoffLatitude,
        longitude: trip.dropoffLongitude,
        address: trip.dropoffAddress!,
      },
      rider: {
        firstName: trip.rider?.firstName ?? '',
        lastName: trip.rider?.lastName ?? '',
      },
      passengerCount: trip.passengerCount,
      notes: trip.notes,
      acceptedAt: now.toISOString(),
      estimatedPickupTime: estimatedPickupTime.toISOString(),
    };
  }

  buildRiderTripConfirmationDto(
    trip: TripEntity,
    driverId: string,
    routeToPickup: RouteResponseDto,
  ): RiderTripConfirmationDto {
    const estimatedArrivalMinutes = Math.ceil(routeToPickup.durationMin);
    const now = new Date();
    const estimatedArrivalTime = new Date(
      now.getTime() + routeToPickup.durationMin * 60000,
    );

    return {
      tripId: trip.id,
      status: 'DRIVER_ASSIGNED',
      driver: {
        id: driverId,
      },
      driverLocation: {
        latitude: 0,
        longitude: 0,
      },
      estimatedArrival: {
        minutes: estimatedArrivalMinutes,
        time: estimatedArrivalTime.toISOString(),
      },
      driverRoute: {
        polyline: routeToPickup.polyline,
        distanceKm: routeToPickup.distanceKm,
        durationMin: routeToPickup.durationMin,
      },
      acceptedAt: now.toISOString(),
      message: `Your driver is on the way! They will arrive in about ${estimatedArrivalMinutes} minutes.`,
    };
  }
}
