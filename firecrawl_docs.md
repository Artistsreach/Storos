AI agent that enables intelligent navigation and interaction with web pages
FIRE-1 is an AI agent that enhances Firecrawl’s scraping capabilities. It can controls browser actions and navigates complex website structures to enable comprehensive data extraction beyond traditional scraping methods.
​

What FIRE-1 Can Do:
* 		Plan and take actions to uncover data
* 		Interact with buttons, links, inputs, and dynamic elements.
* 		Get mulitple pages of data that require pagination, multiple steps, etc.
​

How to Enable FIRE-1
Activating FIRE-1 is straightforward. Simply include an agent object in your scrape API request:

Copy

Ask AI
"agent": {
  "model": "FIRE-1",
  "prompt": "Your detailed navigation instructions here."
}
Note: The prompt field is required for scrape requests, instructing FIRE-1 precisely how to interact with the webpage. For /extract it will use the prompt provided in the prompt parameter on the body of the request so you can omit the above agent.prompt field.
​

Example Usage with Scrape Endpoint
Here’s a quick example using FIRE-1 with the scrape endpoint to get the companies on the consumer space from Y Combinator:
PythonNode

curl

Copy

Ask AI
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Scrape a website:
const scrapeResult = await app.scrapeUrl('firecrawl.dev', {
  formats: ['markdown', 'html'],
  agent: {
    model: 'FIRE-1',
    prompt: 'Navigate through the product listings by clicking the \'Next Page\' button until disabled. Scrape each page.'
  }  
}) as ScrapeResponse;

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult)
In this scenario, FIRE-1 intelligently clicks the W22 button, the Consumer space button and scrapes the companies.
​

Using FIRE-1 with the Extract Endpoint
Similarly, you can leverage the FIRE-1 agent with the /v1/extract endpoint for complex extraction tasks that require navigation across multiple pages or interaction with elements.
Example:
PythonNode

curl

Copy

Ask AI
import FirecrawlApp, { ExtractResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Extract from a website using schema and prompt:
const extractResult = await app.extract(['https://example-forum.com/topic/123'], {
  prompt: "Extract all user comments from this forum thread.",
  schema: {
    type: "object",
    properties: {
      comments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            author: {type: "string"},
            comment_text: {type: "string"}
          },
          required: ["author", "comment_text"]
        }
      }
    },
    required: ["comments"]
  },
  agent: {
    model: 'FIRE-1'
  }
}) as ExtractResponse;

if (!extractResult.success) {
  throw new Error(`Failed to extract: ${extractResult.error}`)
}

console.log(extractResult)
FIRE-1 is already live and available under preview.
​

Billing
Endpoint	Base Cost	Agent Cost (Preview)	Notes
/scrape	150 credits per page	0–900 agent credits per page	Varies by task complexity.
/extract	See token calculator	~8x non-agent extract	Uses token-based pricing.
* 		Why is FIRE-1 more expensive? FIRE-1 leverages advanced browser automation and AI planning to interact with complex web pages, which requires more compute resources than standard extraction.
Note: FIRE-1 is currently in preview. Pricing and limits may change. For the latest details on /extract costs, see our token calculator.
​

Rate limits
* 		/scrape: 10 requests per minute
* 		/extract: 10 requests per minute
Search

Copy page

Search the web and get full content from results
Firecrawl’s search API allows you to perform web searches and optionally scrape the search results in one operation.
* 		Choose specific output formats (markdown, HTML, links, screenshots)
* 		Search the web with customizable parameters (location, etc.)
* 		Optionally retrieve content from search results in various formats
* 		Control the number of results and set timeouts
For details, see the Search Endpoint API Reference.
​

Performing a Search with Firecrawl
​

/search endpoint
Used to perform web searches and optionally retrieve content from the results.
​

Installation
PythonNode

GoRust

Copy

Ask AI
npm install @mendable/firecrawl-js
​

Basic Usage
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp, { SearchResponse } from '@mendable/firecrawl-js';

// Initialize the client with your API key
const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Perform a basic search
app.search("firecrawl web scraping", { limit: 5 })
  .then(searchResult => {
    // Process the search results
    searchResult.data.forEach(result => {
      console.log(`Title: ${result.title}`);
      console.log(`URL: ${result.url}`);
      console.log(`Description: ${result.description}`);
    });
  }); 
​

Response
SDKs will return the data object directly. cURL will return the complete payload.

Copy

Ask AI
{
  "success": true,
  "data": [
    {
      "title": "Firecrawl - The Ultimate Web Scraping API",
      "description": "Firecrawl is a powerful web scraping API that turns any website into clean, structured data for AI and analysis.",
      "url": "https://firecrawl.dev/"
    },
    {
      "title": "Web Scraping with Firecrawl - A Complete Guide",
      "description": "Learn how to use Firecrawl to extract data from websites effortlessly.",
      "url": "https://firecrawl.dev/guides/web-scraping/"
    },
    {
      "title": "Firecrawl Documentation - Getting Started",
      "description": "Official documentation for the Firecrawl web scraping API.",
      "url": "https://docs.firecrawl.dev/"
    }
    // ... more results
  ]
}
​

Search with Content Scraping
Search and retrieve content from the search results in one operation.
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from '@mendable/firecrawl-js';

// Initialize the client with your API key
const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Search and scrape content
app.search("firecrawl web scraping", {
  limit: 3,
  scrapeOptions: {
    formats: ["markdown", "links"]
  }
})
.then(searchResult => {
  // Process the results
  searchResult.data.forEach(result => {
    console.log(`Title: ${result.title}`);
    console.log(`URL: ${result.url}`);
    console.log(`Content: ${result.markdown?.substring(0, 150)}...`);
    console.log(`Links: ${(result.links || []).slice(0, 3).join(', ')}...`);
  });
}); 
​

Response with Scraped Content

Copy

Ask AI
{
  "success": true,
  "data": [
    {
      "title": "Firecrawl - The Ultimate Web Scraping API",
      "description": "Firecrawl is a powerful web scraping API that turns any website into clean, structured data for AI and analysis.",
      "url": "https://firecrawl.dev/",
      "markdown": "# Firecrawl\n\nThe Ultimate Web Scraping API\n\n## Turn any website into clean, structured data\n\nFirecrawl makes it easy to extract data from websites for AI applications, market research, content aggregation, and more...",
      "links": [
        "https://firecrawl.dev/pricing",
        "https://firecrawl.dev/docs",
        "https://firecrawl.dev/guides",
        // ... more links
      ],
      "metadata": {
        "title": "Firecrawl - The Ultimate Web Scraping API",
        "description": "Firecrawl is a powerful web scraping API that turns any website into clean, structured data for AI and analysis.",
        "sourceURL": "https://firecrawl.dev/",
        "statusCode": 200
      }
    },
    // ... more results
  ]
}
​

