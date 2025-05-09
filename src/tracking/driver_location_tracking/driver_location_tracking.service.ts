import { Injectable } from '@nestjs/common';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driver_location.dto';
import { UserLocationDto } from 'src/common/dto/location/user_location.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@Injectable()
export class DriverLocationTrackingService {
  private drivers = new Map<string, UserLocationDto>();

  updateLocation(driverLocation: DriverLocationDto) {
    try {
      this.drivers.set(
        driverLocation.firebaseId,
        driverLocation.driverLocation,
      );
    } catch {
      throw new CustomError('Error updating driver location', 500);
    }
  }

  getAllDrivers() {
    try {
      return Array.from(this.drivers.entries()).map(([driverId, location]) => ({
        driverId,
        ...location,
      }));
    } catch {
      throw new CustomError('Error getting all drivers', 500);
    }
  }

  getDriver(driverId: string) {
    try {
      return this.drivers.get(driverId);
    } catch {
      throw new CustomError('Error getting driver location', 500);
    }
  }
}
