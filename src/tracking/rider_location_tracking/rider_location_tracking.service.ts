import { Injectable } from '@nestjs/common';
import { RiderLocationDto } from 'src/common/dto/rider/rider_location.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@Injectable()
export class RiderLocationTrackingService {
  private riders = new Map<string, RiderLocationDto>();

  updateLocation(driverLocation: RiderLocationDto) {
    try {
      this.riders.set(driverLocation.firebaseId, driverLocation);
    } catch {
      throw new CustomError('Error updating riderr location', 500);
    }
  }

  getAllDrivers() {
    try {
      return Array.from(this.riders.entries()).map(([riderId, location]) => ({
        riderId,
        ...location,
      }));
    } catch {
      throw new CustomError('Error getting all rider', 500);
    }
  }

  getDriver(riderId: string) {
    try {
      return this.riders.get(riderId);
    } catch {
      throw new CustomError('Error getting riderr location', 500);
    }
  }
}