Advanced Search Options
Firecrawl’s search API supports various parameters to customize your search:
​

Location Customization
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from '@mendable/firecrawl-js';

// Initialize the client with your API key
const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Search with location settings (Germany)
app.search("web scraping tools", {
  limit: 5,
  location: "Germany"
})
.then(searchResult => {
  // Process the results
  searchResult.data.forEach(result => {
    console.log(`Title: ${result.title}`);
    console.log(`URL: ${result.url}`);
  });
}); 
​

Time-Based Search
Use the tbs parameter to filter results by time:
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from '@mendable/firecrawl-js';

// Initialize the client with your API key
const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Search for results from the past week
app.search("latest web scraping techniques", {
  limit: 5,
  tbs: "qdr:w"  // qdr:w = past week
})
.then(searchResult => {
  // Process the results
  searchResult.data.forEach(result => {
    console.log(`Title: ${result.title}`);
    console.log(`URL: ${result.url}`);
  });
}); 
Common tbs values:
* 		qdr:h - Past hour
* 		qdr:d - Past 24 hours
* 		qdr:w - Past week
* 		qdr:m - Past month
* 		qdr:y - Past year
For more precise time filtering, you can specify exact date ranges using the custom date range format:
Python

JavaScriptcURL

Copy

Ask AI
from firecrawl import FirecrawlApp

# Initialize the client with your API key
app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Search for results from December 2024
search_result = app.search(
    "firecrawl updates",
    limit=10,
    tbs="cdr:1,cd_min:12/1/2024,cd_max:12/31/2024"
)
​

Custom Timeout
Set a custom timeout for search operations:
Python

JavaScriptcURL

Copy

Ask AI
from firecrawl import FirecrawlApp

# Initialize the client with your API key
app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Set a 30-second timeout
search_result = app.search(
    "complex search query",
    limit=10,
    timeout=30000  # 30 seconds in milliseconds
)
​

Scraping Options
When scraping search results, you can specify multiple output formats and advanced scraping options:
Python

JavaScriptcURL

Copy

Ask AI
from firecrawl import FirecrawlApp, ScrapeOptions

# Initialize the client with your API key
app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Get search results with multiple formats
search_result = app.search(
    "firecrawl features",
    limit=3,
    scrape_options=ScrapeOptions(formats=["markdown", "html", "links", "screenshot"])
)
Available formats:
* 		markdown: Clean, formatted markdown content
* 		html: Processed HTML content
* 		rawHtml: Unmodified HTML content
* 		links: List of links found on the page
* 		screenshot: Screenshot of the page
* 		screenshot@fullPage: Full-page screenshot
* 		extract: Structured data extraction
​

Cost Implications
When using the search endpoint with scraping enabled, be aware of these cost factors:
* 		Standard scraping: 1 credit per search result
* 		PDF parsing: 1 credit per PDF page (can significantly increase costs for multi-page PDFs)
* 		Stealth proxy mode: +4 additional credits per search result
To control costs:
* 		Set parsePDF: false if you don’t need PDF content
* 		Use proxy: "basic" instead of "stealth" when possible
* 		Limit the number of search results with the limit parameter
​

Advanced Scraping Options
For more details about the scraping options, refer to the Scrape Feature documentation. Everything except for the FIRE-1 Agent and Change-Tracking features are supported by this Search endpoint.


Copy page

Firecrawl allows you to turn entire websites into LLM-ready markdown


​

Welcome to Firecrawl
Firecrawl is an API service that takes a URL, crawls it, and converts it into clean markdown. We crawl all accessible subpages and give you clean markdown for each. No sitemap required.
​

How to use it?
We provide an easy to use API with our hosted version. You can find the playground and documentation here. You can also self host the backend if you’d like.
Check out the following resources to get started:
* 		 API: Documentation
* 		 SDKs: Python, Node, Go, Rust
* 		 LLM Frameworks: Langchain (python), Langchain (js), Llama Index, Crew.ai, Composio, PraisonAI, Superinterface, Vectorize
* 		 Low-code Frameworks: Dify, Langflow, Flowise AI, Cargo, Pipedream
* 		 Others: Zapier, Pabbly Connect
* 		 Want an SDK or Integration? Let us know by opening an issue.
Self-host: To self-host refer to guide here.
​

API Key
To use the API, you need to sign up on Firecrawl and get an API key.
​

Features
* 		Scrape: scrapes a URL and get its content in LLM-ready format (markdown, structured data via LLM Extract, screenshot, html)
* 		Crawl: scrapes all the URLs of a web page and return content in LLM-ready format
* 		Map: input a website and get all the website urls - extremely fast
* 		Search: search the web and get full content from results
* 		Extract: get structured data from single page, multiple pages or entire websites with AI.
​

Powerful Capabilities
* 		LLM-ready formats: markdown, structured data, screenshot, HTML, links, metadata
* 		The hard stuff: proxies, anti-bot mechanisms, dynamic content (js-rendered), output parsing, orchestration
* 		Customizability: exclude tags, crawl behind auth walls with custom headers, max crawl depth, etc…
* 		Media parsing: pdfs, docx, images.
* 		Reliability first: designed to get the data you need - no matter how hard it is.
* 		Actions: click, scroll, input, wait and more before extracting data
You can find all of Firecrawl’s capabilities and how to use them in our documentation
​

Installing Firecrawl
PythonNode

GoRust

Copy

Ask AI
npm install @mendable/firecrawl-js
​

Scraping
To scrape a single URL, use the scrape_url method. It takes the URL as a parameter and returns the scraped data as a dictionary.
PythonNode

GoRustcURL

Copy

Ask AI
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Scrape a website:
const scrapeResult = await app.scrapeUrl('firecrawl.dev', { formats: ['markdown', 'html'] }) as ScrapeResponse;

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult)
​

Response
SDKs will return the data object directly. cURL will return the payload exactly as shown below.

Copy

Ask AI
{
  "success": true,
  "data" : {
    "markdown": "Launch Week I is here! [See our Day 2 Release 🚀](https://www.firecrawl.dev/blog/launch-week-i-day-2-doubled-rate-limits)[💥 Get 2 months free...",
    "html": "<!DOCTYPE html><html lang=\"en\" class=\"light\" style=\"color-scheme: light;\"><body class=\"__variable_36bd41 __variable_d7dc5d font-inter ...",
    "metadata": {
      "title": "Home - Firecrawl",
      "description": "Firecrawl crawls and converts any website into clean markdown.",
      "language": "en",
      "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",
      "robots": "follow, index",
      "ogTitle": "Firecrawl",
      "ogDescription": "Turn any website into LLM-ready data.",
      "ogUrl": "https://www.firecrawl.dev/",
      "ogImage": "https://www.firecrawl.dev/og.png?123",
      "ogLocaleAlternate": [],
      "ogSiteName": "Firecrawl",
      "sourceURL": "https://firecrawl.dev",
      "statusCode": 200
    }
  }
}
​

