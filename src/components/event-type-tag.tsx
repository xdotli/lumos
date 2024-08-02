'use client';

import React from 'react';

type EventType = 'Earnings Calls' | 'Conference' | 'Shareholder Meeting' | 'Other';

const tagColors: Record<EventType, string> = {
  'Earnings Calls': 'bg-blue-100 text-blue-800',
  'Conference': 'bg-green-100 text-green-800',
  'Shareholder Meeting': 'bg-purple-100 text-purple-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export function EventTypeTag({ type }: { type: EventType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColors[type]}`}>
      {type}
    </span>
  );
}