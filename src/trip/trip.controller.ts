import { Controller, Post, Body, Get } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripEntity } from 'src/common/entities/trip/trip.entity';
//import { TripStatus } from 'src/common/dto/trip/trip_status';
import { ApiResponse } from 'src/common/types/api_response';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { CreateTripDto } from 'src/common/dto/trip/create_trip.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UserDeviceService } from 'src/user_device/user_device.service';
import { DriverLocationTrackingService } from 'src/tracking/driver_location_tracking/driver_location_tracking.service';

@Controller('trip')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly notificationsService: NotificationsService,
    private readonly userDeviceService: UserDeviceService,
    private readonly driverLocationTrackingService: DriverLocationTrackingService,
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
  async requestRide(
    @Body() body: CreateTripDto,
  ): Promise<ApiResponse<TripEntity>> {
    try {
      const trip = await this.tripService.createTrip(body);
      const drivers = this.driverLocationTrackingService.findClosestDriver(
        trip.startRiderLocation,
      );
      const device = await this.userDeviceService.findOne(drivers.firebaseId);
      const title = 'New Trip Request';
      const bodyMessage = `A new trip request has been made from ${trip.startRiderLocation.latitude}, ${trip.startRiderLocation.longitude} to ${trip.endRiderLocation.latitude}, ${trip.endRiderLocation.longitude}.`;
      await this.notificationsService.sendNotification(
        device.fcmToken,
        title,
        bodyMessage,
      );
      return new ApiResponse(true, 'Trip created successfully', trip);
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
  //   @Post(':id/accept')
  //   async acceptRide(
  //     @Param('id') tripId: string,
  //     @Body() body: { driverId: string },
  //   ): Promise<TripEntity> {
  //     return this.tripService.assignDriver(tripId, body.driverId);
  //   }

  // 🚗 Driver updates ride status (e.g., EN_ROUTE, COMPLETED)
  //   @Post(':id/status')
  //   async updateRideStatus(
  //     @Param('id') tripId: string,
  //     @Body() body: { status: TripStatus },
  //   ): Promise<TripEntity> {
  //     return this.tripService.updateStatus(tripId, body.status);
  //   }
}