Crawling
Used to crawl a URL and all accessible subpages. This submits a crawl job and returns a job ID to check the status of the crawl.
​

Usage
PythonNode

GoRustcURL

Copy

Ask AI
import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

const crawlResponse = await app.crawlUrl('https://firecrawl.dev', {
  limit: 100,
  scrapeOptions: {
    formats: ['markdown', 'html'],
  }
})

if (!crawlResponse.success) {
  throw new Error(`Failed to crawl: ${crawlResponse.error}`)
}

console.log(crawlResponse)
If you’re using cURL or async crawl functions on SDKs, this will return an IDwhere you can use to check the status of the crawl.

Copy

Ask AI
{
  "success": true,
  "id": "123-456-789",
  "url": "https://api.firecrawl.dev/v1/crawl/123-456-789"
}
​

Check Crawl Job
Used to check the status of a crawl job and get its result.
PythonNode

GoRustcURL

Copy

Ask AI
const crawlResponse = await app.checkCrawlStatus("<crawl_id>");

if (!crawlResponse.success) {
  throw new Error(`Failed to check crawl status: ${crawlResponse.error}`)
}

console.log(crawlResponse)
​

Response
The response will be different depending on the status of the crawl. For not completed or large responses exceeding 10MB, a next URL parameter is provided. You must request this URL to retrieve the next 10MB of data. If the next parameter is absent, it indicates the end of the crawl data.
Scraping

Completed

Copy

Ask AI
{
  "status": "scraping",
  "total": 36,
  "completed": 10,
  "creditsUsed": 10,
  "expiresAt": "2024-00-00T00:00:00.000Z",
  "next": "https://api.firecrawl.dev/v1/crawl/123-456-789?skip=10",
  "data": [
    {
      "markdown": "[Firecrawl Docs home page![light logo](https://mintlify.s3-us-west-1.amazonaws.com/firecrawl/logo/light.svg)!...",
      "html": "<!DOCTYPE html><html lang=\"en\" class=\"js-focus-visible lg:[--scroll-mt:9.5rem]\" data-js-focus-visible=\"\">...",
      "metadata": {
        "title": "Build a 'Chat with website' using Groq Llama 3 | Firecrawl",
        "language": "en",
        "sourceURL": "https://docs.firecrawl.dev/learn/rag-llama3",
        "description": "Learn how to use Firecrawl, Groq Llama 3, and Langchain to build a 'Chat with your website' bot.",
        "ogLocaleAlternate": [],
        "statusCode": 200
      }
    },
    ...
  ]
}
​

Extraction
With LLM extraction, you can easily extract structured data from any URL. We support pydantic schemas to make it easier for you too. Here is how you to use it:
v1 is only supported on node, python and cURL at this time.
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const app = new FirecrawlApp({
  apiKey: "fc-YOUR_API_KEY"
});

// Define schema to extract contents into
const schema = z.object({
  company_mission: z.string(),
  supports_sso: z.boolean(),
  is_open_source: z.boolean(),
  is_in_yc: z.boolean()
});

const scrapeResult = await app.scrapeUrl("https://docs.firecrawl.dev/", {
  formats: ["json"],
  jsonOptions: { schema: schema }
});

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult.json);
Output:
JSON

Copy

Ask AI
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "AI-powered web scraping and data extraction",
        "supports_sso": true,
        "is_open_source": true,
        "is_in_yc": true
      },
      "metadata": {
        "title": "Firecrawl",
        "description": "AI-powered web scraping and data extraction",
        "robots": "follow, index",
        "ogTitle": "Firecrawl",
        "ogDescription": "AI-powered web scraping and data extraction",
        "ogUrl": "https://firecrawl.dev/",
        "ogImage": "https://firecrawl.dev/og.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Firecrawl",
        "sourceURL": "https://firecrawl.dev/"
      },
    }
}
​

Extracting without schema (New)
You can now extract without a schema by just passing a prompt to the endpoint. The llm chooses the structure of the data.
cURL


Copy

Ask AI
curl -X POST https://api.firecrawl.dev/v1/scrape \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "url": "https://docs.firecrawl.dev/",
      "formats": ["json"],
      "jsonOptions": {
        "prompt": "Extract the company mission from the page."
      }
    }'
Output:
JSON

Copy

Ask AI
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "AI-powered web scraping and data extraction",
      },
      "metadata": {
        "title": "Firecrawl",
        "description": "AI-powered web scraping and data extraction",
        "robots": "follow, index",
        "ogTitle": "Firecrawl",
        "ogDescription": "AI-powered web scraping and data extraction",
        "ogUrl": "https://firecrawl.dev/",
        "ogImage": "https://firecrawl.dev/og.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Firecrawl",
        "sourceURL": "https://firecrawl.dev/"
      },
    }
}
​

Interacting with the page with Actions
Firecrawl allows you to perform various actions on a web page before scraping its content. This is particularly useful for interacting with dynamic content, navigating through pages, or accessing content that requires user interaction.
Here is an example of how to use actions to navigate to google.com, search for Firecrawl, click on the first result, and take a screenshot.
It is important to almost always use the wait action before/after executing other actions to give enough time for the page to load.
​

Example
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Scrape a website:
const scrapeResult = await app.scrapeUrl('firecrawl.dev', { formats: ['markdown', 'html'], actions: [
    { type: "wait", milliseconds: 2000 },
    { type: "click", selector: "textarea[title=\"Search\"]" },
    { type: "wait", milliseconds: 2000 },
    { type: "write", text: "firecrawl" },
    { type: "wait", milliseconds: 2000 },
    { type: "press", key: "ENTER" },
    { type: "wait", milliseconds: 3000 },
    { type: "click", selector: "h3" },
    { type: "scrape" },
    {"type": "screenshot"}
] }) as ScrapeResponse;

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult)
​

Output
JSON


Copy

Ask AI
{
  "success": true,
  "data": {
    "markdown": "Our first Launch Week is over! [See the recap 🚀](blog/firecrawl-launch-week-1-recap)...",
    "actions": {
      "screenshots": [
        "https://alttmdsdujxrfnakrkyi.supabase.co/storage/v1/object/public/media/screenshot-75ef2d87-31e0-4349-a478-fb432a29e241.png"
      ],
      "scrapes": [
        {
          "url": "https://www.firecrawl.dev/",
          "html": "<html><body><h1>Firecrawl</h1></body></html>"
        }
      ]
    },
    "metadata": {
      "title": "Home - Firecrawl",
      "description": "Firecrawl crawls and converts any website into clean markdown.",
      "language": "en",
      "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",
      "robots": "follow, index",
      "ogTitle": "Firecrawl",
      "ogDescription": "Turn any website into LLM-ready data.",
      "ogUrl": "https://www.firecrawl.dev/",
      "ogImage": "https://www.firecrawl.dev/og.png?123",
      "ogLocaleAlternate": [],
      "ogSiteName": "Firecrawl",
      "sourceURL": "http://google.com",
      "statusCode": 200
    }
  }
}
Scrape

