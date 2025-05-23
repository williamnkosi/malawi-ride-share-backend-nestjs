import { Injectable } from '@nestjs/common';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driver_location.dto';
import { UserLocationDto } from 'src/common/dto/location/user_location.dto';

import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@Injectable()
export class DriverLocationTrackingService {
  private drivers = new Map<string, DriverLocationDto>();

  updateLocation(driverLocation: DriverLocationDto) {
    try {
      this.drivers.set(driverLocation.firebaseId, driverLocation);
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

  findClosestDriver(tripOrigin: UserLocationDto): DriverLocationDto {
    // const d = Array.from(this.drivers.values()).filter(
    //   (driver: DriverLocationDto) => {
    //     const distance = this.getDistance(
    //       tripOrigin.latitude,
    //       tripOrigin.longitude,
    //       driver.driverLocation.latitude,
    //       driver.driverLocation.longitude,
    //     );
    //     return distance < 5; // e.g., within 5 km
    //   },
    // );

    return this.drivers.get('xUxZHxtfgwdP3ErtaNzwCoko96C3')!;
  }

  private getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
