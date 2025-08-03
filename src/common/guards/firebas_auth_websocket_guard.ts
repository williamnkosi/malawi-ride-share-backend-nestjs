import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthenticatedSocket, UserType } from './firebase_auth_guard_types';

@Injectable()
export class WsFirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();

    if (!client.handshake?.auth?.token) {
      throw new WsException('No token provided');
    }

    try {
      const token = client.handshake.auth.token as string;
      const decodedToken: DecodedIdToken = await this.firebaseService
        .getAuth()
        .verifyIdToken(token);

      client.user = decodedToken;

      // Extract user type from the client
      const userType = this.extractUserType(client);
      client.userType = userType;

      client.firebaseId = decodedToken.uid;

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new WsException(`Authentication failed: ${errorMessage}`);
    }
  }

  /**
   * Extracts the user type from the authenticated socket client
   * @param client - The authenticated WebSocket client
   * @returns The user type ('driver' | 'rider')
   * @throws WsException if user type cannot be determined
   */
  private extractUserType(client: AuthenticatedSocket): UserType {
    // Check if userType is already set in handshake query or auth
    if (client.handshake?.query?.userType) {
      const userType = client.handshake.query.userType as string;
      if (userType === 'driver' || userType === 'rider') {
        return userType as UserType;
      }
    }

    // Check if userType is in auth object
    if (client.handshake?.auth?.userType) {
      const userType = client.handshake.auth.userType as string;
      if (userType === 'driver' || userType === 'rider') {
        return userType as UserType;
      }
    }

    // Check custom claims in the Firebase token
    if (client.user?.userType) {
      const userType = client.user.userType as string;
      if (userType === 'driver' || userType === 'rider') {
        return userType as UserType;
      }
    }

    // If no user type is found, throw an exception
    throw new WsException(
      'User type not specified or invalid. Must be "driver" or "rider"',
    );
  }
}
