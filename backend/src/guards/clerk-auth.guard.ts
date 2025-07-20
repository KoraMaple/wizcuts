import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import type { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: any }>();

    try {
      const authHeader = request.headers.authorization as string;

      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException('No valid authorization header');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the session token with Clerk
      const payload = await clerkClient.verifyToken(token);

      if (!payload?.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get user details from Clerk
      const user = await clerkClient.users.getUser(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user info to request
      request.user = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };

      return true;
    } catch (err) {
      console.error('Authentication failed:', err);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
