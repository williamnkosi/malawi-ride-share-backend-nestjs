import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from 'src/common/guards/firebase_auth_guard_types';
import { TripService } from './trip.service';
import { AcceptTripDto } from 'src/common/dto/trip/accept_trip.dto';
import { FirebaseService } from 'src/firebase/firebase.service';

import { UsersService } from 'src/users/users.service';
import { WebSocketAuthUtil } from 'src/common/utils/websocket-auth.util';
import { SequentialNotifcationService } from './services/sequential_notifcation/sequential_notifcation.service';
import { RejectTripDto } from 'src/common/dto/trip/reject_trip.dto';
@WebSocketGateway({
  namespace: '/trips',
  cors: { origin: '*' },
})
export class TripGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(TripGateway.name);

  constructor(
    private readonly tripService: TripService,
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
    private readonly sequentialNotificationService: SequentialNotifcationService,
  ) {}

  // Add authentication middleware for the trips namespace
  afterInit(server: Server) {
    WebSocketAuthUtil.applyAuthMiddleware(
      server,
      this.firebaseService,
      this.usersService,
      this.logger,
      {
        gatewayName: 'Trip Gateway',
      },
    );
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Trip Gateway - Client connected: ${client.id}`);

    try {
      await this.tripService.handleUserConnection(client);
    } catch (error) {
      this.logger.error(`Failed to setup user ${client.userId}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Trip Gateway - Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('trip:accept')
  async handleAcceptTrip(
    @MessageBody() dto: AcceptTripDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // 1. Check if this acceptance is valid (trip was waiting for this driver)
      const isValidAcceptance =
        this.sequentialNotificationService.handleDriverAccept(
          dto.tripId,
          client.userId,
        );

      if (!isValidAcceptance) {
        // Driver tried to accept a trip that wasn't offered to them or already expired
        client.emit('trip:accept_error', {
          message: 'Trip is no longer available or was not offered to you',
          tripId: dto.tripId,
        });
        return;
      }

      // 2. Update trip status in database
      await this.tripService.acceptTrip(this.server, dto.tripId, client.userId);

      this.logger.log(`Driver ${client.userId} accepted trip ${dto.tripId}`);
    } catch (error) {
      this.logger.error(`Error accepting trip ${dto.tripId}:`, error);
      client.emit('trip:accept_error', {
        message: 'Failed to accept trip',
        tripId: dto.tripId,
      });
    }
  }

  @SubscribeMessage('trip:reject')
  handleRejectTrip(
    @MessageBody() dto: RejectTripDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Notify the sequential service
    this.sequentialNotificationService.handleDriverReject(
      dto.tripId,
      client.userId,
    );
  }
}
