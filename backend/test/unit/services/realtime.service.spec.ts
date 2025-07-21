/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import {
  RealtimeService,
  RealtimeEvent,
} from '../../../src/services/realtime.service';
import { SupabaseConfigService } from '../../../src/config/supabase.config';

// Mock Supabase client
const mockChannel = {
  send: jest.fn(),
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnThis(),
  unsubscribe: jest.fn(),
};

const mockSupabaseClient = {
  channel: jest.fn().mockReturnValue(mockChannel),
};

const mockSupabaseConfigService = {
  getClient: jest.fn().mockReturnValue(mockSupabaseClient),
};

describe('RealtimeService', () => {
  let service: RealtimeService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        RealtimeService,
        {
          provide: SupabaseConfigService,
          useValue: mockSupabaseConfigService,
        },
      ],
    }).compile();

    service = module.get<RealtimeService>(RealtimeService);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('broadcastEvent', () => {
    it('should broadcast an event to a channel', async () => {
      const event: RealtimeEvent = {
        type: 'booking_created',
        payload: {
          booking: { id: 1, customerName: 'John Doe' },
          action: 'created',
        },
        timestamp: new Date('2024-01-01T10:00:00Z'),
      };

      mockChannel.send.mockResolvedValue({ error: null });

      await service.broadcastEvent('bookings', event);

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('bookings');
      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'booking_created',
        payload: {
          booking: { id: 1, customerName: 'John Doe' },
          action: 'created',
          timestamp: '2024-01-01T10:00:00.000Z',
        },
      });
    });

    it('should handle broadcast errors', async () => {
      const event: RealtimeEvent = {
        type: 'booking_created',
        payload: { booking: { id: 1 } },
        timestamp: new Date(),
      };

      mockChannel.send.mockRejectedValue(new Error('Broadcast failed'));

      // Should not throw, just log the error
      await expect(
        service.broadcastEvent('bookings', event),
      ).resolves.toBeUndefined();
    });
  });

  describe('subscribeToBookings', () => {
    it('should subscribe to booking events and return unsubscribe function', () => {
      const callback = jest.fn();

      mockChannel.subscribe.mockReturnThis();

      const unsubscribe = service.subscribeToBookings(callback);

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('bookings');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'broadcast',
        { event: '*' },
        expect.any(Function),
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback when receiving booking events', () => {
      const callback = jest.fn();
      let eventHandler: any;

      mockChannel.on.mockImplementation((type, filter, handler) => {
        if (filter.event === '*') {
          eventHandler = handler;
        }
        return mockChannel;
      });
      mockChannel.subscribe.mockReturnThis();

      service.subscribeToBookings(callback);

      // Simulate receiving an event
      const mockPayload = {
        event: 'booking_created',
        payload: {
          booking: { id: 1, customerName: 'John Doe' },
          action: 'created',
          timestamp: '2024-01-01T10:00:00.000Z',
        },
      };

      eventHandler(mockPayload);

      expect(callback).toHaveBeenCalledWith({
        type: 'booking_created',
        payload: {
          booking: { id: 1, customerName: 'John Doe' },
          action: 'created',
          timestamp: '2024-01-01T10:00:00.000Z',
        },
        timestamp: new Date('2024-01-01T10:00:00.000Z'),
      });
    });
  });

  describe('subscribeToBarbers', () => {
    it('should subscribe to barber events and return unsubscribe function', () => {
      const callback = jest.fn();

      mockChannel.subscribe.mockReturnThis();

      const unsubscribe = service.subscribeToBarbers(callback);

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('barbers');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'broadcast',
        { event: '*' },
        expect.any(Function),
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('subscribeToTableChanges', () => {
    it('should subscribe to database table changes and return unsubscribe function', () => {
      const callback = jest.fn();

      mockChannel.subscribe.mockReturnThis();

      const unsubscribe = service.subscribeToTableChanges('bookings', callback);

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('table-bookings');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        callback,
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('cleanup', () => {
    it('should cleanup all active channels', () => {
      const callback = jest.fn();

      // Subscribe to multiple channels
      mockChannel.subscribe.mockReturnThis();
      service.subscribeToBookings(callback);
      service.subscribeToBarbers(callback);

      mockChannel.unsubscribe.mockReturnValue(undefined);

      service.cleanup();

      // Should have called unsubscribe for each channel
      expect(mockChannel.unsubscribe).toHaveBeenCalledTimes(2);
    });
  });
});
