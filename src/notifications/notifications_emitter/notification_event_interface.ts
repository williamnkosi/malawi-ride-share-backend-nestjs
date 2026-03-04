import { TripEntity } from 'src/trip/entities/trip.entity';
import { NotificationEventEmitters } from '../models/notification_event_emitters_types';
import { DriverLocationDto } from 'src/location_tracking/location_tracking.dto';
import { NearbyDriverResult } from 'src/location_tracking/location_tracking.service';

export interface TripNotificationEvents {
  [NotificationEventEmitters.TRIP_REQUESTED]: {
    trip: TripEntity;
    drivers: NearbyDriverResult[];
  };
  [NotificationEventEmitters.TRIP_ACCEPTED]: {
    trip: TripEntity;
    driverId: string;
    estimatedArrival: number;
  };
  [NotificationEventEmitters.TRIP_STARTED]: {
    trip: TripEntity;
    driverId: string;
    startLocation: { latitude: number; longitude: number };
  };
  [NotificationEventEmitters.TRIP_COMPLETED]: {
    trip: TripEntity;
    driverId: string;
    endLocation: { latitude: number; longitude: number };
  };
  [NotificationEventEmitters.TRIP_CANCELLED]: {
    trip: TripEntity;
    cancelledBy: string;
    reason: string;
  };
  [NotificationEventEmitters.DRIVER_FOUND]: {
    trip: TripEntity;
    drivers: DriverLocationDto[];
  };
  [NotificationEventEmitters.DRIVER_NOT_FOUND]: {
    trip: TripEntity;
    searchRadius: number;
  };
}
