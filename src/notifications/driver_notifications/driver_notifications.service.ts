import { Injectable, Logger } from '@nestjs/common';
import { LocationTrackingGateway } from 'src/location_tracking/location_tracking.gateway';
import { NotificationsService } from '../notifications.service';
import { OnEvent } from '@nestjs/event-emitter';
import { TripEntity } from 'src/trip/entities/trip_entity';
import {
  DriverLocationDto,
  LocationDto,
} from 'src/location_tracking/location_tracking.dto';
import { NotificationEventEmitters } from '../models/notification_event_emitters_types';
import {
  LocationTrackingService,
  NearbyDriverResult,
} from 'src/location_tracking/location_tracking.service';
import { TripGateway } from 'src/trip/trip.gateway';

@Injectable()
export class DriverNotificationsService {
  private readonly logger = new Logger(DriverNotificationsService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly locationTrackingService: LocationTrackingService,
    private readonly locationTrackingGateway: LocationTrackingGateway,
    private readonly tripGateway: TripGateway,
  ) {}
  // ✅ 1. NEW TRIP REQUESTS
  @OnEvent(NotificationEventEmitters.TRIP_REQUESTED)
  handleTripRequest(payload: { trip: TripEntity }) {
    try {
      // Notify drivers about the new trip request
      const location = {
        latitude: payload.trip.pickupLatitude,
        longitude: payload.trip.pickupLongitude,
      } as LocationDto;
      const nearbyDrivers: NearbyDriverResult[] =
        this.locationTrackingService.findNearbyDrivers(location);

      //TODO: Notify drivers about the trip request
      //   if (nearbyDrivers.length === 0) {
      //     this.logger.warn(
      //       `No drivers found near pickup location for trip ${payload.trip.id}`,
      //     );

      //     await this.tripGateway.notifyRiderNoDriversAvailable(
      //       payload.trip.id,
      //       payload.trip.riderId,
      //       15, // 15km search radius
      //     );
      //     return;
      //   }

      // ✅ Send notifications to each nearby driver
      for (const driver of nearbyDrivers) {
        // 🔥 Firebase Push Notification
        await this.notificationsService.sendNotification(driver.userId, {
          title: 'New Trip Request',
          body: `Trip request ${Math.round(driver.distance)}km away`,
          data: {
            type: 'trip_request',
            tripId: payload.trip.id,
            pickupAddress: payload.trip.pickupAddress,
            dropoffAddress: payload.trip.dropoffAddress,
            estimatedFare: payload.trip.estimatedFare?.toString(),
            distance: driver.distance.toString(),
          },
        });

        // 📡 WebSocket Notification
        await this.tripGateway.notifyDriverOfTripRequest(driver.userId, {
          tripId: payload.trip.id,
          pickupLocation: {
            address: payload.trip.pickupAddress,
            latitude: payload.trip.pickupLatitude,
            longitude: payload.trip.pickupLongitude,
          },
          dropoffLocation: {
            address: payload.trip.dropoffAddress,
            latitude: payload.trip.dropoffLatitude,
            longitude: payload.trip.dropoffLongitude,
          },
          estimatedFare: payload.trip.estimatedFare || 0,
          estimatedDistance: driver.distance,
          passengerCount: payload.trip.passengerCount,
          riderName: payload.rider.firstName || 'Rider',
          expiresAt: new Date(Date.now() + 60000), // 1 minute to respond
        });
      }
    } catch (error) {}
  }
}
