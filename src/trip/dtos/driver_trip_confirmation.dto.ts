import { RouteResponseDto } from '../../google_maps_service/dtos/route-response.dto';

export class LocationDto {
  latitude!: number;
  longitude!: number;
  address!: string;
}

export class RiderInfoDto {
  firstName!: string;
  lastName!: string;
}

export class DriverTripConfirmationDto {
  tripId!: string;
  status!: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  routeToPickup!: RouteResponseDto;
  pickup!: LocationDto;
  destination!: LocationDto;
  rider!: RiderInfoDto;
  passengerCount!: number;
  notes?: string;
  acceptedAt!: string; // ISO date string
  estimatedPickupTime!: string; // ISO date string
}
