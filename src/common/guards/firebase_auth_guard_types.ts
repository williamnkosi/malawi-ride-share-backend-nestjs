export interface AuthenticatedRequest extends Request {
  user?: string; // You can use a stricter type for user if you know its shape
}
