import { Suspense } from 'react';
import { getCompanyEvents, type Event } from '@/app/actions';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TokenLimitError from '@/components/token-limit-error';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ClientEventCalendar } from '@/components/client-side-event-calendar';
import { EventTypeTag } from '@/components/event-type-tag';

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

function EventCalendar({ events, selectedDate }: { events: Event[], selectedDate?: Date }) {
  const selectedDateEvents = selectedDate
    ? events.filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>All Events Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex">
        <div className="w-1/2">
          {/* <ClientSideEventCalendar events={events} selectedDate={selectedDate} /> */}
        </div>
        <div className="w-1/2 pl-4">
          {selectedDate && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Events on {format(selectedDate, 'MMMM d, yyyy')}:
              </h3>
              {selectedDateEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Link</TableHead>
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
                          <TableCell>
                            <EventTypeTag type={event.eventType} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p>No events on this date.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

async function EventsResults({ tickerInput }: { tickerInput: string }) {
  const results = await getCompanyEvents(tickerInput);
  const allEvents = results.flatMap(result => 
    'events' in result && result.events ? result.events.map(event => ({ ...event, ticker: result.ticker })) : []
  ).filter(event => event !== undefined) as (Event & { ticker: string })[];


  return (
    <div className="space-y-6">
      <ClientEventCalendar events={allEvents} />
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
  searchParams: { tickers?: string }
}) {
  const tickers = searchParams.tickers ?? '';

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
          <EventsResults tickerInput={tickers} />
        </Suspense>
      )}
    </div>
  );
}