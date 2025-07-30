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
  LocationDto,
} from './location_tracking.dto';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class LocationTrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LocationTrackingGateway.name);

  constructor(private readonly locationService: LocationTrackingService) {}

  async handleConnection(client: Socket) {
    console.log('=== WEBSOCKET CONNECTION ===');
    console.log(`Client connected: ${client.id}`);
    this.logger.log(`Client connected: ${client.id}`);

    // Auto-register driver if credentials provided
    const firebaseId: string | undefined = client.handshake.auth?.firebaseId as
      | string
      | undefined;
    const initialPosition = client.handshake.auth?.initialPosition as
      | LocationDto
      | undefined;

    console.log('FirebaseId from auth:', firebaseId);
    console.log('Initial location from auth:', initialPosition);

    if (firebaseId) {
      console.log('Auto-registering driver with location...');
      await this.registerDriverForTracking(client, {
        firebaseId,
        initialLocation: initialPosition,
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clean up driver data (service handles the logic)
    this.locationService.unregisterDriver(client.id);
  }

  /**
   * Register driver for location tracking
   */
  @SubscribeMessage('driver:connect')
  async registerDriverForTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DriverConnectionDto,
  ) {
    try {
      const { firebaseId } = payload;

      this.locationService.registerDriver(client.id, payload);

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

  /**
   * Update driver availability status
   */
  @SubscribeMessage('driver:status_update')
  updateDriverStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: UpdateDriverLocationDto,
  ) {
    try {
      const { firebaseId, status } = payload;

      this.locationService.updateDriverStatus(firebaseId, status);

      this.logger.log(`Driver ${firebaseId} status updated: ${status}`);

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
   * Rider starts tracking a driver during trip
   */
  @SubscribeMessage('rider:track_driver')
  async trackDriver(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tripId: string; driverId: string },
  ) {
    try {
      const { tripId, driverId } = payload;

      // Join tracking room
      await client.join(`tracking:${driverId}`);

      // Send current driver location
      const currentLocation = this.locationService.getDriverLocation(driverId);
      if (currentLocation) {
        client.emit('driver:current_location', {
          driverId,
          location: {
            latitude: currentLocation.location?.latitude || '',
            longitude: currentLocation.location?.longitude || '',
          },
          status: currentLocation.status,
        });
      }

      this.logger.log(
        `Rider started tracking driver ${driverId} for trip ${tripId}`,
      );

      return {
        status: 'success',
        message: 'Started tracking driver',
      };
    } catch (error) {
      this.logger.error(`Failed to start tracking:`, error);
      return {
        status: 'error',
        message: 'Failed to start tracking',
      };
    }
  }

  /**
   * Stop tracking driver
   */
  @SubscribeMessage('rider:stop_tracking')
  async stopTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { driverId: string },
  ) {
    const { driverId } = payload;
    await client.leave(`tracking:${driverId}`);

    return {
      status: 'success',
      message: 'Stopped tracking driver',
    };
  }
}
