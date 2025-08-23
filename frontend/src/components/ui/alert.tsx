'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
}

const variantStyles: Record<NonNullable<AlertProps['variant']>, string> = {
  info: 'border-primary-600/40 bg-primary-600/10 text-primary-200',
  success: 'border-success-600/40 bg-success-600/10 text-success-200',
  warning: 'border-warning-600/40 bg-warning-600/10 text-warning-200',
  destructive: 'border-error-600/40 bg-error-600/10 text-error-200',
};

export const Alert = ({
  className,
  variant = 'info',
  ...props
}: AlertProps) => (
  <div
    role="status"
    className={cn(
      'w-full rounded-md border p-4 text-sm',
      variantStyles[variant],
      className
    )}
    {...props}
  />
);
