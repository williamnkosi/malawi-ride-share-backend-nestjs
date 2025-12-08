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
  handleAcceptTrip(
    @MessageBody() dto: AcceptTripDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Notify the sequential service
    this.sequentialNotificationService.handleDriverAccept(
      dto.tripId,
      client.userId,
    );

    // Rest of acceptance logic...
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
