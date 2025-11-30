import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/types/api_response';
import { LocationTrackingService } from './location_tracking.service';

@Controller('location-tracking')
export class LocationTrackingController {
  constructor(private readonly locationService: LocationTrackingService) {}

  /**
   * Get current location of a specific driver
   */
  @Get('driver/:driverId')
  getDriverLocation(@Param('driverId') driverId: string) {
    const location = this.locationService.getDriverLocation(driverId);
    if (!location) {
      throw new NotFoundException('Driver location not found');
    }

    return location;
  }

  /**
   * Get all online drivers (admin endpoint)
   */
  @Get('drivers/online')
  getOnlineDrivers() {
    const drivers = this.locationService.getAllOnlineDrivers();
    return {
      count: drivers.length,
      drivers,
    };
  }

  /**
   * Check if driver is online
   */
  @Get('driver/:driverId/status')
  getDriverStatus(@Param('driverId') driverId: string) {
    const isOnline = this.locationService.isDriverOnline(driverId);
    return new ApiResponse(true, 'Driver status retrieved', {
      driverId,
      isOnline,
    });
  }
}
