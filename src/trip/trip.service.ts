import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripEntity, TripStatus } from './entities/trip.entity';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import {
  AuthenticatedSocket,
  UserType,
} from '../common/guards/firebase_auth_guard_types';
import { LocationTrackingService } from '../location_tracking/location_tracking.service';
import { UserLocationDto } from '../common/dto/location/user_location.dto';
import { DriverMatchingService } from './services/sequential_notifcation/driver_matching_service';
import { TripCommunicationService } from './services/trip_communication/trip_communication.service';
import { Server } from 'socket.io';
import { RiderRequestTripDto } from './dtos/rider_request_trip.dto';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(
    @InjectRepository(TripEntity)
    private readonly tripRepository: Repository<TripEntity>,
    private readonly userService: UsersService,
    private readonly locationTrackingService: LocationTrackingService,
    private readonly driverMatchingService: DriverMatchingService,
    private readonly tripCommunicationService: TripCommunicationService,
  ) {}

  /**
   * Setup user connection and assign appropriate rooms
   */
  async handleUserConnection(client: AuthenticatedSocket): Promise<void> {
    const userType = client.userType;
    const userId = client.userId; // Database user ID

    if (userType === UserType.DRIVER) {
      // Join driver-specific room
      await client.join(`driver:${userId}`);
      this.logger.log(`Driver ${userId} connected to trip gateway`);
    } else if (userType === UserType.RIDER) {
      // Join rider-specific room
      await client.join(`rider:${userId}`);
      this.logger.log(`Rider ${userId} connected to trip gateway`);
    } else {
      this.logger.warn(`Unknown user type: ${String(userType)}`);
      throw new Error('Invalid user type');
    }
  }

  // === RIDER METHODS ===

  async requestTrip(riderRequestTripDto: RiderRequestTripDto, userId: string) {
    const riderEntity = await this.userService.findById(userId); // Ensure user exists
    // 2. Create trip entity
    const trip = this.tripRepository.create({
      riderId: userId, // Use database user ID
      rider: riderEntity,
      pickupAddress: riderRequestTripDto.pickupLocation.address,
      dropoffAddress: riderRequestTripDto.dropoffLocation.address,
      pickupLatitude: riderRequestTripDto.pickupLocation.latitude,
      pickupLongitude: riderRequestTripDto.pickupLocation.longitude,
      dropoffLatitude: riderRequestTripDto.dropoffLocation.latitude,
      dropoffLongitude: riderRequestTripDto.dropoffLocation.longitude,
      passengerCount: riderRequestTripDto.passengerCount,
      notes: riderRequestTripDto.notes,
      status: TripStatus.REQUESTED,
      //scheduledTime: requestTripDto.scheduledTime,
    });

    // 3. Save trip to database
    const savedTrip = await this.tripRepository.save(trip);
    const userLocation: UserLocationDto = {
      latitude: riderRequestTripDto.pickupLocation.latitude,
      longitude: riderRequestTripDto.pickupLocation.longitude,
    };
    const nearbyDrivers =
      this.locationTrackingService.findNearbyDrivers(userLocation);

    if (nearbyDrivers.length === 0) {
      this.logger.warn(
        `No drivers found near pickup location for trip ${savedTrip.id}`,
      );
      throw new Error('No drivers available nearby');
    }

    await this.driverMatchingService.sendNotificationsInSequence(
      savedTrip,
      nearbyDrivers,
    );

    return savedTrip;
  }

  async createTrip(tripData: Partial<TripEntity>): Promise<TripEntity> {
    const trip = this.tripRepository.create(tripData);
    return await this.tripRepository.save(trip);
  }

  async acceptTrip(
    server: Server,
    tripId: string,
    driverId: string,
  ): Promise<void> {
    const currentDriverLocation =
      this.locationTrackingService.getDriverLocation(driverId);
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new Error('Trip not found');
    }

    trip.status = TripStatus.ACCEPTED;
    trip.driverId = driverId;

    await this.tripRepository.save(trip);

    await this.tripCommunicationService.notifyUsersOfTripAccepted(
      server,
      trip,
      currentDriverLocation!,
    );
  }

  /**
   * Start the trip to destination
   * Called when driver has picked up the rider and begins journey
   */
  async startTrip(
    server: Server,
    tripId: string,
    driverId: string,
  ): Promise<TripEntity> {
    // 1. Validate trip exists
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new Error('Trip not found');
    }

    // 2. Validate driver is assigned to this trip
    if (trip.driverId !== driverId) {
      throw new Error('You are not the assigned driver for this trip');
    }

    // 3. Validate trip is in correct status
    if (trip.status !== TripStatus.ACCEPTED) {
      throw new Error('Trip must be in ACCEPTED status to start');
    }

    // 4. Update status to IN_PROGRESS
    trip.status = TripStatus.IN_PROGRESS;

    // 5. Save updated trip
    const updatedTrip = await this.tripRepository.save(trip);

    // 6. Get driver's current location and notify both parties
    const currentDriverLocation =
      this.locationTrackingService.getDriverLocation(driverId);

    await this.tripCommunicationService.notifyTripStarted(
      server,
      updatedTrip,
      currentDriverLocation!,
    );

    this.logger.log(`Trip ${tripId} started by driver ${driverId}`);

    return updatedTrip;
  }

  /**
   * Complete the trip
   * Called when driver arrives at destination
   */
  async completeTrip(
    server: Server,
    tripId: string,
    driverId: string,
  ): Promise<TripEntity> {
    // 1. Validate trip exists
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new Error('Trip not found');
    }

    // 2. Validate driver is assigned to this trip
    if (trip.driverId !== driverId) {
      throw new Error('You are not the assigned driver for this trip');
    }

    // 3. Validate trip is in correct status
    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new Error('Trip must be in IN_PROGRESS status to complete');
    }

    // 4. Update status to COMPLETED
    trip.status = TripStatus.COMPLETED;

    // 5. Save updated trip
    const updatedTrip = await this.tripRepository.save(trip);

    // 6. Notify both parties
    this.tripCommunicationService.notifyTripCompleted(server, updatedTrip);

    this.logger.log(`Trip ${tripId} completed by driver ${driverId}`);

    return updatedTrip;
  }
}
