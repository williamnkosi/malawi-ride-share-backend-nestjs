import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripEntity, TripStatus } from './entities/trip.entity';
import { Repository } from 'typeorm';

import { RequestTripDto } from './dtos/request_trip.dto';
import { UsersService } from 'src/users/users.service';
import {
  AuthenticatedSocket,
  UserType,
} from 'src/common/guards/firebase_auth_guard_types';
import { NotificationEventEmitter } from 'src/notifications/notifications_emitter/notificaiton_emitter';
import { LocationTrackingService } from 'src/location_tracking/location_tracking.service';
import { UserLocationDto } from 'src/common/dto/location/user_location.dto';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  private driverSockets = new Map<string, string>(); // driverId → socketId
  private riderSockets = new Map<string, string>();

  constructor(
    @InjectRepository(TripEntity)
    private readonly tripRepository: Repository<TripEntity>,
    private readonly userService: UsersService,
    private readonly locationTrackingService: LocationTrackingService,
    private readonly notificationEmitter: NotificationEventEmitter,
  ) {}

  registerUserSocket(client: AuthenticatedSocket) {
    const userType = client.userType;
    const userId = client.firebaseId;

    if (userType === UserType.DRIVER) {
      this.driverSockets.set(userId, client.id);
    } else if (userType === UserType.RIDER) {
      this.riderSockets.set(userId, client.id);
    }
  }

  unregisterUserSocket(client: AuthenticatedSocket) {
    const userType = client.userType;
    const userId = client.firebaseId;

    if (userType === UserType.DRIVER) {
      this.driverSockets.delete(userId);
    } else if (userType === UserType.RIDER) {
      this.riderSockets.delete(userId);
    }
  }

  async requestTrip(requestTripDto: RequestTripDto, userId: string) {
    try {
      // 2. Create trip entity
      const trip = this.tripRepository.create({
        riderId: userId, // Use database user ID
        pickupAddress: requestTripDto.pickupLocation.address,
        dropoffAddress: requestTripDto.dropoffLocation.address,
        pickupLatitude: requestTripDto.pickupLocation.latitude,
        pickupLongitude: requestTripDto.pickupLocation.longitude,
        dropoffLatitude: requestTripDto.dropoffLocation.latitude,
        dropoffLongitude: requestTripDto.dropoffLocation.longitude,
        passengerCount: requestTripDto.passengerCount,
        notes: requestTripDto.notes,
        status: TripStatus.REQUESTED,
        scheduledTime: requestTripDto.scheduledTime,
      });

      // 3. Save trip to database
      const savedTrip = await this.tripRepository.save(trip);
      const userLocation: UserLocationDto = {
        latitude: requestTripDto.pickupLocation.latitude,
        longitude: requestTripDto.pickupLocation.longitude,
      };
      const nearbyDrivers =
        this.locationTrackingService.findNearbyDrivers(userLocation);

      if (nearbyDrivers.length === 0) {
        this.logger.warn(
          `No drivers found near pickup location for trip ${savedTrip.id}`,
        );
        throw new Error('No drivers available nearby');
      }
      // 4. Offline trip request handling
      this.notificationEmitter.emitTripRequested({
        trip: savedTrip,
        drivers: nearbyDrivers,
      });

      return savedTrip;
    } catch (error) {
      this.logger.error('Failed to request trip:', error);
      throw new Error('Failed to request trip');
    }
  }

  async createTrip(tripData: Partial<TripEntity>): Promise<TripEntity> {
    const trip = this.tripRepository.create(tripData);
    return await this.tripRepository.save(trip);
  }

  async acceptTrip(tripId: string, driverId: string): Promise<TripEntity> {
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new Error('Trip not found');
    }

    trip.status = TripStatus.ACCEPTED;
    trip.driverId = driverId;

    return await this.tripRepository.save(trip);
  }
}
