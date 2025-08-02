import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { Socket } from 'socket.io';

export interface AuthenticatedRequest extends Request {
  user?: string; // You can use a stricter type for user if you know its shape
}

export interface AuthenticatedSocket extends Socket {
  user: DecodedIdToken; // Firebase UID or database ID
  firebaseId: string;
}
