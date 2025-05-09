import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { DriverLocationTrackingService } from './driver_location_tracking.service';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driver_location.dto';

@WebSocketGateway()
export class DriverLocationTrackingGateway {
  constructor(
    private readonly driverLocationService: DriverLocationTrackingService,
  ) {}

  @SubscribeMessage('driver-location-update')
  handleDriverLocationUpdate(
    @MessageBody()
    driverLocation: DriverLocationDto,
  ) {
    this.driverLocationService.updateLocation(driverLocation);
  }
}
