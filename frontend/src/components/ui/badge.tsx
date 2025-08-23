'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive';
}

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: BadgeProps) => {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-primary-600 text-white',
    secondary: 'bg-gray-800 text-gray-100',
    outline: 'border border-gray-600 text-gray-200',
    success: 'bg-success-600 text-white',
    destructive: 'bg-error-600 text-white',
  };
  return <div className={cn(base, variants[variant], className)} {...props} />;
};
