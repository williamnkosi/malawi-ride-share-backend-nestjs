import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocationTrackingService } from './location_tracking.service';
import { UpdateDriverLocationDto } from './location_tracking.dto';

import { AuthenticatedSocket } from '../common/guards/firebase_auth_guard_types';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { WebSocketAuthUtil } from '../common/utils/websocket-auth.util';
import { UserType } from '../common/guards/firebase_auth_guard_types';

@WebSocketGateway({
  namespace: '/location',
  cors: { origin: '*' },
})
export class LocationTrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LocationTrackingGateway.name);

  constructor(
    private readonly locationService: LocationTrackingService,
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    WebSocketAuthUtil.applyAuthMiddleware(
      server,
      this.firebaseService,
      this.usersService,
      this.logger,
      {
        requireUserType: UserType.DRIVER,
        gatewayName: 'Location Tracking Gateway',
      },
    );
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Location Gateway - Client connected: ${client.userId}`);
    try {
      this.locationService.handleDriverConnection(client);
    } catch (error) {
      this.logger.error(`Failed to setup driver ${client.userId}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.userId}`);

    // Clean up driver data (service handles the logic)
    this.locationService.unregisterDriver(client.userId);
  }

  /**
   * Real-time location updates from driver
   */
  @SubscribeMessage('driver:location_update')
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateDriverLocationDto,
  ) {
    try {
      await this.locationService.updateDriverLocation(client, payload);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Failed to update location:`, error);
      return {
        status: 'error',
        message: 'Failed to update location',
      };
    }
  }

  /**
   * Update driver availability status
   */
  @SubscribeMessage('driver:status_update')
  updateDriverStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateDriverLocationDto,
  ) {
    try {
      const updatedStatus = this.locationService.updateDriverStatus(
        client.userId,
        payload.status,
      );

      return {
        status: 'success',
        driverStatus: updatedStatus,
      };
    } catch (error) {
      this.logger.error(`Failed to update driver status:`, error);
      return {
        status: 'error',
        message: 'Failed to update status',
      };
    }
  }
}
