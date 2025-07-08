import { Controller, Get } from '@nestjs/common';

import { ApiResponse } from 'src/common/types/api_response';
import { DriverLocationTrackingService } from './driver_location_tracking.service';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { UserLocationDto } from 'src/common/dto/location/user_location.dto';
import { DriverStatus } from 'src/common/dto/driverlocation/driver_status';

@Controller('driver-location-tracking')
export class DriverLocationTrackingController {
  constructor(
    private readonly driverLocationService: DriverLocationTrackingService,
  ) {}
  @Get()
  getAllDrivers(): ApiResponse<
    {
      firebaseId: string;
      driverLocation: UserLocationDto;
      timestamp: Date;
      status: DriverStatus;
      driverId: string;
    }[]
  > {
    try {
      const response = this.driverLocationService.getAllDrivers();
      return new ApiResponse(
        true,
        'Driver locations retrieved successfully',
        response,
      );
    } catch {
      throw new CustomError('Error retrieving driver locations');
    }
  }
}
