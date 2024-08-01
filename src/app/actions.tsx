'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function continueConversation(messages: CoreMessage[]) {
  const result = await streamText({
    model: anthropic('claude-3-haiku-20240307'),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return { message: stream.value, data: { test: 'hello' } };
}