import { Controller, Get } from '@nestjs/common';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driver_location.dto';
import { ApiResponse } from 'src/common/types/api_response';
import { DriverLocationTrackingService } from './driver_location_tracking.service';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@Controller('driver-location-tracking')
export class DriverLocationTrackingController {
  constructor(
    private readonly driverLocationService: DriverLocationTrackingService,
  ) {}
  @Get()
  getAllDrivers(): ApiResponse<
    { latitude: number; longitude: number; driverId: string }[]
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
