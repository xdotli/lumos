'use server';

import { openai } from '@ai-sdk/openai';
import { generateObject, generateText } from 'ai';
import { getCompanyIRPage, fetchHTML } from '@/lib/utils/serpapi';
import { z } from 'zod';

const dateSchema = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime()) && val === date.toISOString().split('T')[0];
}, {
  message: "Invalid date format. Expected YYYY-MM-DD"
});

const eventSchema = z.object({
  events: z.array(z.object({
    eventName: z.string(),
    link: z.string().url(),
    date: dateSchema,
    time: z.string(),
    eventType: z.enum(['Earnings Calls', 'Conference', 'Shareholder Meeting', 'Other']),
    ticker: z.string() // Add ticker to the schema
  }))
});

export type Event = z.infer<typeof eventSchema>['events'][number];

async function parseTickers(input: string): Promise<string[]> {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    messages: [
      { role: 'system', content: 'You are a helpful assistant that extracts stock tickers from text.' },
      { role: 'user', content: `Extract all stock tickers from the following text. Return only a comma-separated list of tickers, nothing else: ${input}` }
    ],
  });
  return text.split(',').map(ticker => ticker.trim());
}

async function getCompanyEventsForTicker(ticker: string) {
  try {
    const irPageUrl = await getCompanyIRPage(ticker);
    const html = await fetchHTML(irPageUrl);
  
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: eventSchema,
      mode: 'auto',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts event information from HTML.' },
        { role: 'user', content: `
Extract event information from this HTML, formatting it as a JSON object with an 'events' key containing an array of event objects. Each event object should have eventName, link, date (in YYYY-MM-DD format), time (in Eastern Time), eventType, and ticker properties. Classify eventType as one of: Earnings Calls, Conference, Shareholder Meeting, or Other. The ticker should be ${ticker}.

Here's the HTML:

${html}
        ` },
      ],
    });
  
    if (result?.object.events) {
      const validatedEvents = eventSchema.parse(result.object).events;
      return { ticker, events: validatedEvents, irPageUrl };
    } else {
      throw new Error('Unexpected result format from AI model');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      return { ticker, error: 'Invalid data format', irPageUrl: '' };
    }
    if (error instanceof Error && error.message.includes('maximum context length')) {
      return { ticker, error: 'TOKEN_LIMIT_EXCEEDED', irPageUrl: await getCompanyIRPage(ticker) };
    }
    return { ticker, error: error instanceof Error ? error.message : 'Unknown error', irPageUrl: '' };
  }
}

export async function getCompanyEvents(tickerInput: string) {
  const tickers = await parseTickers(tickerInput);
  const results = await Promise.all(tickers.map(getCompanyEventsForTicker));
  return results;
}