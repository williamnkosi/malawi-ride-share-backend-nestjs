import { Injectable } from '@nestjs/common';
import { LocationTrackingGateway } from 'src/location_tracking/location_tracking.gateway';
import { NotificationsService } from '../notifications.service';
import { OnEvent } from '@nestjs/event-emitter';
import { TripEntity } from 'src/trip/entities/trip_entity';
import { DriverLocationDto } from 'src/location_tracking/location_tracking.dto';

@Injectable()
export class DriverNotificationsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly locationTrackingGateway: LocationTrackingGateway, // ✅ Use existing
  ) {}
  // ✅ 1. NEW TRIP REQUESTS
  @OnEvent('trip.drivers_found')
  async handleTripRequest(payload: {
    trip: TripEntity;
    drivers: DriverLocationDto[];
  }) {
    // Send trip request to available drivers
    // WebSocket + Push notifications
  }
}
