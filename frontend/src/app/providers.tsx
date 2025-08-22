'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Toaster } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#f59e0b',
          colorBackground: '#1e293b',
          colorInputBackground: '#334155',
          colorInputText: '#f8fafc',
          colorText: '#f8fafc',
          borderRadius: '0.75rem',
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            '&:hover': { backgroundColor: '#d97706' },
          },
          card: { backgroundColor: '#1e293b', border: '1px solid #475569' },
          userButtonAvatarBox: { width: '2.5rem', height: '2.5rem' },
          userButtonPopoverCard: {
            backgroundColor: '#1e293b',
            border: '1px solid #475569',
          },
          userButtonPopoverActionButton: {
            '&:hover': { backgroundColor: '#334155' },
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Toaster>{children}</Toaster>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
