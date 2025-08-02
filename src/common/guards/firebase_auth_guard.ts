import {
  Injectable,
  CanActivate,
  UnauthorizedException,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthenticatedRequest } from './firebase_auth_guard_types';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FirebaseService) private readonly firebaseAdmin: FirebaseService,
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.user = decodedToken.uid; // Add user info to request
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Invalid token, ${error}`);
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return type === 'Bearer' ? token : undefined;
  }
}
