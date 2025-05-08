import {
  Controller,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { TripEntity } from 'src/common/dto/trip/trip.entity';
//import { TripStatus } from 'src/common/dto/trip/trip_status';
import { ApiResponse } from 'src/common/types/api_response';

@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  // 🧍 Rider requests a ride
  @Post('request')
  async requestRide(
    @Body() body: { riderId: string },
  ): Promise<ApiResponse<TripEntity>> {
    try {
      const response = await this.tripService.createTrip(body.riderId);
      if (!response) {
        throw new NotFoundException('Rider not found');
      }
      return new ApiResponse(true, 'Trip created successfully', response);
    } catch {
      throw new NotFoundException('Rider not found');
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
