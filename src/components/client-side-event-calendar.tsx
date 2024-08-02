"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Event } from "@/app/actions";
import { EventTypeTag } from "@/components/event-type-tag";

export function ClientEventCalendar({ events }: { events: Event[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const eventDates = events.map((event) => new Date(event.date));

  const selectedDateEvents = selectedDate
    ? events.filter(
        (event) => event.date === format(selectedDate, "yyyy-MM-dd"),
      )
    : [];

  return (
    <Card className="mb-6 max-h-[450px]">
      <CardHeader>
        <CardTitle>All Events Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex">
        <div className="w-1/3 pr-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvent: (date: any) =>
                eventDates.some(
                  (eventDate) =>
                    format(eventDate, "yyyy-MM-dd") ===
                    format(date, "yyyy-MM-dd"),
                ),
            }}
            modifiersStyles={{
              hasEvent: { fontWeight: "bold", textDecoration: "underline" },
            }}
          />
        </div>
        <div className="flex max-h-[351px] w-2/3 flex-col border-none pl-4">
          {selectedDate && (
            <>
              <h3 className="mb-2 text-lg font-semibold">
                Events on {format(selectedDate, "MMMM d, yyyy")}:
              </h3>
              <div className="flex-grow overflow-y-auto">
                {selectedDateEvents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/6">Ticker</TableHead>
                        <TableHead className="w-1/6">Time</TableHead>
                        <TableHead className="w-1/3">Event</TableHead>
                        <TableHead className="w-1/6">Type</TableHead>
                        <TableHead className="w-1/6">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDateEvents.map((event, index) => (
                        <TableRow key={index}>
                          <TableCell>{event.ticker}</TableCell>
                          <TableCell>{event.time}</TableCell>
                          <TableCell>{event.eventName}</TableCell>
                          <TableCell>
                            <EventTypeTag type={event.eventType} />
                          </TableCell>
                          <TableCell>
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Link
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No events on this date.</p>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
