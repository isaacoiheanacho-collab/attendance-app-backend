import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // Or a specific type matching your JWT payload structure like { id: number; email: string }
    }
  }
}