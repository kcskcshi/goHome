import { cn } from '@/lib/utils';
import React from 'react';

const badgeVariants = {
  default: 'bg-gray-900 text-white',
  success: 'bg-green-500 text-white',
  destructive: 'bg-red-500 text-white',
  outline: 'border border-gray-300 text-gray-900',
  secondary: 'bg-gray-200 text-gray-700',
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: keyof typeof badgeVariants;
  className?: string;
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
} 