Copy page

Turn any url into clean data
Firecrawl converts web pages into markdown, ideal for LLM applications.
* 		It manages complexities: proxies, caching, rate limits, js-blocked content
* 		Handles dynamic content: dynamic websites, js-rendered sites, PDFs, images
* 		Outputs clean markdown, structured data, screenshots or html.
For details, see the Scrape Endpoint API Reference.
​

Scraping a URL with Firecrawl
​

/scrape endpoint
Used to scrape a URL and get its content.
​

Installation
PythonNode

GoRust

Copy

Ask AI
npm install @mendable/firecrawl-js
​

Usage
PythonNode

GoRustcURL

Copy

Ask AI
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Scrape a website:
const scrapeResult = await app.scrapeUrl('firecrawl.dev', { formats: ['markdown', 'html'] }) as ScrapeResponse;

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult)
For more details about the parameters, refer to the API Reference.
​

Response
SDKs will return the data object directly. cURL will return the payload exactly as shown below.

Copy

Ask AI
{
  "success": true,
  "data" : {
    "markdown": "Launch Week I is here! [See our Day 2 Release 🚀](https://www.firecrawl.dev/blog/launch-week-i-day-2-doubled-rate-limits)[💥 Get 2 months free...",
    "html": "<!DOCTYPE html><html lang=\"en\" class=\"light\" style=\"color-scheme: light;\"><body class=\"__variable_36bd41 __variable_d7dc5d font-inter ...",
    "metadata": {
      "title": "Home - Firecrawl",
      "description": "Firecrawl crawls and converts any website into clean markdown.",
      "language": "en",
      "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",
      "robots": "follow, index",
      "ogTitle": "Firecrawl",
      "ogDescription": "Turn any website into LLM-ready data.",
      "ogUrl": "https://www.firecrawl.dev/",
      "ogImage": "https://www.firecrawl.dev/og.png?123",
      "ogLocaleAlternate": [],
      "ogSiteName": "Firecrawl",
      "sourceURL": "https://firecrawl.dev",
      "statusCode": 200
    }
  }
}
​

Scrape Formats
You can now choose what formats you want your output in. You can specify multiple output formats. Supported formats are:
* 		Markdown (markdown)
* 		HTML (html)
* 		Raw HTML (rawHtml) (with no modifications)
* 		Screenshot (screenshot or screenshot@fullPage)
* 		Links (links)
* 		JSON (json) - structured output
Output keys will match the format you choose.
​

Extract structured data
​

/scrape (with json) endpoint
Used to extract structured data from scraped pages.
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const app = new FirecrawlApp({
  apiKey: "fc-YOUR_API_KEY"
});

// Define schema to extract contents into
const schema = z.object({
  company_mission: z.string(),
  supports_sso: z.boolean(),
  is_open_source: z.boolean(),
  is_in_yc: z.boolean()
});

const scrapeResult = await app.scrapeUrl("https://docs.firecrawl.dev/", {
  formats: ["json"],
  jsonOptions: { schema: schema }
});

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult.json);
Output:
JSON

Copy

Ask AI
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "AI-powered web scraping and data extraction",
        "supports_sso": true,
        "is_open_source": true,
        "is_in_yc": true
      },
      "metadata": {
        "title": "Firecrawl",
        "description": "AI-powered web scraping and data extraction",
        "robots": "follow, index",
        "ogTitle": "Firecrawl",
        "ogDescription": "AI-powered web scraping and data extraction",
        "ogUrl": "https://firecrawl.dev/",
        "ogImage": "https://firecrawl.dev/og.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Firecrawl",
        "sourceURL": "https://firecrawl.dev/"
      },
    }
}
​

Extracting without schema (New)
You can now extract without a schema by just passing a prompt to the endpoint. The llm chooses the structure of the data.
cURL


Copy

Ask AI
curl -X POST https://api.firecrawl.dev/v1/scrape \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "url": "https://docs.firecrawl.dev/",
      "formats": ["json"],
      "jsonOptions": {
        "prompt": "Extract the company mission from the page."
      }
    }'
Output:
JSON

Copy

Ask AI
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "AI-powered web scraping and data extraction",
      },
      "metadata": {
        "title": "Firecrawl",
        "description": "AI-powered web scraping and data extraction",
        "robots": "follow, index",
        "ogTitle": "Firecrawl",
        "ogDescription": "AI-powered web scraping and data extraction",
        "ogUrl": "https://firecrawl.dev/",
        "ogImage": "https://firecrawl.dev/og.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Firecrawl",
        "sourceURL": "https://firecrawl.dev/"
      },
    }
}
​

JSON options object
The jsonOptions object accepts the following parameters:
* 		schema: The schema to use for the extraction.
* 		systemPrompt: The system prompt to use for the extraction.
* 		prompt: The prompt to use for the extraction without a schema.
​

Interacting with the page with Actions
Firecrawl allows you to perform various actions on a web page before scraping its content. This is particularly useful for interacting with dynamic content, navigating through pages, or accessing content that requires user interaction.
Here is an example of how to use actions to navigate to google.com, search for Firecrawl, click on the first result, and take a screenshot.
It is important to almost always use the wait action before/after executing other actions to give enough time for the page to load.
​

Example
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Scrape a website:
const scrapeResult = await app.scrapeUrl('firecrawl.dev', { formats: ['markdown', 'html'], actions: [
    { type: "wait", milliseconds: 2000 },
    { type: "click", selector: "textarea[title=\"Search\"]" },
    { type: "wait", milliseconds: 2000 },
    { type: "write", text: "firecrawl" },
    { type: "wait", milliseconds: 2000 },
    { type: "press", key: "ENTER" },
    { type: "wait", milliseconds: 3000 },
    { type: "click", selector: "h3" },
    { type: "scrape" },
    {"type": "screenshot"}
] }) as ScrapeResponse;

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult)
​

Output
JSON


Copy

