import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({ apiKey: import.meta.env.VITE_FIRECRAWL_API_KEY });

export async function deepResearch(query, onLog) {
  try {
    onLog('Starting deep research...');
    const scrapeResult = await app.scrapeUrl('https://google.com', {
      agent: {
        model: 'FIRE-1',
        prompt: `Perform a deep research on the following topic: ${query}. Return the results in markdown format.`,
      },
      formats: ['markdown'],
    });

    if (!scrapeResult.success) {
      onLog(`Error: ${scrapeResult.error}`);
      throw new Error(`Failed to scrape: ${scrapeResult.error}`);
    }

    onLog('Deep research complete.');
    return scrapeResult.data.markdown;
  } catch (error) {
    onLog(`Error: ${error.message}`);
    console.error('Error performing deep research:', error);
    throw error;
  }
}
