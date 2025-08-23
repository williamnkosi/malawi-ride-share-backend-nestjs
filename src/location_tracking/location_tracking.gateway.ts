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
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocationTrackingService } from './location_tracking.service';
import {
  DriverConnectionDto,
  UpdateDriverLocationDto,
  LocationDto,
} from './location_tracking.dto';

import { AuthenticatedSocket } from 'src/common/guards/firebase_auth_guard_types';
import { FirebaseService } from 'src/firebase/firebase.service';

@WebSocketGateway({
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
  ) {}

  afterInit(server: Server) {
    server.use((socket, next) => {
      void (async () => {
        try {
          const token = socket.handshake.auth?.token as string;
          if (!token) {
            this.logger.warn('No token provided - disconnecting');
            return next(new Error('Authentication error: No token provided'));
          }

          const decodedToken = await this.firebaseService
            .getAuth()
            .verifyIdToken(token);

          console.log(`✅ Token verified for user: ${decodedToken.uid}`);

          // ✅ THIS WAS MISSING: Set the firebaseId on the socket
          (socket as AuthenticatedSocket).firebaseId = decodedToken.uid;
          (socket as AuthenticatedSocket).user = decodedToken;
          next();
        } catch (error) {
          this.logger.error('Error during authentication', error);
          return next(new Error('Authentication error'));
        }
      })();
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    console.log('=== WEBSOCKET CONNECTION ===');
    console.log(`Client connected: ${client.id}`);
    this.logger.log(`Client connected: ${client.id}`);

    // Get initial position from auth (this is OK as additional data)
    const firebaseId = client.handshake.auth?.firebaseId as string;
    if (!firebaseId) {
      this.logger.warn('No authenticated Firebase ID found - disconnecting');
      return client.disconnect();
    }
    const initialPosition = client.handshake.auth?.initialPosition as
      | LocationDto
      | undefined;

    this.logger.log('Authenticated Firebase ID:', firebaseId);
    this.logger.log('Initial location from auth:', initialPosition);

    if (client.firebaseId) {
      console.log('Auto-registering authenticated driver with location...');
      await this.registerDriverForTracking(client, {
        initialLocation: initialPosition,
      });
    } else {
      this.logger.warn(
        'No authenticated Firebase ID found - connection should have been rejected by guard',
      );
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
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: DriverConnectionDto,
  ) {
    try {
      await this.locationService.registerDriver(client, payload);

      // Join driver-specific room
      await client.join(`driver:${client.firebaseId}`);

      this.logger.log(`Driver ${client.firebaseId} registered for tracking`);

      return {
        status: 'success',
        message: 'Driver registered for location tracking',
        firebaseId: client.firebaseId,
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
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: UpdateDriverLocationDto,
  ) {
    try {
      const updatedLocation = await this.locationService.updateDriverLocation(
        client.firebaseId,
        payload,
      );

      this.logger.log('received driver location update', {
        driverId: client.firebaseId,
        latitude: updatedLocation.location?.latitude,
        longitude: updatedLocation.location?.longitude,
        status: updatedLocation.status,
      });

      // Broadcast to riders tracking this driver
      this.server
        .to(`tracking:${client.firebaseId}`)
        .emit('driver:location_changed', {
          driverId: client.firebaseId,
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

      this.locationService.updateDriverStatus(client.firebaseId, status);

      this.logger.log(`Driver ${client.firebaseId} status updated: ${status}`);

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
