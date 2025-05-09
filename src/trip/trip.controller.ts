import {
  Controller,
  Post,
  Param,
  Body,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { TripEntity } from 'src/common/entities/trip/trip.entity';
//import { TripStatus } from 'src/common/dto/trip/trip_status';
import { ApiResponse } from 'src/common/types/api_response';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { CreateTripDto } from 'src/common/dto/trip/create_trip.dto';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

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
  async requestRide(
    @Body() body: CreateTripDto,
  ): Promise<ApiResponse<TripEntity>> {
    try {
      const response = await this.tripService.createTrip(body);
      if (!response) {
        throw new NotFoundException('Rider not found');
      }
      return new ApiResponse(true, 'Trip created successfully', response);
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new CustomError('Error creating trip');
    }
  }

  // 🧍 Rider cancels the ride
  //   @Post(':id/cancel')
  //   cancelRide(@Param('id') tripId: string): Promise<TripEntity> {
  //     return this.tripService.updateStatus(tripId, TripStatus.CANCELED);
  //   }

  // 🚗 Driver accepts the ride
  @Post(':id/accept')
  async acceptRide(
    @Param('id') tripId: string,
    @Body() body: { driverId: string },
  ): Promise<TripEntity> {
    return this.tripService.assignDriver(tripId, body.driverId);
  }

  // 🚗 Driver updates ride status (e.g., EN_ROUTE, COMPLETED)
  //   @Post(':id/status')
  //   async updateRideStatus(
  //     @Param('id') tripId: string,
  //     @Body() body: { status: TripStatus },
  //   ): Promise<TripEntity> {
  //     return this.tripService.updateStatus(tripId, body.status);
  //   }
}
