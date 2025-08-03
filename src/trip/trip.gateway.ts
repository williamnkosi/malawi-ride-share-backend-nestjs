import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  AuthenticatedSocket,
  UserType,
} from 'src/common/guards/firebase_auth_guard_types';
import { TripService } from './trip.service';
@WebSocketGateway({
  namespace: '/location-tracking', // ✅ Add explicit namespace
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
}