Ask AI
{
  "success": true,
  "data": {
    "markdown": "Our first Launch Week is over! [See the recap 🚀](blog/firecrawl-launch-week-1-recap)...",
    "actions": {
      "screenshots": [
        "https://alttmdsdujxrfnakrkyi.supabase.co/storage/v1/object/public/media/screenshot-75ef2d87-31e0-4349-a478-fb432a29e241.png"
      ],
      "scrapes": [
        {
          "url": "https://www.firecrawl.dev/",
          "html": "<html><body><h1>Firecrawl</h1></body></html>"
        }
      ]
    },
    "metadata": {
      "title": "Home - Firecrawl",
      "description": "Firecrawl crawls and converts any website into clean markdown.",
      "language": "en",
      "keywords": "Firecrawl,Markdown,Data,Mendable,Langchain",
      "robots": "follow, index",
      "ogTitle": "Firecrawl",
      "ogDescription": "Turn any website into LLM-ready data.",
      "ogUrl": "https://www.firecrawl.dev/",
      "ogImage": "https://www.firecrawl.dev/og.png?123",
      "ogLocaleAlternate": [],
      "ogSiteName": "Firecrawl",
      "sourceURL": "http://google.com",
      "statusCode": 200
    }
  }
}
For more details about the actions parameters, refer to the API Reference.
​

Location and Language
Specify country and preferred languages to get relevant content based on your target location and language preferences.
​

How it works
When you specify the location settings, Firecrawl will use an appropriate proxy if available and emulate the corresponding language and timezone settings. By default, the location is set to ‘US’ if not specified.
​

Usage
To use the location and language settings, include the location object in your request body with the following properties:
* 		country: ISO 3166-1 alpha-2 country code (e.g., ‘US’, ‘AU’, ‘DE’, ‘JP’). Defaults to ‘US’.
* 		languages: An array of preferred languages and locales for the request in order of priority. Defaults to the language of the specified location.
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Scrape a website:
const scrapeResult = await app.scrapeUrl('airbnb.com', { formats: ['markdown', 'html'], location: {
    country: "BR",
    languages: ["pt-BR"]
} }) as ScrapeResponse;

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult)```
​

Batch scraping multiple URLs
You can now batch scrape multiple URLs at the same time. It takes the starting URLs and optional parameters as arguments. The params argument allows you to specify additional options for the batch scrape job, such as the output formats.
​

How it works
It is very similar to how the /crawl endpoint works. It submits a batch scrape job and returns a job ID to check the status of the batch scrape.
The sdk provides 2 methods, synchronous and asynchronous. The synchronous method will return the results of the batch scrape job, while the asynchronous method will return a job ID that you can use to check the status of the batch scrape.
​

Usage
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

// Scrape multiple websites (synchronous):
const batchScrapeResult = await app.batchScrapeUrls(['firecrawl.dev', 'mendable.ai'], { formats: ['markdown', 'html'] });

if (!batchScrapeResult.success) {
  throw new Error(`Failed to scrape: ${batchScrapeResult.error}`)
}
// Output all the results of the batch scrape:
console.log(batchScrapeResult)

// Or, you can use the asynchronous method:
const batchScrapeJob = await app.asyncBulkScrapeUrls(['firecrawl.dev', 'mendable.ai'], { formats: ['markdown', 'html'] });
console.log(batchScrapeJob)

// (async) You can then use the job ID to check the status of the batch scrape:
const batchScrapeStatus = await app.checkBatchScrapeStatus(batchScrapeJob.id);
console.log(batchScrapeStatus)
​

Response
If you’re using the sync methods from the SDKs, it will return the results of the batch scrape job. Otherwise, it will return a job ID that you can use to check the status of the batch scrape.
​

Synchronous
Completed

Copy

Ask AI
{
  "status": "completed",
  "total": 36,
  "completed": 36,
  "creditsUsed": 36,
  "expiresAt": "2024-00-00T00:00:00.000Z",
  "next": "https://api.firecrawl.dev/v1/batch/scrape/123-456-789?skip=26",
  "data": [
    {
      "markdown": "[Firecrawl Docs home page![light logo](https://mintlify.s3-us-west-1.amazonaws.com/firecrawl/logo/light.svg)!...",
      "html": "<!DOCTYPE html><html lang=\"en\" class=\"js-focus-visible lg:[--scroll-mt:9.5rem]\" data-js-focus-visible=\"\">...",
      "metadata": {
        "title": "Build a 'Chat with website' using Groq Llama 3 | Firecrawl",
        "language": "en",
        "sourceURL": "https://docs.firecrawl.dev/learn/rag-llama3",
        "description": "Learn how to use Firecrawl, Groq Llama 3, and Langchain to build a 'Chat with your website' bot.",
        "ogLocaleAlternate": [],
        "statusCode": 200
      }
    },
    ...
  ]
}
​

Asynchronous
You can then use the job ID to check the status of the batch scrape by calling the /batch/scrape/{id} endpoint. This endpoint is meant to be used while the job is still running or right after it has completed as batch scrape jobs expire after 24 hours.

Copy

Ask AI
{
  "success": true,
  "id": "123-456-789",
  "url": "https://api.firecrawl.dev/v1/batch/scrape/123-456-789"
}
​

Stealth Mode
For websites with advanced anti-bot protection, Firecrawl offers a stealth proxy mode that provides better success rates at scraping challenging sites.
Learn more about Stealth Mode.
​

Using FIRE-1 with Scrape
You can use the FIRE-1 agent with the /scrape endpoint to apply intelligent navigation before scraping the final content.
Activating FIRE-1 is straightforward. Simply include an agent object in your scrape or extract API request:

Copy

Ask AI
"agent": {
  "model": "FIRE-1",
  "prompt": "Your detailed navigation instructions here."
}
Note: The prompt field is required for scrape requests, instructing FIRE-1 precisely how to interact with the webpage.
​

Example Usage with Scrape Endpoint
Here’s a quick example using FIRE-1 with the scrape endpoint to get the companies on the consumer space from Y Combinator:

Copy

Ask AI
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -d '{
    "url": "https://ycombinator.com/companies",
    "formats": ["markdown"],
    "agent": {
      "model": "FIRE-1",
      "prompt": "Get W22 companies on the consumer space by clicking the respective buttons"
    }
  }'

Crawl

Firecrawl can recursively search through a urls subdomains, and gather the content
Firecrawl efficiently crawls websites to extract comprehensive data while bypassing blockers. The process:
1. URL Analysis: Scans sitemap and crawls website to identify links
2. Traversal: Recursively follows links to find all subpages
3. Scraping: Extracts content from each page, handling JS and rate limits
4. Output: Converts data to clean markdown or structured format
This ensures thorough data collection from any starting URL.
​

Crawling
​

/crawl endpoint
Used to crawl a URL and all accessible subpages. This submits a crawl job and returns a job ID to check the status of the crawl.

By default - Crawl will ignore sublinks of a page if they aren’t children of the url you provide. So, the website.com/other-parent/blog-1 wouldn’t be returned if you crawled website.com/blogs/. If you want website.com/other-parent/blog-1, use the crawlEntireDomain parameter. To crawl subdomains like blog.website.com when crawling website.com, use the allowSubdomains parameter.
​

Installation
PythonNode

GoRust

Copy

Ask AI
npm install @mendable/firecrawl-js
​

Usage
PythonNode

GoRustcURL

Copy

Ask AI
import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

const crawlResponse = await app.crawlUrl('https://firecrawl.dev', {
  limit: 100,
  scrapeOptions: {
    formats: ['markdown', 'html'],
  }
})

if (!crawlResponse.success) {
  throw new Error(`Failed to crawl: ${crawlResponse.error}`)
}

console.log(crawlResponse)
​

API Response
If you’re using cURL or async crawl functions on SDKs, this will return an IDwhere you can use to check the status of the crawl.

If you’re using the SDK, check the SDK response section below.

Copy

Ask AI
{
  "success": true,
  "id": "123-456-789",
  "url": "https://api.firecrawl.dev/v1/crawl/123-456-789"
}
​

Check Crawl Job
Used to check the status of a crawl job and get its result.

This endpoint only works for crawls that are in progress or crawls that have completed recently. 
PythonNode

GoRustcURL

Copy

Ask AI
const crawlResponse = await app.checkCrawlStatus("<crawl_id>");

if (!crawlResponse.success) {
  throw new Error(`Failed to check crawl status: ${crawlResponse.error}`)
}

console.log(crawlResponse)
​

Response Handling
The response varies based on the crawl’s status.
For not completed or large responses exceeding 10MB, a next URL parameter is provided. You must request this URL to retrieve the next 10MB of data. If the next parameter is absent, it indicates the end of the crawl data.
The skip parameter sets the maximum number of results returned for each chunk of results returned.

The skip and next parameter are only relavent when hitting the api directly. If you’re using the SDK, we handle this for you and will return all the results at once.
Scraping

Completed

Copy

Ask AI
{
  "status": "scraping",
  "total": 36,
  "completed": 10,
  "creditsUsed": 10,
  "expiresAt": "2024-00-00T00:00:00.000Z",
  "next": "https://api.firecrawl.dev/v1/crawl/123-456-789?skip=10",
  "data": [
    {
      "markdown": "[Firecrawl Docs home page![light logo](https://mintlify.s3-us-west-1.amazonaws.com/firecrawl/logo/light.svg)!...",
      "html": "<!DOCTYPE html><html lang=\"en\" class=\"js-focus-visible lg:[--scroll-mt:9.5rem]\" data-js-focus-visible=\"\">...",
      "metadata": {
        "title": "Build a 'Chat with website' using Groq Llama 3 | Firecrawl",
        "language": "en",
        "sourceURL": "https://docs.firecrawl.dev/learn/rag-llama3",
        "description": "Learn how to use Firecrawl, Groq Llama 3, and Langchain to build a 'Chat with your website' bot.",
        "ogLocaleAlternate": [],
        "statusCode": 200
      }
    },
    ...
  ]
}
​

SDK Response
The SDK provides two ways to crawl URLs:
1. Synchronous Crawling (crawl_url/crawlUrl):
    * 		Waits for the crawl to complete and returns the full response
    * 		Handles pagination automatically
    * 		Recommended for most use cases
PythonNode


Copy

Ask AI
import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

const crawlResponse = await app.crawlUrl('https://firecrawl.dev', {
  limit: 100,
  scrapeOptions: {
    formats: ['markdown', 'html'],
  }
})

if (!crawlResponse.success) {
  throw new Error(`Failed to crawl: ${crawlResponse.error}`)
}

console.log(crawlResponse)
The response includes the crawl status and all scraped data:
PythonNode


Copy

Ask AI
{
  success: true,
  status: "completed",
  completed: 100,
  total: 100,
  creditsUsed: 100,
  expiresAt: "2025-04-23T19:28:45.000Z",
  data: [
    {
      markdown: "[Day 7 - Launch Week III.Integrations DayApril ...",
      html: `<!DOCTYPE html><html lang="en" class="light" style="color...`,
      metadata: [Object],
    },
    ...
  ]
}
2. Asynchronous Crawling (async_crawl_url/asyncCrawlUrl):
    * 		Returns immediately with a crawl ID
    * 		Allows manual status checking
    * 		Useful for long-running crawls or custom polling logic
