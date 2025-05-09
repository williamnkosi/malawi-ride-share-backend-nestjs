import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RiderEntity } from 'src/common/entities/rider.entity';
import { DriverEntity } from 'src/common/entities/driver.entity';

import { TripEntity } from 'src/common/entities/trip/trip.entity';
import { TripStatus } from 'src/common/entities/trip/trip_status';
import { CreateTripDto } from 'src/common/dto/trip/create_trip.dto';
import { GoogleMapsService } from 'src/google_maps_service/google_maps_service.service';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { UserLocationDto } from 'src/common/dto/location/user_location.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(TripEntity)
    private tripRepository: Repository<TripEntity>,

    @InjectRepository(RiderEntity)
    private riderRepository: Repository<RiderEntity>,

    @InjectRepository(DriverEntity)
    private driverRepository: Repository<DriverEntity>,

    private googleMapsServiceRepository: GoogleMapsService,
  ) {}

  currentTrips: TripEntity[] = [];
  activeDrivers: DriverEntity[] = [];

  // Create a new trip request
  async createTrip(createTripDto: CreateTripDto): Promise<TripEntity> {
    try {
      console.error('Tesint ');
      const rider = await this.riderRepository.findOne({
        where: { firebaseId: createTripDto.firebaseId },
      });
      if (!rider) {
        throw new Error('Rider not found');
      }
      const trip = new TripEntity();
      trip.rider = rider;
      trip.status = TripStatus.REQUESTED;
      trip.startRiderLocation = createTripDto.startLocation;
      trip.endRiderLocation = createTripDto.endLocation;
      trip.endRiderLocation = createTripDto.endLocation;
      this.currentTrips.push(trip);
      const distanceInfo = await this.getDistances(createTripDto);
      trip.distanceKm = distanceInfo.distanceKm;
      trip.durationMin = distanceInfo.durationMin;
      return trip;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error('Error creating trip');
    }
    //return this.tripRepository.save(trip);
  }

  async findClosestDriver(
    tripOrigin: UserLocationDto,
  ): Promise<DriverEntity | null> {
    const pickupLocation = `${tripOrigin.latitude},${tripOrigin.longitude}`;
    const drivers = await this.driverRepository.

    if (!drivers.length) return null;

    // Construct origin (pickup) and multiple destination strings
    const destinations = drivers.map(
      (driver) => `${driver.latitude},${driver.longitude}`,
    );

    const result = await this.googleMapsService.getDistances(
      pickupLocation,
      destinations,
    );

    // Find the closest driver by comparing distance values
    let closestDriver: DriverEntity | null = null;
    let shortestDistance = Number.MAX_VALUE;

    result.forEach((element, index) => {
      if (
        element.status === 'OK' &&
        element.distance.value < shortestDistance
      ) {
        shortestDistance = element.distance.value;
        closestDriver = drivers[index];
      }
    });

    return closestDriver;
  }

  findAllTrips(): TripEntity[] {
    try {
      return this.currentTrips;
    } catch {
      throw new CustomError('Error fetching trips');
    }
  }

  // Start the trip (change status to en_route)
  async startTrip(tripId: string): Promise<TripEntity> {
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new Error('Trip not found');
    }

    trip.status = TripStatus.IN_PROGRESS;
    trip.startedAt = new Date();

    return this.tripRepository.save(trip);
  }

  // Complete the trip (change status to completed)
  async completeTrip(
    tripId: string,
    distanceKm: number,
    durationMin: number,
  ): Promise<TripEntity> {
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new Error('Trip not found');
    }

    trip.status = TripStatus.COMPLETED;
    trip.endedAt = new Date();
    trip.distanceKm = distanceKm;
    trip.durationMin = durationMin;

    return this.tripRepository.save(trip);
  }

  // Get all trips for a rider
  async getTripsForRider(riderId: string): Promise<TripEntity[]> {
    return this.tripRepository.find({
      where: { rider: { id: riderId } },
      relations: ['rider', 'driver'],
    });
  }

  // Get all trips for a driver
  async getTripsForDriver(driverId: string): Promise<TripEntity[]> {
    return this.tripRepository.find({
      where: { driver: { id: driverId } },
      relations: ['rider', 'driver'],
    });
  }

  // Get trip details by ID
  async getTripById(tripId: string): Promise<TripEntity | null> {
    return this.tripRepository.findOne({
      where: { id: tripId },
      relations: ['rider', 'driver'],
    });
  }

  private async getDistances(createTripDto: CreateTripDto): Promise<{
    distanceKm: number;
    durationMin: number;
  }> {
    // Calculate distance and duration using Google Maps API
    const origin =
      createTripDto.startLocation.latitude +
      ',' +
      createTripDto.startLocation.longitude;
    const destination =
      createTripDto.endLocation.latitude +
      ',' +
      createTripDto.endLocation.longitude;
    const tripInfo =
      await this.googleMapsServiceRepository.getDistanceAndDuration(
        origin,
        destination,
      );

    return tripInfo;
  }
}
