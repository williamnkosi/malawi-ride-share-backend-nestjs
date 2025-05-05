import { Injectable } from '@nestjs/common';
import { LocationDto } from 'src/common/dto/location/locationDto';

@Injectable()
export class TrackingService {
  private locations: { [key: string]: LocationDto } = {};

  getLocation(userId: string): LocationDto {
    return this.locations[userId];
  }
}
