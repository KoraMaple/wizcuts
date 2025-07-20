import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

@Injectable()
export class ClerkAuthMiddleware implements NestMiddleware {
  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('No valid authorization header');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the session token with Clerk
      const payload = await clerkClient.verifyToken(token);

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get user details from Clerk
      const user = await clerkClient.users.getUser(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user info to request
      const primaryEmail = user.emailAddresses?.[0]?.emailAddress;
      if (!primaryEmail) {
        throw new UnauthorizedException('User email not found');
      }

      req.user = {
        id: user.id,
        email: primaryEmail,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
      };

      next();
    } catch (error: unknown) {
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Authentication error:', error);
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
