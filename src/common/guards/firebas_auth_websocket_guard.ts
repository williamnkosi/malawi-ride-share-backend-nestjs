import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthenticatedSocket } from './firebase_auth_guard_types';

@Injectable()
export class WsFirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FirebaseService) private readonly firebaseService: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    // Extract and verify token (only from connection, not message data)
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      // Verify token using Firebase Admin SDK
      const decodedToken: DecodedIdToken = await this.firebaseService
        .getAuth()
        .verifyIdToken(token);

      client.user = decodedToken; // Attach user ID to the socket
      client.firebaseId = decodedToken.uid; // Attach Firebase ID to the socket
      return true;
    } catch (error) {
      throw new WsException(`Invalid token: ${error}`);
    }
  }

  /**
   * Extract Firebase token from WebSocket connection
   * Only checks connection-level auth (not message data)
   */
  private extractToken(client: AuthenticatedSocket): string | null {
    // Option 1: From WebSocket handshake auth object
    if (client.handshake?.auth?.token) {
      return client.handshake.auth.token as string;
    }

    // Option 2: From WebSocket handshake headers (Authorization: Bearer <token>)
    const authHeader = client.handshake?.headers?.authorization;
    if (
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      return authHeader.substring(7);
    }

    return null;
  }
}
