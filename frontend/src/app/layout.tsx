import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WizCuts - Premium Barber Shop | Redefine Your Style',
  description:
    'Experience the art of sophisticated grooming at WizCuts. Luxury haircuts, traditional shaves, and premium grooming services in the heart of downtown.',
  keywords:
    "barber shop, haircuts, luxury grooming, traditional shaves, men's styling, premium barber",
  openGraph: {
    title: 'WizCuts - Premium Barber Shop',
    description: 'Redefine your style with our luxury grooming services',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#f59e0b', // amber-500
          colorBackground: '#1e293b', // slate-800
          colorInputBackground: '#334155', // slate-700
          colorInputText: '#f8fafc', // slate-50
          colorText: '#f8fafc', // slate-50
          borderRadius: '0.75rem', // rounded-xl
          fontFamily: 'Inter, sans-serif',
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: '#f59e0b',
            color: '#0f172a',
            '&:hover': {
              backgroundColor: '#d97706',
            },
          },
          card: {
            backgroundColor: '#1e293b',
            border: '1px solid #475569',
          },
          userButtonAvatarBox: {
            width: '2.5rem',
            height: '2.5rem',
          },
          userButtonPopoverCard: {
            backgroundColor: '#1e293b',
            border: '1px solid #475569',
          },
          userButtonPopoverActionButton: {
            '&:hover': {
              backgroundColor: '#334155',
            },
          },
        },
      }}
    >
      <html
        lang="en"
        className={`${playfairDisplay.variable} ${inter.variable}`}
      >
        <body className="antialiased bg-luxury-navy text-luxury-cream">
          <ErrorBoundary>
            <Toaster>{children}</Toaster>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
