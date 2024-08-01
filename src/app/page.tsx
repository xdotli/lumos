import { Suspense } from 'react';
import { getCompanyEvents, type Event } from '@/app/actions';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TokenLimitError from '@/components/token-limit-error';
import { ExternalLink } from 'lucide-react';

export const maxDuration = 60;

async function EventsTable({ ticker }: { ticker: string }) {
  const result = await getCompanyEvents(ticker);

  if (!Array.isArray(result) && 'error' in result && result.error === 'TOKEN_LIMIT_EXCEEDED') {
    return <TokenLimitError ticker={ticker} irPageUrl={result.irPageUrl} />;
  }

  const { events, irPageUrl } = Array.isArray(result.events) ? result : { events: [], irPageUrl: '' };

  if (!Array.isArray(events) || events.length === 0) {
    return <p>No events found.</p>;
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

export default function InvestorRelationsApp({
  searchParams
}: {
  searchParams: { ticker?: string }
}) {
  const ticker = searchParams.ticker ?? '';

  return (
    <Card className="w-full max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Investor Relations Webcasts Finder</CardTitle>
        <CardDescription>Enter a ticker to find upcoming and past webcasts</CardDescription>
      </CardHeader>
      <CardContent>
        <form action="/" className="flex space-x-2 mb-4">
          <Input
            type="text"
            name="ticker"
            defaultValue={ticker}
            placeholder="Enter ticker (e.g., MSFT)"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </form>

        {ticker && (
          <Suspense fallback={<p>The intelligent Lumosity agent is researching...</p>}>
            <EventsTable ticker={ticker} />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}