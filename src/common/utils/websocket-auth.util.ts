import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  UserType,
} from '../guards/firebase_auth_guard_types';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';

/**
 * Centralized WebSocket authentication middleware factory
 * Creates authentication middleware for WebSocket gateways
 */
export class WebSocketAuthUtil {
  /**
   * Creates authentication middleware for a WebSocket server
   *
   * @param firebaseService - Firebase service for token verification
   * @param usersService - Users service for database lookup
   * @param logger - Logger instance for logging
   * @param requireUserType - Optional: require specific user type (e.g., only DRIVER)
   * @returns Middleware function to be used with server.use()
   */
  static createAuthMiddleware(
    firebaseService: FirebaseService,
    usersService: UsersService,
    logger: Logger,
    options?: {
      requireUserType?: UserType;
      gatewayName?: string;
    },
  ) {
    return (socket: Socket, next: (err?: Error) => void) => {
      void (async () => {
        try {
          const token = socket.handshake.auth?.token as string;
          const userType = socket.handshake.auth?.userType as UserType;
          const gatewayName = options?.gatewayName || 'WebSocket Gateway';

          // Validate token presence
          if (!token) {
            logger.warn(`[${gatewayName}] No token provided - disconnecting`);
            return next(new Error('Authentication error: No token provided'));
          }

          // Validate user type presence (unless it's not required)
          if (!userType && !options?.requireUserType) {
            logger.warn(
              `[${gatewayName}] No user type provided - disconnecting`,
            );
            return next(
              new Error('Authentication error: No user type provided'),
            );
          }

          // Verify Firebase token
          const decodedToken = await firebaseService
            .getAuth()
            .verifyIdToken(token);

          // Lookup user in database
          const user = await usersService.findByFirebaseId(decodedToken.uid);

          if (!user) {
            logger.warn(`[${gatewayName}] User not found: ${decodedToken.uid}`);
            return next(new Error('Authentication error: User not found'));
          }

          // If specific user type is required, validate it
          if (options?.requireUserType) {
            const actualUserType = userType || options.requireUserType;
            if (
              options.requireUserType === UserType.DRIVER &&
              actualUserType !== UserType.DRIVER
            ) {
              logger.warn(
                `[${gatewayName}] Invalid user type. Expected ${options.requireUserType}, got ${actualUserType}`,
              );
              return next(
                new Error(
                  `Authentication error: Only ${options.requireUserType}s allowed`,
                ),
              );
            }
          }

          // Enrich socket with authenticated user data
          (socket as AuthenticatedSocket).firebaseId = decodedToken.uid;
          (socket as AuthenticatedSocket).user = decodedToken;
          (socket as AuthenticatedSocket).userId = user.id;
          (socket as AuthenticatedSocket).userType =
            userType || options?.requireUserType || UserType.DRIVER;

          logger.log(
            `✅ [${gatewayName}] Authentication successful for ${userType || options?.requireUserType}: ${decodedToken.uid}`,
          );

          next();
        } catch (error) {
          logger.error(
            `[${options?.gatewayName || 'WebSocket Gateway'}] Authentication error:`,
            error,
          );
          return next(new Error('Authentication error'));
        }
      })();
    };
  }

  /**
   * Apply authentication middleware to a WebSocket server
   *
   * @param server - Socket.IO server instance
   * @param firebaseService - Firebase service
   * @param usersService - Users service
   * @param logger - Logger instance
   * @param options - Optional configuration
   */
  static applyAuthMiddleware(
    server: Server,
    firebaseService: FirebaseService,
    usersService: UsersService,
    logger: Logger,
    options?: {
      requireUserType?: UserType;
      gatewayName?: string;
    },
  ): void {
    const middleware = this.createAuthMiddleware(
      firebaseService,
      usersService,
      logger,
      options,
    );

    server.use(middleware);
  }
}