​

Faster Crawling
Speed up your crawls by 500% when you don’t need the freshest data. Add maxAge to your scrapeOptions to use cached page data when available.
Python

JavaScriptGoRustcURL

Copy

Ask AI
from firecrawl import FirecrawlApp, ScrapeOptions

app = FirecrawlApp(api_key="fc-YOUR_API_KEY")

# Crawl with cached scraping - 500% faster for pages we've seen recently
crawl_result = app.crawl_url(
    'https://firecrawl.dev', 
    limit=100,
    scrape_options=ScrapeOptions(
        formats=['markdown'],
        maxAge=3600000  # Use cached data if less than 1 hour old
    )
)

for page in crawl_result['data']:
    print(f"URL: {page['metadata']['sourceURL']}")
    print(f"Content: {page['markdown'][:200]}...")
How it works:
* 		Each page in your crawl checks if we have cached data newer than maxAge
* 		If yes, returns instantly from cache (500% faster)
* 		If no, scrapes the page fresh and caches the result
* 		Perfect for crawling documentation sites, product catalogs, or other relatively static content
For more details on maxAge usage, see the Faster Scraping documentation.
​

Crawl WebSocket
Firecrawl’s WebSocket-based method, Crawl URL and Watch, enables real-time data extraction and monitoring. Start a crawl with a URL and customize it with options like page limits, allowed domains, and output formats, ideal for immediate data processing needs.
PythonNode


Copy

Ask AI
const watch = await app.crawlUrlAndWatch('mendable.ai', { excludePaths: ['blog/*'], limit: 5});

watch.addEventListener("document", doc => {
  console.log("DOC", doc.detail);
});

watch.addEventListener("error", err => {
  console.error("ERR", err.detail.error);
});

watch.addEventListener("done", state => {
  console.log("DONE", state.detail.status);
});
​

Crawl Webhook
You can configure webhooks to receive real-time notifications as your crawl progresses. This allows you to process pages as they’re scraped instead of waiting for the entire crawl to complete.
cURL

Copy

Ask AI
curl -X POST https://api.firecrawl.dev/v1/crawl \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "url": "https://docs.firecrawl.dev",
      "limit": 100,
      "webhook": {
        "url": "https://your-domain.com/webhook",
        "metadata": {
          "any_key": "any_value"
        },
        "events": ["started", "page", "completed"]
      }
    }'
For comprehensive webhook documentation including event types, payload structure, and implementation examples, see the Webhooks documentation.
​

Quick Reference
Event Types:
* 		crawl.started - When the crawl begins
* 		crawl.page - For each page successfully scraped
* 		crawl.completed - When the crawl finishes
* 		crawl.failed - If the crawl encounters an error
Basic Payload:

Copy

Ask AI
{
  "success": true,
  "type": "crawl.page",
  "id": "crawl-job-id",
  "data": [...], // Page data for 'page' events
  "metadata": {}, // Your custom metadata
  "error": null
}

