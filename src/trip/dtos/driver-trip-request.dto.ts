import { RouteResponseDto } from '../../google_maps_service/dtos/route-response.dto';

export class LocationDto {
  latitude!: number;
  longitude!: number;
  address!: string;
}

export class DriverTripRequestDto {
  tripId!: string;
  status!: string;
  pickupLocation: LocationDto = new LocationDto();
  dropoffLocation: LocationDto = new LocationDto();
  riderFirstName!: string;
  riderLastName!: string;
  passengerCount!: number;
  createdAt!: Date;
  route: RouteResponseDto = new RouteResponseDto();
}
