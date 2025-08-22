import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/system/ErrorBoundary';
import { Providers } from './providers';

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
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body className="antialiased bg-luxury-navy text-luxury-cream">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
