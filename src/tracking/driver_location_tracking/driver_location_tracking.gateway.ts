import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DriverLocationTrackingService } from './driver_location_tracking.service';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driver_location.dto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DriverTripLocationDto } from 'src/common/dto/driverlocation/driver_trip_location.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // Or specify your client origin
  },
  transports: ['websocket'], // match your Flutter client
})
export class DriverLocationTrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly driverLocationService: DriverLocationTrackingService,
  ) {}

  logger = new Logger('DriverLocatoinTrackingGateway');
  @WebSocketServer()
  server: Server;

  afterInit() {}

  handleConnection(client: Socket) {
    // this.logger.log(`Driver client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Driver client disconnected: ${client.id}`);
  }

  @SubscribeMessage('driver-location-update')
  handleDriverLocationUpdate(
    @MessageBody()
    driverLocation: DriverLocationDto,
  ) {
    try {
      this.driverLocationService.updateLocation(driverLocation);
      this.logger.log(`Driver client connected: ${driverLocation.firebaseId}`);
    } catch (error) {
      console.log(error);

      throw new CustomError('Error updating driver location');
    }
  }

  @SubscribeMessage('driver-trip-location-update')
  handleDriverTripLocationUpdate(
    @MessageBody()
    driverTripLocation: DriverTripLocationDto,
  ) {
    try {
      this.driverLocationService.updateLocation(driverTripLocation);
      this.server
        .to(`trip-${driverTripLocation.tripId}`)
        .emit('driverLocationUpdate', driverTripLocation.driverLocation);
    } catch (error) {
      console.log(error);

      throw new CustomError('Error updating driver location');
    }
  }
}
