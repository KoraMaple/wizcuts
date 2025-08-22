'use client';

import React from 'react';
import { useAvailability } from '@/features/booking/hooks/useAvailability';

export default function AvailabilityDebugPage() {
  const [date, setDate] = React.useState<string>('');
  const [serviceId, setServiceId] = React.useState<number | ''>('');
  const [barberId, setBarberId] = React.useState<number | ''>('');

  const { data, isFetching, isError, error, refetch, isFetched } =
    useAvailability({
      date,
      serviceId: typeof serviceId === 'number' ? serviceId : undefined,
      barberId: typeof barberId === 'number' ? barberId : undefined,
    });

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Availability Debug</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label>
          <div>Date (YYYY-MM-DD)</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ padding: 8, width: '100%' }}
          />
        </label>

        <label>
          <div>Service ID</div>
          <input
            type="number"
            value={serviceId}
            onChange={e =>
              setServiceId(e.target.value ? Number(e.target.value) : '')
            }
            placeholder="e.g. 1"
            style={{ padding: 8, width: '100%' }}
          />
        </label>

        <label>
          <div>Barber ID</div>
          <input
            type="number"
            value={barberId}
            onChange={e =>
              setBarberId(e.target.value ? Number(e.target.value) : '')
            }
            placeholder="e.g. 1"
            style={{ padding: 8, width: '100%' }}
          />
        </label>

        <button
          onClick={() => refetch()}
          disabled={!date || !serviceId || !barberId || isFetching}
          style={{
            padding: '8px 12px',
            background: '#f59e0b',
            color: '#0f172a',
            borderRadius: 8,
            border: '1px solid #d97706',
            cursor: 'pointer',
          }}
        >
          {isFetching ? 'Loading…' : 'Fetch Availability'}
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        {isError && (
          <div style={{ color: 'tomato' }}>
            {(error as Error)?.message ?? 'Error fetching availability'}
          </div>
        )}

        {isFetched && !isFetching && data?.length === 0 && (
          <div>No slots available.</div>
        )}

        {data && data.length > 0 && (
          <ul style={{ marginTop: 8 }}>
            {data.map((s, idx) => (
              <li key={idx}>
                {new Date(s.start).toLocaleString()} →{' '}
                {new Date(s.end).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
