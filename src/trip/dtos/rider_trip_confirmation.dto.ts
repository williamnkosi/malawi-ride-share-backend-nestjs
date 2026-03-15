export class DriverInfoDto {
  id: string;
  // Add driver details here when available (name, rating, vehicle, etc.)
}

export class LocationDto {
  latitude: number;
  longitude: number;
}

export class EstimatedArrivalDto {
  minutes: number;
  time: string; // ISO date string
}

export class DriverRouteDto {
  polyline: string;
  distanceKm: number;
  durationMin: number;
}

export class RiderTripConfirmationDto {
  tripId: string;
  status: 'DRIVER_ASSIGNED' | 'DRIVER_CANCELLED' | 'TRIP_CANCELLED';
  driver: DriverInfoDto;
  driverLocation: LocationDto;
  estimatedArrival: EstimatedArrivalDto;
  driverRoute: DriverRouteDto;
  acceptedAt: string; // ISO date string
  message: string;
}
