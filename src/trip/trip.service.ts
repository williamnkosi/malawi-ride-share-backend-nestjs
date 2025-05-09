import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RiderEntity } from 'src/common/entities/rider.entity';
import { DriverEntity } from 'src/common/entities/driver.entity';

import { TripEntity } from 'src/common/entities/trip/trip.entity';
import { TripStatus } from 'src/common/entities/trip/trip_status';
import { CreateTripDto } from 'src/common/dto/trip/create_trip.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(TripEntity)
    private tripRepository: Repository<TripEntity>,

    @InjectRepository(RiderEntity)
    private riderRepository: Repository<RiderEntity>,

    @InjectRepository(DriverEntity)
    private driverRepository: Repository<DriverEntity>,
  ) {}

  currentTrips: TripEntity[] = [];

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
      return trip;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error('Error creating trip');
    }
    //return this.tripRepository.save(trip);
  }

  // Assign a driver to a trip
  async assignDriver(tripId: string, driverId: string): Promise<TripEntity> {
    const trip = await this.tripRepository.findOne({ where: { id: tripId } });
    if (!trip) {
      throw new Error('Trip not found');
    }

    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });
    if (!driver) {
      throw new Error('Driver not found');
    }

    trip.driver = driver;
    trip.status = TripStatus.ACCEPTED; // Status changes to matched when a driver is assigned

    return this.tripRepository.save(trip);
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
}
