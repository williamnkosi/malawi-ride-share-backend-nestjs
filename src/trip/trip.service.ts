import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripEntity, TripStatus } from './entities/trip_entity';
import { Repository } from 'typeorm';
import { TripGateway } from './trip.gateway';
import { LocationTrackingGateway } from 'src/location_tracking/location_tracking.gateway';
import { LocationTrackingService } from 'src/location_tracking/location_tracking.service';
import { RequestTripDto } from './dtos/request_trip.dto';
import { UsersService } from 'src/users/users.service';
import { DriverLocationDto } from 'src/location_tracking/location_tracking.dto';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(
    @InjectRepository(TripEntity)
    private readonly tripRepository: Repository<TripEntity>,
    private readonly userService: UsersService,
    private readonly tripGateway: TripGateway,
    private readonly locationTrackingService: LocationTrackingService,
    private readonly locationTrackingGateway: LocationTrackingGateway,
  ) {}

  async requestTrip(requestTripDto: RequestTripDto, FirebaseId: string) {
    try {
      // 1. Find the database user by Firebase UID
      const user = await this.userService.findByFirebaseId(FirebaseId);
      if (!user) {
        throw new Error('User not found');
      }

      // 2. Create trip entity
      const trip = this.tripRepository.create({
        riderId: user.id, // Use database user ID
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

      // 4. Find nearby drivers
      const nearbyDrivers: DriverLocationDto[] =
        this.locationTrackingService.findNearbyDrivers(savedTrip);
      if (nearbyDrivers.length === 0) {
        this.logger.warn('No nearby drivers found for trip request');
        return { message: 'No nearby drivers available' };
      }

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
