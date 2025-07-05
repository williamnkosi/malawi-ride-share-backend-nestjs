import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RiderEntity } from 'src/common/entities/rider.entity';

import { TripEntity } from 'src/common/entities/trip/trip.entity';
import { TripStatus } from 'src/common/entities/trip/trip_status';
import { CreateTripDto } from 'src/common/dto/trip/create_trip.dto';
import { GoogleMapsService } from 'src/google_maps_service/google_maps_service.service';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { TripDriverResponseDto } from 'src/common/dto/trip/trip_driver_response.dto';
import { DriverLocationTrackingService } from 'src/tracking/driver_location_tracking/driver_location_tracking.service';
import { UserDeviceService } from 'src/user_device/user_device.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { DriverService } from 'src/driver/driver.service';
import { DriverEntity } from 'src/common/entities/driver.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(TripEntity)
    private tripRepository: Repository<TripEntity>,

    @InjectRepository(RiderEntity)
    private riderRepository: Repository<RiderEntity>,

    @InjectRepository(DriverEntity)
    private readonly driverRepository: Repository<DriverEntity>,

    private googleMapsServiceRepository: GoogleMapsService,

    private readonly driverLocationTrackingService: DriverLocationTrackingService,
    private readonly userDeviceService: UserDeviceService,
    private readonly notificationsService: NotificationsService,
    private readonly driverService: DriverService,
  ) {}

  logger = new Logger('TripService');
  currentTrips: TripEntity[] = [];
  requestedDriver: DriverEntity[] = [];

  // Create a new trip request
  async createTrip(
    createTripDto: CreateTripDto,
    rider: RiderEntity,
  ): Promise<TripDriverResponseDto> {
    try {
      const trip = new TripEntity();
      trip.rider = rider!;
      trip.status = TripStatus.REQUESTED;
      trip.startRiderLocation = createTripDto.startLocation;
      trip.endRiderLocation = createTripDto.endLocation;
      trip.endRiderLocation = createTripDto.endLocation;
      this.currentTrips.push(trip);
      const distanceInfo = await this.getDistances(createTripDto);
      trip.distanceKm = distanceInfo.distanceKm;
      trip.durationMin = distanceInfo.durationMin;
      this.logger.log('Trip created');
      const tripDto = TripDriverResponseDto.fromTripEntity(trip);
      await this.informDriver(tripDto);
      return tripDto;
    } catch (error) {
      this.logger.error('Error creating trip:', error);
      throw new Error('TripeService: Error creating trip');
    }
    //return this.tripRepository.save(trip);
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

  private async informDriver(tripDto: TripDriverResponseDto) {
    try {
      const drivers = this.driverLocationTrackingService.findClosestDriver(
        tripDto.startLocation,
      );

      const driverEntity = await this.driverRepository.findOne({
        where: { firebaseId: drivers.firebaseId },
      });
      if (driverEntity != null) {
        this.requestedDriver.push(driverEntity);
      }

      const device = await this.userDeviceService.findOne(drivers.firebaseId);
      const title = 'New Trip Request';

      const bodyMessage = `A new trip request has been made from ${tripDto.riderfirstName} ${tripDto.riderlastName}.`;

      await this.notificationsService.sendNotificationWithData(
        device.fcmToken,
        { title, body: bodyMessage },
        tripDto.toRecordFirebaseMessage(),
      );
    } catch (error) {
      this.logger.error('Failed to inform driver', error);
    }
  }

  clearCurrentTrips(): void {
    this.currentTrips = [];
  }
}
