import { MessageBody } from '@nestjs/websockets/decorators/message-body.decorator';
import { WebSocketGateway } from '@nestjs/websockets/decorators/socket-gateway.decorator';
import { SubscribeMessage } from '@nestjs/websockets/decorators/subscribe-message.decorator';
import { DriverLocationDto } from 'src/common/dto/driverlocation/driverlLocationDto';
import { RiderLocationDto } from 'src/common/dto/location/riderLocationDto';
import { TrackingService } from './tracking.service';

@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*', // Allow all origins for testing. You should restrict this in production.
  },
})
export class TrackingGateway {
  constructor(private readonly trackingService: TrackingService) {}

  @SubscribeMessage('updateRiderLocation')
  handleRiderLocationUpdate(@MessageBody() data: RiderLocationDto) {
    return this.trackingService.handleUpdateRiderLocation(data);
  }

  @SubscribeMessage('getRiderLocation')
  handleGetRiderLocation(
    @MessageBody() userId: string,
  ): RiderLocationDto | null {
    return this.trackingService.handleGetRiderLocation(userId);
  }

  @SubscribeMessage('updateDriverLocation')
  handleDriverLocationUpdate(@MessageBody() data: DriverLocationDto) {
    return this.trackingService.handleUpdateDriverLocation(data);
  }

  @SubscribeMessage('getDriverLocation')
  handleGetDriverLocation(
    @MessageBody() userId: string,
  ): DriverLocationDto | null {
    return this.trackingService.handleGetDriverLocation(userId);
  }
}
