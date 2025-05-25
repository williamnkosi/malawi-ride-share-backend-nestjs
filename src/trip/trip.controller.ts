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
import { RiderService } from 'src/riders/riders.service';

@Controller('trip')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private readonly notificationsService: NotificationsService,
    private readonly userDeviceService: UserDeviceService,
    private readonly driverLocationTrackingService: DriverLocationTrackingService,
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
      const rider = await this.riderService.findOne(body.firebaseId);
      const trip = await this.tripService.createTrip(body, rider);
      const drivers = this.driverLocationTrackingService.findClosestDriver(
        trip.startLocation,
      );
      const device = await this.userDeviceService.findOne(drivers.firebaseId);
      const title = 'New Trip Request';
      const bodyMessage = `A new trip request has been made from ${trip.riderfirstName} ${trip.riderlastName}.`;
      await this.notificationsService.sendNotificationWithData(
        device.fcmToken,
        { title, body: bodyMessage },
        trip.toRecordFirebaseMessage(),
      );
      return new ApiResponse(true, 'Trip created successfully', null);
    } catch (error) {
      throw new CustomError('Error creating trip', error.message);
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
