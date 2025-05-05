import { MessageBody } from '@nestjs/websockets/decorators/message-body.decorator';
import { WebSocketGateway } from '@nestjs/websockets/decorators/socket-gateway.decorator';
import { SubscribeMessage } from '@nestjs/websockets/decorators/subscribe-message.decorator';
import { Server } from 'http';
import { LocationDto } from 'src/common/dto/location/locationDto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@WebSocketGateway()
export class TrackingGateway {
  server: Server;

  private riderLocations: Record<string, LocationDto> = {};
  private driverLocations: Record<string, LocationDto> = {};

  afterInit(server: Server) {
    console.log('WebSocket server initialized', server);
  }

  @SubscribeMessage('updateRiderLocation')
  handleRiderLocationUpdate(@MessageBody() data: LocationDto) {
    try {
      this.riderLocations[data.userId] = data;
    } catch {
      throw new CustomError('Error sending recieving rider location', 500);
    }
  }

  @SubscribeMessage('getRiderLocation')
  handleGetRiderLocation(@MessageBody() userId: string): LocationDto | null {
    try {
      return this.riderLocations[userId] || null;
    } catch {
      throw new CustomError('Error getting rider location', 500);
    }
  }

  @SubscribeMessage('updateRiderLocation')
  handleDriverLocationUpdate(@MessageBody() data: LocationDto) {
    try {
      this.driverLocations[data.userId] = data;
    } catch {
      throw new CustomError('Error sending recieving rider location', 500);
    }
  }

  @SubscribeMessage('getRiderLocation')
  handleGetDriverLocation(@MessageBody() userId: string): LocationDto | null {
    try {
      return this.riderLocations[userId] || null;
    } catch {
      throw new CustomError('Error getting driver location', 500);
    }
  }
}
