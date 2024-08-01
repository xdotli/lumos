import { Suspense } from 'react';
import { getCompanyEvents, type Event } from '@/app/actions';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TokenLimitError from '@/components/token-limit-error';
import { ExternalLink } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ClientSideEventCalendar } from '@/components/client-side-event-calendar';


export const maxDuration = 60;

interface EventsTableProps {
  ticker: string;
  events: Event[];
  irPageUrl: string;
}

function EventsTable({ ticker, events, irPageUrl }: EventsTableProps) {
  if (events.length === 0) {
    return <p>No events found for {ticker}.</p>;
  }

  return (
    <div>
      <div className="mb-4">
        <a 
          href={irPageUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
        >
          Visit {ticker}&apos;s Investor Relations Page
          <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Event Name</TableHead>
              <TableHead className="w-1/6">Link</TableHead>
              <TableHead className="w-1/6">Date</TableHead>
              <TableHead className="w-1/6">Time</TableHead>
              <TableHead className="w-1/6">Event Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event: Event, index: number) => (
              <TableRow key={index}>
                <TableCell className="break-words">{event.eventName}</TableCell>
                <TableCell>
                  <a 
                    href={event.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Link
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.time}</TableCell>
                <TableCell>{event.eventType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EventCalendar({ events }: { events: Event[] }) {
  const eventDates = events.map(event => new Date(event.date));
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>All Events Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="multiple"
          selected={eventDates}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  );
}

async function EventsResults({ tickerInput, selectedDate }: { tickerInput: string, selectedDate?: Date }) {
  const results = await getCompanyEvents(tickerInput);
  const allEvents = results.flatMap(result => 'events' in result ? result.events : []).filter(event => event !== undefined) as Event[];

  return (
    <div className="space-y-6">
      <EventCalendar events={allEvents} />
      {results.map((result, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{result.ticker}</CardTitle>
          </CardHeader>
          <CardContent>
            {'events' in result && result.events ? (
              <EventsTable ticker={result.ticker} events={result.events} irPageUrl={result.irPageUrl} />
            ) : result.error === 'TOKEN_LIMIT_EXCEEDED' ? (
              <TokenLimitError ticker={result.ticker} irPageUrl={result.irPageUrl} />
            ) : (
              <p>Error: {result.error}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function InvestorRelationsApp({
  searchParams
}: {
  searchParams: {
    date: string | number | Date; tickers?: string 
}
}) {
  const tickers = searchParams.tickers ?? '';
  const selectedDate = searchParams.date ? new Date(searchParams.date) : undefined;

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Investor Relations Webcasts Finder</CardTitle>
          <CardDescription>Enter tickers to find upcoming and past webcasts</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/" className="flex space-x-2 mb-4">
            <Input
              type="text"
              name="tickers"
              defaultValue={tickers}
              placeholder="Enter tickers (e.g., MSFT, AAPL, GOOGL)"
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {tickers && (
        <Suspense fallback={<p>The intelligent Lumosity agent is researching...</p>}>
          <EventsResults tickerInput={tickers} selectedDate={selectedDate} />
        </Suspense>
      )}
    </div>
  );
}