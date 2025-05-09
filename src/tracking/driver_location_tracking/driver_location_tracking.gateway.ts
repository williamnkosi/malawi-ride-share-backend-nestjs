import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DriverLocationTrackingService } from './driver_location_tracking.service';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driver_location.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@WebSocketGateway()
export class DriverLocationTrackingGateway {
  constructor(
    private readonly driverLocationService: DriverLocationTrackingService,
  ) {}

  @SubscribeMessage('driver-location-update')
  //@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  handleDriverLocationUpdate(
    @MessageBody()
    driverLocation: DriverLocationDto,
  ) {
    try {
      console.log(driverLocation);

      this.driverLocationService.updateLocation(driverLocation);
    } catch {
      console.error('Error updating driver location');
      throw new CustomError('Error updating driver location');
    }
  }
}
