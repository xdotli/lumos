'use client';

import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Event } from '@/app/actions';

export function ClientSideEventCalendar({ events, selectedDate }: { events: Event[], selectedDate?: Date }) {
  const router = useRouter();
  const eventDates = events.map(event => new Date(event.date));

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date: any) => {
        if (date) {
          const searchParams = new URLSearchParams(window.location.search);
          searchParams.set('date', format(date, 'yyyy-MM-dd'));
          router.push(`?${searchParams.toString()}`);
        }
      }}
      className="rounded-md border"
      modifiers={{
        hasEvent: (date: any) => eventDates.some(eventDate => 
          format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      }}
      modifiersStyles={{
        hasEvent: { fontWeight: 'bold', textDecoration: 'underline' }
      }}
    />
  );
}