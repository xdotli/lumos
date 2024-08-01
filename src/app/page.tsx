import { Suspense } from 'react';
import { getCompanyEvents, type Event } from '@/app/actions';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TokenLimitError from '@/components/token-limit-error';

async function EventsTable({ ticker }: { ticker: string }) {
  const result = await getCompanyEvents(ticker);

  if (!Array.isArray(result) && 'error' in result && result.error === 'TOKEN_LIMIT_EXCEEDED') {
    return <TokenLimitError ticker={ticker} irPageUrl={result.irPageUrl} />;
  }

  const events = Array.isArray(result) ? result : [];

  if (events.length === 0) {
    return <p>No events found.</p>;
  }

  return (
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
            <TableCell><a href={event.link} target="_blank" rel="noopener noreferrer">Link</a></TableCell>
            <TableCell>{event.date}</TableCell>
            <TableCell>{event.time}</TableCell>
            <TableCell>{event.eventType}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
          <Suspense fallback={<p>Loading...</p>}>
            <EventsTable ticker={ticker} />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}