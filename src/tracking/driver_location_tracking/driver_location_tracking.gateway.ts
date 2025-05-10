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

@WebSocketGateway()
export class DriverLocationTrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly driverLocationService: DriverLocationTrackingService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket initialized:');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('driver-location-update')
  handleDriverLocationUpdate(
    @MessageBody()
    driverLocation: string,
  ) {
    try {
      const r = JSON.parse(driverLocation) as DriverLocationDto;
      this.driverLocationService.updateLocation(r);
    } catch (error) {
      console.log(error);

      throw new CustomError('Error updating driver location');
    }
  }
}
