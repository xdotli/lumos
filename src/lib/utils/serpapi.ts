import { z } from 'zod';

const serpApiResponseSchema = z.object({
  organic_results: z.array(
    z.object({
      link: z.string(),
    })
  ).min(1),
});

export async function getCompanyIRPage(ticker: string) {
  const response = await fetch(`https://serpapi.com/search?engine=google&q=${encodeURIComponent(`${ticker} investor relations events`)}&api_key=${process.env.SERP_API_KEY}`);
  const data = await response.json();
  console.log(data);
  const parsedData = serpApiResponseSchema.parse(data);
  return parsedData.organic_results[0]?.link ?? '';
}

export async function fetchHTML(url: string) {
  const response = await fetch(url);
  return await response.text();
}