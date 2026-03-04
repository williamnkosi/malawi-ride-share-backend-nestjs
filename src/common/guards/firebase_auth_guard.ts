import {
  Injectable,
  CanActivate,
  UnauthorizedException,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseService } from '../../firebase/firebase.service';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/users.entity';
import { AuthenticatedRequest, UserType } from './firebase_auth_guard_types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FirebaseService) private readonly firebaseAdmin: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decodedToken: DecodedIdToken = await this.firebaseAdmin
        .getAuth()
        .verifyIdToken(token);

      // Find the user in our database using the Firebase ID
      const user = await this.usersService.findByFirebaseId(decodedToken.uid);

      // Set user information on the request
      request.user = decodedToken;
      request.firebaseId = decodedToken.uid;
      request.userId = user.id; // Database user ID
      request.userType = this.getUserTypeFromUser(user);

      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token, ${error}`);
    }
  }

  /**
   * Determines user type based on the user's relationships
   */
  private getUserTypeFromUser(user: UserEntity): UserType {
    // Check if user has a driver relationship
    if (user.driver) {
      return UserType.DRIVER;
    }
    // Check if user has a rider relationship
    if (user.rider) {
      return UserType.RIDER;
    }
    // Default to rider if no specific relationship found
    return UserType.RIDER;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return type === 'Bearer' ? token : undefined;
  }
}
