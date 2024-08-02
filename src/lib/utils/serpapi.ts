import { z } from "zod";
import puppeteer from "puppeteer";

const serpApiResponseSchema = z.object({
  organic_results: z
    .array(
      z.object({
        link: z.string(),
      }),
    )
    .min(1),
});

export async function getCompanyIRPage(ticker: string) {
  const response = await fetch(
    `https://serpapi.com/search?engine=google&q=${encodeURIComponent(`${ticker} investor relations events`)}&api_key=${process.env.SERP_API_KEY}`,
  );
  const data = await response.json();
  console.log(data);
  const parsedData = serpApiResponseSchema.parse(data);
  return parsedData.organic_results[0]?.link ?? "";
}

export async function fetchHTML(url: string) {
  const response = await fetch(url);
  return await response.text();
}

export async function fetchRenderedHTML(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();

  console.log("Navigating to URL:", url);
  console.log(page);

  try {
    await page.goto(url, { waitUntil: "networkidle0" });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const html = await page.content();
    console.log("HTML:", html);
    return html;
  } finally {
    await browser.close();
  }
}