JSON mode - LLM Extract

Copy page

Extract structured data from pages via LLMs
​

Scrape and extract structured data with Firecrawl
Firecrawl uses AI to get structured data from web pages in 3 steps:
1. Set the Schema: Tell us what data you want by defining a JSON schema (using OpenAI’s format) along with the webpage URL.
2. Make the Request: Send your URL and schema to our scrape endpoint. See how here: Scrape Endpoint Documentation
3. Get Your Data: Get back clean, structured data matching your schema that you can use right away.
This makes getting web data in the format you need quick and easy.
​

Extract structured data
​

/scrape (with json) endpoint
Used to extract structured data from scraped pages.
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const app = new FirecrawlApp({
  apiKey: "fc-YOUR_API_KEY"
});

// Define schema to extract contents into
const schema = z.object({
  company_mission: z.string(),
  supports_sso: z.boolean(),
  is_open_source: z.boolean(),
  is_in_yc: z.boolean()
});

const scrapeResult = await app.scrapeUrl("https://docs.firecrawl.dev/", {
  formats: ["json"],
  jsonOptions: { schema: schema }
});

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult.json);
Output:
JSON

Copy

Ask AI
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "AI-powered web scraping and data extraction",
        "supports_sso": true,
        "is_open_source": true,
        "is_in_yc": true
      },
      "metadata": {
        "title": "Firecrawl",
        "description": "AI-powered web scraping and data extraction",
        "robots": "follow, index",
        "ogTitle": "Firecrawl",
        "ogDescription": "AI-powered web scraping and data extraction",
        "ogUrl": "https://firecrawl.dev/",
        "ogImage": "https://firecrawl.dev/og.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Firecrawl",
        "sourceURL": "https://firecrawl.dev/"
      },
    }
}
​

Extracting without schema (New)
You can now extract without a schema by just passing a prompt to the endpoint. The llm chooses the structure of the data.
cURL


Copy

Ask AI
curl -X POST https://api.firecrawl.dev/v1/scrape \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "url": "https://docs.firecrawl.dev/",
      "formats": ["json"],
      "jsonOptions": {
        "prompt": "Extract the company mission from the page."
      }
    }'
Output:
JSON

Copy

Ask AI
{
    "success": true,
    "data": {
      "json": {
        "company_mission": "AI-powered web scraping and data extraction",
      },
      "metadata": {
        "title": "Firecrawl",
        "description": "AI-powered web scraping and data extraction",
        "robots": "follow, index",
        "ogTitle": "Firecrawl",
        "ogDescription": "AI-powered web scraping and data extraction",
        "ogUrl": "https://firecrawl.dev/",
        "ogImage": "https://firecrawl.dev/og.png",
        "ogLocaleAlternate": [],
        "ogSiteName": "Firecrawl",
        "sourceURL": "https://firecrawl.dev/"
      },
    }
}
​

JSON options object
The jsonOptions object accepts the following parameters:
* 		schema: The schema to use for the extraction.
* 		systemPrompt: The system prompt to use for the extraction.
* 		prompt: The prompt to use for the extraction without a schema.

Map

Input a website and get all the urls on the website - extremely fast
​

Introducing /map
The easiest way to go from a single url to a map of the entire website. This is extremely useful for:
* 		When you need to prompt the end-user to choose which links to scrape
* 		Need to quickly know the links on a website
* 		Need to scrape pages of a website that are related to a specific topic (use the search parameter)
* 		Only need to scrape specific pages of a website
​

Mapping
​

/map endpoint
Used to map a URL and get urls of the website. This returns most links present on the website.
​

Installation
PythonNode

GoRust

Copy

Ask AI
npm install @mendable/firecrawl-js
​

Usage
PythonNode

GoRustcURL

Copy

Ask AI
import FirecrawlApp, { MapResponse } from '@mendable/firecrawl-js';

const app = new FirecrawlApp({apiKey: "fc-YOUR_API_KEY"});

const mapResult = await app.mapUrl('https://firecrawl.dev') as MapResponse;

if (!mapResult.success) {
    throw new Error(`Failed to map: ${mapResult.error}`)
}

console.log(mapResult)
​

Response
SDKs will return the data object directly. cURL will return the payload exactly as shown below.

Copy

Ask AI
{
  "status": "success",
  "links": [
    "https://firecrawl.dev",
    "https://www.firecrawl.dev/pricing",
    "https://www.firecrawl.dev/blog",
    "https://www.firecrawl.dev/playground",
    "https://www.firecrawl.dev/smart-crawl",
    ...
  ]
}
​

Map with search
Map with search param allows you to search for specific urls inside a website.
cURL

Copy

Ask AI
curl -X POST https://api.firecrawl.dev/v1/map \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "url": "https://firecrawl.dev",
      "search": "docs"
    }'
Response will be an ordered list from the most relevant to the least relevant.

Copy

