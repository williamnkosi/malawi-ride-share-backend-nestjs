import { MessageBody } from '@nestjs/websockets/decorators/message-body.decorator';
import { WebSocketGateway } from '@nestjs/websockets/decorators/socket-gateway.decorator';
import { SubscribeMessage } from '@nestjs/websockets/decorators/subscribe-message.decorator';
import { Server } from 'http';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driverlLocationDto';
import { RiderLocationDto } from 'src/common/dto/location/riderLocationDto';
import { CustomError } from 'src/common/types/customError/errorMessageResponse';

@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*', // Allow all origins for testing. You should restrict this in production.
  },
})
export class TrackingGateway {
  server: Server;

  private riderLocations: Record<string, RiderLocationDto> = {};
  private driverLocations: Record<string, DriverLocationDto> = {};

  @SubscribeMessage('updateRiderLocation')
  handleRiderLocationUpdate(@MessageBody() data: RiderLocationDto) {
    try {
      this.riderLocations[data.userId] = data;
    } catch {
      throw new CustomError('Error sending recieving rider location', 500);
    }
  }

  @SubscribeMessage('getRiderLocation')
  handleGetRiderLocation(
    @MessageBody() userId: string,
  ): RiderLocationDto | null {
    try {
      return this.riderLocations[userId] || null;
    } catch {
      throw new CustomError('Error getting rider location', 500);
    }
  }

  @SubscribeMessage('updateDriverLocation')
  handleDriverLocationUpdate(@MessageBody() data: DriverLocationDto) {
    console.log('Driver');
    try {
      this.driverLocations[data.userId] = data;
    } catch {
      throw new CustomError('Error sending recieving rider location', 500);
    }
  }

  @SubscribeMessage('getDriverLocation')
  handleGetDriverLocation(
    @MessageBody() userId: string,
  ): DriverLocationDto | null {
    try {
      return this.driverLocations[userId] || null;
    } catch {
      throw new CustomError('Error getting driver location', 500);
    }
  }
}
