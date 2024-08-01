import { Suspense } from 'react';
import { getCompanyEvents, type Event } from '@/app/actions';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TokenLimitError from '@/components/token-limit-error';
import { ExternalLink } from 'lucide-react';

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Event Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event: Event, index: number) => (
            <TableRow key={index}>
              <TableCell>{event.eventName}</TableCell>
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
  );
}

async function EventsCards({ tickerInput }: { tickerInput: string }) {
  const results = await getCompanyEvents(tickerInput);

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{result.ticker}</CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              result.error === 'TOKEN_LIMIT_EXCEEDED' ? (
                <TokenLimitError ticker={result.ticker} irPageUrl={result.irPageUrl} />
              ) : (
                <p>Error: {result.error}</p>
              )
            ) : (
              result.events ? (
                <EventsTable ticker={result.ticker} events={result.events} irPageUrl={result.irPageUrl} />
              ) : (
                <p>No events available</p>
              )
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
    <div className="container mx-auto py-10">
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
          <EventsCards tickerInput={tickers} />
        </Suspense>
      )}
    </div>
  );
}