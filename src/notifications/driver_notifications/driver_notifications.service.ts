import { Injectable, Logger } from '@nestjs/common';
import { LocationTrackingGateway } from 'src/location_tracking/location_tracking.gateway';
import { NotificationsService } from '../notifications.service';
import { OnEvent } from '@nestjs/event-emitter';
import { TripEntity } from 'src/trip/entities/trip.entity';
import { LocationDto } from 'src/location_tracking/location_tracking.dto';
import { NotificationEventEmitters } from '../models/notification_event_emitters_types';
import {
  LocationTrackingService,
  NearbyDriverResult,
} from 'src/location_tracking/location_tracking.service';
import { TripGateway } from 'src/trip/trip.gateway';
import { TripRequestNotification } from './driver_trip_notification';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DriverNotificationsService {
  private readonly logger = new Logger(DriverNotificationsService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly locationTrackingService: LocationTrackingService,
    private readonly locationTrackingGateway: LocationTrackingGateway,
    private readonly tripGateway: TripGateway,
  ) {}
  // ✅ 1. NEW TRIP REQUESTS
  @OnEvent(NotificationEventEmitters.TRIP_REQUESTED)
  async handleTripRequest(payload: { trip: TripEntity }) {
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

      // Get rider details
      const rider = await this.userRepository.findOne({
        where: { id: payload.trip.riderId },
        select: ['firstName', 'lastName'],
      });

      // ✅ Send notifications to each nearby driver
      for (const driver of nearbyDrivers) {
        // 🔥 Firebase Push Notification
        this.logger.log(
          `Notifying driver ${driver.userId} about trip request ${payload.trip.id}`,
        );
        await this.notificationsService.sendNotificationWithData(
          driver.userId,
          {
            title: 'New Trip Request',
            body: `Trip request ${Math.round(driver.distance)}km away`,
          },
          {
            type: 'trip_request',
            tripId: payload.trip.id,
            pickupLatitude: payload.trip.pickupLatitude.toString(),
            pickupLongitude: payload.trip.pickupLongitude.toString(),
            dropoffLatitude: payload.trip.dropoffLatitude.toString(),
            dropoffLongitude: payload.trip.dropoffLongitude.toString(),
            distance: driver.distance.toString(),
          },
        );

        //📡 WebSocket Notification
        const tripRequest: TripRequestNotification = {
          tripId: payload.trip.id,
          pickupLocation: {
            latitude: payload.trip.pickupLatitude,
            longitude: payload.trip.pickupLongitude,
          },
          dropoffLocation: {
            latitude: payload.trip.dropoffLatitude,
            longitude: payload.trip.dropoffLongitude,
          },
          passengerCount: payload.trip.passengerCount,
          riderFirstName: rider?.firstName ?? '',
          riderLastName: rider?.lastName ?? '',

          // 1 minute to respond
        };
        this.tripGateway.notifyDriverOfTripRequest(driver.userId, tripRequest);
      }
    } catch (error) {
      this.logger.error('Failed to Handle the trip request', error);
    }
  }
}
