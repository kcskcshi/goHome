import React from 'react';
import { cn } from '@/lib/utils';

type Tab = {
  label: string;
  value: string;
};

type TabsProps = {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-2 border-b border-gray-200', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? 'border-b-2 border-blue-500 text-blue-600 bg-gray-50'
              : 'text-gray-500 hover:text-blue-600'
          )}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 