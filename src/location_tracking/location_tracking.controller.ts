import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/types/api_response';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { FindNearbyDriversDto } from './location_tracking.dto';
import { LocationTrackingService } from './location_tracking.service';

@Controller('location-tracking')
export class LocationTrackingController {
  constructor(private readonly locationService: LocationTrackingService) {}

  /**
   * Find nearby available drivers for trip request
   */
  @Post('drivers/nearby')
  findNearbyDrivers(@Body() dto: FindNearbyDriversDto) {
    try {
      const drivers = this.locationService.findNearbyDrivers(
        dto.location,
        dto.radius || 5,
      );

      return new ApiResponse(
        true,
        `${drivers.length} Nearby drivers found`,
        drivers,
      );
    } catch {
      throw new CustomError('Error finding nearby drivers', 500);
    }
  }

  /**
   * Get current location of a specific driver
   */
  @Get('driver/:driverId')
  getDriverLocation(@Param('driverId') driverId: string) {
    try {
      const location = this.locationService.getDriverLocation(driverId);

      if (!location) {
        return new ApiResponse(false, 'Driver location not found', null);
      }

      return new ApiResponse(true, 'Driver location retrieved', location);
    } catch {
      throw new CustomError('Error retrieving driver location', 500);
    }
  }

  /**
   * Get all online drivers (admin endpoint)
   */
  @Get('drivers/online')
  getOnlineDrivers() {
    try {
      const drivers = this.locationService.getAllOnlineDrivers();
      return new ApiResponse(true, 'Online drivers retrieved', {
        count: drivers.length,
        drivers,
      });
    } catch {
      throw new CustomError('Error retrieving online drivers', 500);
    }
  }

  /**
   * Check if driver is online
   */
  @Get('driver/:driverId/status')
  getDriverStatus(@Param('driverId') driverId: string) {
    try {
      const isOnline = this.locationService.isDriverOnline(driverId);
      return new ApiResponse(true, 'Driver status retrieved', {
        driverId,
        isOnline,
      });
    } catch {
      throw new CustomError('Error retrieving driver status', 500);
    }
  }
}
