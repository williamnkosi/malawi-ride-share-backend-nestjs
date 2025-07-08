import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocationTrackingService } from './location_tracking.service';
import {
  DriverConnectionDto,
  UpdateDriverLocationDto,
} from './location_tracking.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/location-tracking',
})
export class LocationTrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LocationTrackingGateway.name);

  constructor(private readonly locationService: LocationTrackingService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Auto-register driver if credentials provided
    const firebaseId: string | undefined = client.handshake.auth?.firebaseId as
      | string
      | undefined;

    if (firebaseId) {
      await this.registerDriverForTracking(client, { firebaseId });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.locationService.unregisterDriver(client.id);
  }

  /**
   * Register driver for location tracking
   */
  @SubscribeMessage('driver:register')
  async registerDriverForTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DriverConnectionDto,
  ) {
    try {
      const { firebaseId, initialLocation } = payload;

      this.locationService.registerDriver(
        firebaseId,
        client.id,
        initialLocation,
      );

      // Join driver-specific room
      await client.join(`driver:${firebaseId}`);

      this.logger.log(`Driver ${firebaseId} registered for tracking`);

      return {
        status: 'success',
        message: 'Driver registered for location tracking',
        firebaseId,
      };
    } catch (error) {
      this.logger.error(`Failed to register driver:`, error);
      return {
        status: 'error',
        message: 'Failed to register for tracking',
      };
    }
  }

  /**
   * Real-time location updates from driver
   */
  @SubscribeMessage('driver:location_update')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: UpdateDriverLocationDto,
  ) {
    try {
      const updatedLocation =
        this.locationService.updateDriverLocation(payload);

      // Broadcast to riders tracking this driver
      this.server
        .to(`tracking:${payload.firebaseId}`)
        .emit('driver:location_changed', {
          driverId: payload.firebaseId,
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

  // /**
  //  * Update driver availability status
  //  */
  // @SubscribeMessage('driver:status_update')
  // async updateDriverStatus(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody()
  //   payload: {
  //     driverId: string;
  //     status: 'online' | 'offline' | 'busy' | 'on_trip';
  //     isAvailable: boolean;
  //   },
  // ) {
  //   try {
  //     const { driverId, status, isAvailable } = payload;

  //     await this.locationService.updateDriverStatus(
  //       driverId,
  //       status,
  //       isAvailable,
  //     );

  //     this.logger.log(`Driver ${driverId} status updated: ${status}`);

  //     return {
  //       status: 'success',
  //       driverStatus: status,
  //       isAvailable,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Failed to update driver status:`, error);
  //     return {
  //       status: 'error',
  //       message: 'Failed to update status',
  //     };
  //   }
  // }

  // /**
  //  * Rider starts tracking a driver during trip
  //  */
  // @SubscribeMessage('rider:track_driver')
  // async trackDriver(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() payload: { tripId: string; driverId: string },
  // ) {
  //   try {
  //     const { tripId, driverId } = payload;

  //     // Join tracking room
  //     client.join(`tracking:${driverId}`);

  //     // Send current driver location
  //     const currentLocation =
  //       await this.locationService.getDriverLocation(driverId);
  //     if (currentLocation) {
  //       client.emit('driver:current_location', {
  //         driverId,
  //         location: {
  //           latitude: currentLocation.latitude,
  //           longitude: currentLocation.longitude,
  //         },
  //         isAvailable: currentLocation.isAvailable,
  //         status: currentLocation.status,
  //         heading: currentLocation.heading,
  //         speed: currentLocation.speed,
  //         timestamp: currentLocation.lastUpdate,
  //       });
  //     }

  //     this.logger.log(
  //       `Rider started tracking driver ${driverId} for trip ${tripId}`,
  //     );

  //     return {
  //       status: 'success',
  //       message: 'Started tracking driver',
  //     };
  //   } catch (error) {
  //     this.logger.error(`Failed to start tracking:`, error);
  //     return {
  //       status: 'error',
  //       message: 'Failed to start tracking',
  //     };
  //   }
  // }

  // /**
  //  * Stop tracking driver
  //  */
  // @SubscribeMessage('rider:stop_tracking')
  // async stopTracking(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() payload: { driverId: string },
  // ) {
  //   const { driverId } = payload;
  //   client.leave(`tracking:${driverId}`);

  //   return {
  //     status: 'success',
  //     message: 'Stopped tracking driver',
  //   };
  // }
}
