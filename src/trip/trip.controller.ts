import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripEntity } from 'src/common/entities/trip/trip.entity';
import { ApiResponse } from 'src/common/types/api_response';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { CreateTripDto } from 'src/common/dto/trip/create_trip.dto';
import { RiderService } from 'src/riders/riders.service';
import { AcceptTripDto } from 'src/common/dto/trip/accept_trip.dto';

@Controller('trip')
export class TripController {
  logger = new Logger('TripController');
  constructor(
    private readonly tripService: TripService,

    private readonly riderService: RiderService,
  ) {}

  @Get()
  findAllTrips(): ApiResponse<TripEntity[]> {
    try {
      const response = this.tripService.findAllTrips();
      return new ApiResponse(true, 'Trips fetched successfully', response);
    } catch {
      throw new CustomError('Error fetching trips');
    }
  }

  // 🧍 Rider requests a ride
  @Post('request')
  async requestRide(@Body() body: CreateTripDto): Promise<ApiResponse<null>> {
    try {
      this.logger.log(body);
      const rider = await this.riderService.findOne(body.firebaseId);
      if (rider === null) {
        throw new CustomError('Error creating trip: could not find irder', 500);
      }
      await this.tripService.createTrip(body, rider);

      return new ApiResponse(true, 'Trip created successfully', null);
    } catch (error: unknown) {
      this.logger.error('Error createing trip:', error);
      throw new CustomError('Error creating trip', 500, {
        issue: error as string,
      });
    }
  }

  @Post('driver-accept-trip')
  async driverAcceptTrip(@Body() body: AcceptTripDto) {
    try {
      console.log('Driver accepting trip:', body);
      const trip = await this.tripService.startTrip(body);
      return trip;
    } catch (e) {
      console.log(e);
    }
  }

  @Post('delete-all')
  deleteAllTrips(): ApiResponse<null> {
    try {
      this.tripService.clearCurrentTrips();
      return new ApiResponse(true, 'All trips deleted successfully', null);
    } catch (error) {
      throw new CustomError('Error deleting all trips', error.message);
    }
  }
}
