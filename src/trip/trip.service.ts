import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripEntity, TripStatus } from './entities/trip_entity';
import { Repository } from 'typeorm';

import { RequestTripDto } from './dtos/request_trip.dto';
import { UsersService } from 'src/users/users.service';
import {
  AuthenticatedSocket,
  UserType,
} from 'src/common/guards/firebase_auth_guard_types';
import { NotificationEventEmitter } from 'src/notifications/notifications_emitter/notificaiton_emitter';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  private driverSockets = new Map<string, string>(); // driverId → socketId
  private riderSockets = new Map<string, string>();

  constructor(
    @InjectRepository(TripEntity)
    private readonly tripRepository: Repository<TripEntity>,
    private readonly userService: UsersService,
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

      // 4. Offline trip request handling
      this.notificationEmitter.emitTripRequested({ trip: savedTrip });

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
}
