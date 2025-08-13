import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  AuthenticatedSocket,
  UserType,
} from 'src/common/guards/firebase_auth_guard_types';
import { TripService } from './trip.service';
import { AcceptTripDto } from 'src/common/dto/trip/accept_trip.dto';
import {
  DriverTripMessage,
  DriverTripResponse,
  RiderTripNotification,
} from './models/driver_trip_message';
@WebSocketGateway({
  namespace: 'trips',
  cors: { origin: '*' },
})
export class TripGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(TripGateway.name);

  constructor(private readonly tripService: TripService) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Trip Gateway - Client connected: ${client.id}`);

    const userType = client.handshake.auth?.userType as UserType;
    const userId = client.firebaseId;

    if (!userId) {
      this.logger.warn('No Firebase ID - disconnecting');
      client.disconnect();
      return;
    }
    if (!userType) {
      this.logger.warn('No user type provided - disconnecting');
      client.disconnect();
      return;
    }
    if (userType === UserType.DRIVER) {
      this.tripService.registerUserSocket(client);
      await client.join(`driver:${userId}`);
      await client.join('available-drivers'); // For trip broadcasts
      this.logger.log(`Driver ${userId} connected to trip gateway`);
    } else if (userType === UserType.RIDER) {
      this.tripService.registerUserSocket(client);
      await client.join(`rider:${userId}`);
      this.logger.log(`Rider ${userId} connected to trip gateway`);
    } else {
      this.logger.warn(`Unknown user type:`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Trip Gateway - Client disconnected: ${client.id}`);

    this.tripService.unregisterUserSocket(client);
  }

  // ==================== DRIVER TRIP EVENTS ====================

  /**
   * Driver accepts a trip request
   */
  @SubscribeMessage(DriverTripMessage.ACCEPT_TRIP)
  handleAcceptTrip(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: AcceptTripDto,
  ) {
    try {
      this.logger.log(`Driver ${data.driverId} accepting trip ${data.tripId}`);

      // Verify this is a driver
      if (client.userType !== UserType.DRIVER) {
        client.emit(DriverTripResponse.ERROR, {
          message: 'Only drivers can accept trips',
        });
        return;
      }

      // Accept the trip (this would update the trip status in database)
      // const updatedTrip = await this.tripService.acceptTrip(data.tripId, data.driverId);

      // Notify the rider that their trip was accepted
      this.server
        .to(`rider:${data.tripId}`)
        .emit(RiderTripNotification.TRIP_ACCEPTED, {
          tripId: data.tripId,
          driverId: data.driverId,
          message: 'Your trip has been accepted by a driver',
        });

      // Confirm to driver
      client.emit(DriverTripResponse.ACCEPTANCE_CONFIRMED, {
        tripId: data.tripId,
        message: 'Trip accepted successfully',
      });

      this.logger.log(
        `Trip ${data.tripId} accepted by driver ${data.driverId}`,
      );
    } catch (error) {
      this.logger.error('Error accepting trip:', error);
      client.emit(DriverTripResponse.ERROR, {
        message: 'Failed to accept trip',
      });
    }
  }

  /**
   * Driver rejects a trip request
   */
  @SubscribeMessage(DriverTripMessage.REJECT_TRIP)
  async handleRejectTrip(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tripId: string; reason?: string },
  ) {
    try {
      this.logger.log(
        `Driver ${client.firebaseId} rejecting trip ${data.tripId}`,
      );

      if (client.userType !== UserType.DRIVER) {
        client.emit(DriverTripResponse.ERROR, {
          message: 'Only drivers can reject trips',
        });
        return;
      }

      // Remove driver from available drivers for this specific trip
      await client.leave(`trip:${data.tripId}:drivers`);

      // Confirm to driver
      client.emit(DriverTripResponse.REJECTION_CONFIRMED, {
        tripId: data.tripId,
        message: 'Trip rejected',
      });

      this.logger.log(
        `Trip ${data.tripId} rejected by driver ${client.firebaseId}`,
      );
    } catch (error) {
      this.logger.error('Error rejecting trip:', error);
      client.emit(DriverTripResponse.ERROR, {
        message: 'Failed to reject trip',
      });
    }
  }

  /**
   * Driver starts the trip (arrived at pickup and rider is in vehicle)
   */
  @SubscribeMessage(DriverTripMessage.START_TRIP)
  handleStartTrip(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tripId: string },
  ) {
    try {
      this.logger.log(
        `Driver ${client.firebaseId} starting trip ${data.tripId}`,
      );

      if (client.userType !== UserType.DRIVER) {
        client.emit(DriverTripResponse.ERROR, {
          message: 'Only drivers can start trips',
        });
        return;
      }

      // Update trip status to started
      // const updatedTrip = await this.tripService.startTrip(data.tripId, client.firebaseId);

      // Notify rider that trip has started
      this.server
        .to(`rider:${data.tripId}`)
        .emit(RiderTripNotification.TRIP_STARTED, {
          tripId: data.tripId,
          driverId: client.firebaseId,
          message: 'Your trip has started',
          startedAt: new Date(),
        });

      // Confirm to driver
      client.emit(DriverTripResponse.START_CONFIRMED, {
        tripId: data.tripId,
        message: 'Trip started successfully',
      });

      this.logger.log(
        `Trip ${data.tripId} started by driver ${client.firebaseId}`,
      );
    } catch (error) {
      this.logger.error('Error starting trip:', error);
      client.emit(DriverTripResponse.ERROR, {
        message: 'Failed to start trip',
      });
    }
  }

  /**
   * Driver completes the trip (arrived at destination)
   */
  @SubscribeMessage(DriverTripMessage.COMPLETE_TRIP)
  async handleCompleteTrip(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      tripId: string;
      endLocation?: { latitude: number; longitude: number };
    },
  ) {
    try {
      this.logger.log(
        `Driver ${client.firebaseId} completing trip ${data.tripId}`,
      );

      if (client.userType !== UserType.DRIVER) {
        client.emit(DriverTripResponse.ERROR, {
          message: 'Only drivers can complete trips',
        });
        return;
      }

      // Update trip status to completed
      // const completedTrip = await this.tripService.completeTrip(data.tripId, client.firebaseId, data.endLocation);

      // Notify rider that trip is completed
      this.server
        .to(`rider:${data.tripId}`)
        .emit(RiderTripNotification.TRIP_COMPLETED, {
          tripId: data.tripId,
          driverId: client.firebaseId,
          message: 'Your trip has been completed',
          completedAt: new Date(),
          endLocation: data.endLocation,
        });

      // Confirm to driver
      client.emit(DriverTripResponse.COMPLETION_CONFIRMED, {
        tripId: data.tripId,
        message: 'Trip completed successfully',
      });

      // Driver becomes available again
      await client.join('available-drivers');

      this.logger.log(
        `Trip ${data.tripId} completed by driver ${client.firebaseId}`,
      );
    } catch (error) {
      this.logger.error('Error completing trip:', error);
      client.emit(DriverTripResponse.ERROR, {
        message: 'Failed to complete trip',
      });
    }
  }

  /**
   * Driver cancels an accepted trip
   */
  @SubscribeMessage(DriverTripMessage.CANCEL_TRIP)
  async handleDriverCancelTrip(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { tripId: string; reason: string },
  ) {
    try {
      this.logger.log(
        `Driver ${client.firebaseId} canceling trip ${data.tripId}`,
      );

      if (client.userType !== UserType.DRIVER) {
        client.emit(DriverTripResponse.ERROR, {
          message: 'Only drivers can cancel trips',
        });
        return;
      }

      // Update trip status to cancelled
      // const cancelledTrip = await this.tripService.cancelTrip(data.tripId, client.firebaseId, data.reason);

      // Notify rider about cancellation
      this.server
        .to(`rider:${data.tripId}`)
        .emit(RiderTripNotification.TRIP_CANCELLED_BY_DRIVER, {
          tripId: data.tripId,
          driverId: client.firebaseId,
          reason: data.reason,
          message: 'Your trip has been cancelled by the driver',
          cancelledAt: new Date(),
        });

      // Confirm to driver
      client.emit(DriverTripResponse.CANCELLATION_CONFIRMED, {
        tripId: data.tripId,
        message: 'Trip cancelled successfully',
      });

      // Driver becomes available again
      await client.join('available-drivers');

      this.logger.log(
        `Trip ${data.tripId} cancelled by driver ${client.firebaseId}`,
      );
    } catch (error) {
      this.logger.error('Error cancelling trip:', error);
      client.emit(DriverTripResponse.ERROR, {
        message: 'Failed to cancel trip',
      });
    }
  }

  /**
   * Driver updates their arrival status (e.g., "arriving", "arrived")
   */
  @SubscribeMessage(DriverTripMessage.UPDATE_ARRIVAL_STATUS)
  handleUpdateArrivalStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { tripId: string; status: 'en_route' | 'arriving' | 'arrived' },
  ) {
    try {
      this.logger.log(
        `Driver ${client.firebaseId} updating arrival status for trip ${data.tripId}: ${data.status}`,
      );

      if (client.userType !== UserType.DRIVER) {
        client.emit(DriverTripResponse.ERROR, {
          message: 'Only drivers can update arrival status',
        });
        return;
      }

      // Notify rider about driver status
      this.server
        .to(`rider:${data.tripId}`)
        .emit(RiderTripNotification.DRIVER_STATUS_UPDATE, {
          tripId: data.tripId,
          driverId: client.firebaseId,
          status: data.status,
          updatedAt: new Date(),
        });

      // Confirm to driver
      client.emit(DriverTripResponse.STATUS_UPDATE_CONFIRMED, {
        tripId: data.tripId,
        status: data.status,
      });
    } catch (error) {
      this.logger.error('Error updating arrival status:', error);
      client.emit(DriverTripResponse.ERROR, {
        message: 'Failed to update arrival status',
      });
    }
  }
}
