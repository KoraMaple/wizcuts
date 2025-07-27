import { Injectable, Logger } from '@nestjs/common';
import { SupabaseConfigService } from '../config/supabase.config';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeEvent {
  type:
    | 'booking_created'
    | 'booking_updated'
    | 'booking_cancelled'
    | 'barber_updated';
  payload: Record<string, unknown>;
  timestamp: Date;
}

interface BroadcastPayload {
  event: string;
  payload: {
    timestamp: string;
    [key: string]: unknown;
  };
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(private readonly supabaseConfig: SupabaseConfigService) {}

  // Broadcast event to all connected clients
  async broadcastEvent(
    channelName: string,
    event: RealtimeEvent
  ): Promise<void> {
    try {
      const client = this.supabaseConfig.getClient();

      const channel = client.channel(channelName);

      await channel.send({
        type: 'broadcast',
        event: event.type,
        payload: {
          ...event.payload,
          timestamp: event.timestamp.toISOString(),
        },
      });

      this.logger.log(
        `Event broadcasted on channel ${channelName}: ${event.type}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to broadcast event: ${errorMessage}`, error);
    }
  }

  // Subscribe to booking updates
  subscribeToBookings(callback: (event: RealtimeEvent) => void): () => void {
    const client = this.supabaseConfig.getClient();
    const channelName = 'bookings';

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: '*' }, (payload: BroadcastPayload) => {
        const event: RealtimeEvent = {
          type: payload.event as RealtimeEvent['type'],
          payload: payload.payload,
          timestamp: new Date(payload.payload.timestamp),
        };
        callback(event);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      void channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Subscribe to barber updates
  subscribeToBarbers(callback: (event: RealtimeEvent) => void): () => void {
    const client = this.supabaseConfig.getClient();
    const channelName = 'barbers';

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: '*' }, (payload: BroadcastPayload) => {
        const event: RealtimeEvent = {
          type: payload.event as RealtimeEvent['type'],
          payload: payload.payload,
          timestamp: new Date(payload.payload.timestamp),
        };
        callback(event);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      void channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Subscribe to database changes (requires RLS setup)
  subscribeToTableChanges(
    table: string,
    callback: (payload: Record<string, unknown>) => void
  ): () => void {
    const client = this.supabaseConfig.getClient();
    const channelName = `table-${table}`;

    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      void channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.channels.forEach((channel, channelName) => {
      void channel.unsubscribe();
      this.logger.log(`Unsubscribed from channel: ${channelName}`);
    });
    this.channels.clear();
  }
}