Ask AI
{
  "status": "success",
  "links": [
    "https://docs.firecrawl.dev",
    "https://docs.firecrawl.dev/sdks/python",
    "https://docs.firecrawl.dev/learn/rag-llama3",
  ]
}
The /extract endpoint simplifies collecting structured data from any number of URLs or entire domains. Provide a list of URLs, optionally with wildcards (e.g., example.com/*), and a prompt or schema describing the information you want. Firecrawl handles the details of crawling, parsing, and collating large or small datasets.

Extract is billed differently than other endpoints. See the Extract pricing for details.
​

Using /extract
You can extract structured data from one or multiple URLs, including wildcards:
* 		Single Page Example: https://firecrawl.dev/some-page
* 		Multiple Pages / Full Domain Example: https://firecrawl.dev/*
When you use /*, Firecrawl will automatically crawl and parse all URLs it can discover in that domain, then extract the requested data. This feature is experimental; email help@firecrawl.com if you have issues.
​

Example Usage
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const app = new FirecrawlApp({
  apiKey: "fc-YOUR_API_KEY"
});

// Define schema to extract contents into
const schema = z.object({
  company_mission: z.string(),
  supports_sso: z.boolean(),
  is_open_source: z.boolean(),
  is_in_yc: z.boolean()
});

const scrapeResult = await app.extract([
  'https://docs.firecrawl.dev/*', 
  'https://firecrawl.dev/', 
  'https://www.ycombinator.com/companies/'
], {
  prompt: "Extract the company mission, whether it supports SSO, whether it is open source, and whether it is in Y Combinator from the page.",
  schema: schema
});

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult.data);
Key Parameters:
* 		urls: An array of one or more URLs. Supports wildcards (/*) for broader crawling.
* 		prompt (Optional unless no schema): A natural language prompt describing the data you want or specifying how you want that data structured.
* 		schema (Optional unless no prompt): A more rigid structure if you already know the JSON layout.
* 		enableWebSearch (Optional): When true, extraction can follow links outside the specified domain.
See API Reference for more details.
​

Response (sdks)
JSON

Copy

Ask AI
{
  "success": true,
  "data": {
    "company_mission": "Firecrawl is the easiest way to extract data from the web. Developers use us to reliably convert URLs into LLM-ready markdown or structured data with a single API call.",
    "supports_sso": false,
    "is_open_source": true,
    "is_in_yc": true
  }
}
​

Asynchronous Extraction & Status Checking
When you submit an extraction job—either directly via the API or through the SDK’s asynchronous methods—you’ll receive a Job ID. You can use this ID to:
* 		Check Job Status: Send a request to the /extract/ endpoint to see if the job is still running or has finished.
* 		Automatically Poll (Default SDK Behavior): If you use the default extract method (Python/Node), the SDK automatically polls this endpoint for you and returns the final results once the job completes.
* 		Manually Poll (Async SDK Methods): If you use the asynchronous methods—async_extract (Python) or asyncExtract (Node)—the SDK immediately returns a Job ID that you can track. Use get_extract_status (Python) or getExtractStatus (Node) to check the job’s progress on your own schedule.

This endpoint only works for jobs in progress or recently completed (within 24 hours).
Below are code examples for checking an extraction job’s status using Python, Node.js, and cURL:
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({
  apiKey: "fc-YOUR_API_KEY"
});

// Start an extraction job first
const extractJob = await app.asyncExtract([
  'https://docs.firecrawl.dev/*', 
  'https://firecrawl.dev/'
], {
  prompt: "Extract the company mission and features from these pages."
});

// Get the status of the extraction job
const jobStatus = await app.getExtractStatus(extractJob.jobId);

console.log(jobStatus);
// Example output:
// {
//   status: "completed",
//   progress: 100,
//   results: [{
//     url: "https://docs.firecrawl.dev",
//     data: { ... }
//   }]
// }
​

Possible States
* 		completed: The extraction finished successfully.
* 		processing: Firecrawl is still processing your request.
* 		failed: An error occurred; data was not fully extracted.
* 		cancelled: The job was cancelled by the user.
​

Pending Example
JSON

Copy

Ask AI
{
  "success": true,
  "data": [],
  "status": "processing",
  "expiresAt": "2025-01-08T20:58:12.000Z"
}
​

Completed Example
JSON

Copy

Ask AI
{
  "success": true,
  "data": {
      "company_mission": "Firecrawl is the easiest way to extract data from the web. Developers use us to reliably convert URLs into LLM-ready markdown or structured data with a single API call.",
      "supports_sso": false,
      "is_open_source": true,
      "is_in_yc": true
    },
  "status": "completed",
  "expiresAt": "2025-01-08T20:58:12.000Z"
}
​

Extracting without a Schema
If you prefer not to define a strict structure, you can simply provide a prompt. The underlying model will choose a structure for you, which can be useful for more exploratory or flexible requests.
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({
apiKey: "fc-YOUR_API_KEY"
});

const scrapeResult = await app.extract([
'https://docs.firecrawl.dev/',
'https://firecrawl.dev/'
], {
prompt: "Extract Firecrawl's mission from the page."
});

if (!scrapeResult.success) {
throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult.data);
JSON

Copy

Ask AI
{
  "success": true,
  "data": {
    "company_mission": "Turn websites into LLM-ready data. Power your AI apps with clean data crawled from any website."
  }
}
​

Improving Results with Web Search
Setting enableWebSearch = true in your request will expand the crawl beyond the provided URL set. This can capture supporting or related information from linked pages.
Here’s an example that extracts information about dash cams, enriching the results with data from related pages:
PythonNode

cURL

Copy

Ask AI
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({
apiKey: "fc-YOUR_API_KEY"
});

const scrapeResult = await app.extract([
'https://nextbase.com/dash-cams/622gw-dash-cam'
], {
prompt: "Extract details about the best dash cams including prices, features, pros/cons and reviews.",
enableWebSearch: true // Enable web search for better context
});

if (!scrapeResult.success) {
throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult.data);
​

Example Response with Web Search
JSON

Copy

Ask AI
{
  "success": true,
  "data": {
    "dash_cams": [
      {
        "name": "Nextbase 622GW",
        "price": "$399.99",
        "features": [
          "4K video recording",
          "Image stabilization",
          "Alexa built-in",
          "What3Words integration"
        ],
        /* Information below enriched with other websites like 
        https://www.techradar.com/best/best-dash-cam found 
        via enableWebSearch parameter */
        "pros": [
          "Excellent video quality",
          "Great night vision",
          "Built-in GPS"
        ],
        "cons": ["Premium price point", "App can be finicky"]
      }
    ],
  }

The response includes additional context gathered from related pages, providing more comprehensive and accurate information.
​

Extracting without URLs
The /extract endpoint now supports extracting structured data using a prompt without needing specific URLs. This is useful for research or when exact URLs are unknown. Currently in Alpha.
PythonNode

cURL

Copy

Ask AI
import { z } from "zod";

// Define schema to extract contents into
const schema = z.object({
  company_mission: z.string(),
});

const scrapeResult = await app.extract([], {
  prompt: "Extract the company mission from Firecrawl's website.",
  schema: schema
});

if (!scrapeResult.success) {
  throw new Error(`Failed to scrape: ${scrapeResult.error}`)
}

console.log(scrapeResult.data);
​

Known Limitations (Beta)
1. Large-Scale Site Coverage Full coverage of massive sites (e.g., “all products on Amazon”) in a single request is not yet supported.
2. Complex Logical Queries Requests like “find every post from 2025” may not reliably return all expected data. More advanced query capabilities are in progress.
3. Occasional Inconsistencies Results might differ across runs, particularly for very large or dynamic sites. Usually it captures core details, but some variation is possible.
4. Beta State Since /extract is still in Beta, features and performance will continue to evolve. We welcome bug reports and feedback to help us improve.
​

Using FIRE-1
FIRE-1 is an AI agent that enhances Firecrawl’s scraping capabilities. It can controls browser actions and navigates complex website structures to enable comprehensive data extraction beyond traditional scraping methods.
You can leverage the FIRE-1 agent with the /v1/extract endpoint for complex extraction tasks that require navigation across multiple pages or interaction with elements.
Example (cURL):

Copy

Ask AI
curl -X POST https://api.firecrawl.dev/v1/extract \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "urls": ["https://example-forum.com/topic/123"],
      "prompt": "Extract all user comments from this forum thread.",
      "schema": {
        "type": "object",
        "properties": {
          "comments": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "author": {"type": "string"},
                "comment_text": {"type": "string"}
              },
              "required": ["author", "comment_text"]
            }
          }
        },
        "required": ["comments"]
      },
      "agent": {
        "model": "FIRE-1"
      }
    }'
