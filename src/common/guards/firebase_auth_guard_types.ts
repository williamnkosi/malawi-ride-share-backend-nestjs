import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { Socket } from 'socket.io';

export enum UserType {
  DRIVER = 'driver',
  RIDER = 'rider',
}
export interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
  firebaseId: string;
  userId: string; // Database user ID
  userType?: UserType;
}

export interface AuthenticatedSocket extends Socket {
  user: DecodedIdToken; // Firebase UID or database ID
  firebaseId: string;
  userType: UserType;
  userId: string; // Database user ID
}
