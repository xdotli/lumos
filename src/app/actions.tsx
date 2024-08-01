'use server';

import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { getCompanyIRPage, fetchHTML, fetchRenderedHTML } from '@/lib/utils/serpapi';
import { z } from 'zod';

export interface Event {
  eventName: string;
  link: string;
  date: string;
  time: string;
  eventType: string;
}

const eventSchema = z.object({
  events: z.array(z.object({
    eventName: z.string(),
    link: z.string(),
    date: z.string(),
    time: z.string(),
    eventType: z.string()
  }))
});

export async function getCompanyEvents(ticker: string) {
  const irPageUrl = await getCompanyIRPage(ticker);
  const html = await fetchHTML(irPageUrl);

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: eventSchema,
    mode: 'auto',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that extracts event information from HTML.' },
      { role: 'user', content: `
You are gonna do the following:
1. Accepts an HTML object as input, similar to the one provided earlier containing information about Visa Inc.'s events.
2. Parses the HTML to extract information about each event.
3. Returns a JSON array of event objects, where each object contains the following fields:
   - eventName: The name of the event
   - link: The webcast or registration link for the event
   - date: The date of the event in MM/DD/YYYY format
   - time: The time of the event, including time zone
   - eventType: The type of event (e.g., Conference, Conference Call, Annual Meeting)
You should be able to handle variations in the HTML structure and extract all relevant events listed.
Example of the expected JSON output format:
[
  {
    "eventName": "Q3 2024 Visa Earnings Conference Call",
    "link": "https://events.q4inc.com/attendee/639311361",
    "date": "07/23/2024",
    "time": "5:00 PM EST",
    "eventType": "Conference Call"
  },
  {
    "eventName": "Baird Global Consumer, Technology & Services Conference",
    "link": "https://wsw.com/webcast/baird72/register.aspx?conf=baird72&page=v&url=https://wsw.com/webcast/baird72/v/1456306",
    "date": "06/05/2024",
    "time": "9:40 AM EST",
    "eventType": "Conference"
  }
]

You should be robust enough to handle potential inconsistencies in the HTML structure and should extract all events present in the provided HTML.
You should strictly return JSON, and nothing else.
Here's the HTML to parse:

${html}
      ` },
    ],
  });

  if (result && Array.isArray(result.object.events)) {
    return result.object.events as Event[];
  } else {
    throw new Error('Unexpected result format from AI model');
  }
}