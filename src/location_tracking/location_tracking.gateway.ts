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

import { AuthenticatedSocket } from 'src/common/guards/firebase_auth_guard_types';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';
import { WebSocketAuthUtil } from 'src/common/utils/websocket-auth.util';
import { UserType } from 'src/common/guards/firebase_auth_guard_types';

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

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Location Gateway - Client connected: ${client.userId}`);

    try {
      // This gateway is specifically for drivers only
      this.logger.log(
        `Setting up driver ${client.userId} for location tracking`,
      );
      await client.join(`driver:${client.userId}`);

      this.logger.log(
        `Driver ${client.userId} registered and ready for location tracking`,
      );
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
      this.logger.debug(`Location update from driver ${client.userId}`, {
        latitude: payload.location.latitude,
        longitude: payload.location.longitude,
        status: payload.status,
      });
      const updatedLocation = await this.locationService.updateDriverLocation(
        client,
        payload,
      );

      this.logger.log('received driver location update', {
        driverId: client.userId,
        latitude: updatedLocation.location?.latitude,
        longitude: updatedLocation.location?.longitude,
        status: updatedLocation.status,
      });

      // Broadcast to riders tracking this driver
      this.server
        .to(`driver:${client.userId}`)
        .emit('driver:location_changed', {
          driverId: client.userId,
          location: {
            latitude: updatedLocation.location?.latitude ?? '',
            longitude: updatedLocation.location?.longitude ?? '',
          },
        });

      return {
        status: 'success',
      };
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
    @MessageBody()
    payload: UpdateDriverLocationDto,
  ) {
    try {
      const { status } = payload;

      this.locationService.updateDriverStatus(client.userId, status);

      this.logger.log(`Driver ${client.userId} status updated: ${status}`);

      return {
        status: 'success',
        driverStatus: status,
      };
    } catch (error) {
      this.logger.error(`Failed to update driver status:`, error);
      return {
        status: 'error',
        message: 'Failed to update status',
      };
    }
  }

  /**
   * Notify a driver about a trip request via the location namespace
   * This ensures drivers connected only to /location namespace receive trip notifications
   */
  notifyDriverOfTripRequest(driverUserId: string, tripRequestData: any) {
    try {
      this.logger.log(
        `Sending trip request to driver ${driverUserId} via location namespace`,
      );
      this.server
        .to(`driver:${driverUserId}`)
        .emit('driver:trip_request_received', tripRequestData);
      this.logger.log(
        `Trip request sent to driver ${driverUserId} via location namespace`,
      );
    } catch (e) {
      this.logger.error(
        `Failed to notify driver ${driverUserId} via location namespace:`,
        e,
      );
    }
  }
}
