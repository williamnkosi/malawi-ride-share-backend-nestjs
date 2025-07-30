import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripEntity } from './entities/trip_entity';
import { Repository } from 'typeorm';
import { TripGateway } from './trip.gateway';
import { LocationTrackingGateway } from 'src/location_tracking/location_tracking.gateway';
import { LocationTrackingService } from 'src/location_tracking/location_tracking.service';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(
    @InjectRepository(TripEntity)
    private readonly tripRepository: Repository<TripEntity>,
    private readonly tripGateway: TripGateway,
    private readonly locationTrackingService: LocationTrackingService,
    private readonly locationTrackingGateway: LocationTrackingGateway,
  ) {}

  async createTrip(tripData: Partial<TripEntity>): Promise<TripEntity> {
    const trip = this.tripRepository.create(tripData);
    return await this.tripRepository.save(trip);
  }
}
