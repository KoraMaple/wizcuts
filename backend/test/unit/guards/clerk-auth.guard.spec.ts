/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Mock the Clerk SDK before importing the guard
const mockVerifyToken = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@clerk/clerk-sdk-node', () => ({
  clerkClient: {
    verifyToken: mockVerifyToken,
    users: {
      getUser: mockGetUser,
    },
  },
}));

import { ClerkAuthGuard } from '../../../src/guards/clerk-auth.guard';

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (headers: Record<string, string> = {}) => {
    const mockRequest = {
      headers,
      user: null,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no authorization header', async () => {
      // Arrange
      const context = createMockContext();

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Authentication failed'
      );
    });

    it('should allow access when valid token is provided', async () => {
      // Arrange
      const context = createMockContext({
        authorization: 'Bearer valid_token_123',
      });

      const mockPayload = {
        sub: 'user_123',
      };

      const mockUser = {
        id: 'user_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
      };

      mockVerifyToken.mockResolvedValue(mockPayload);
      mockGetUser.mockResolvedValue(mockUser);

      // Act
      const result = await guard.canActivate(context);
      const request = context.switchToHttp().getRequest();

      // Assert
      expect(result).toBe(true);
      expect(mockVerifyToken).toHaveBeenCalledWith('valid_token_123');
      expect(mockGetUser).toHaveBeenCalledWith('user_123');
      expect(request.user).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });
});
