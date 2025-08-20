// ScreenshotOne client helper
// Fetches a screenshot and returns a data URL suitable for image analysis flows.

export async function takeScreenshot(options = {}) {
  const {
    url,
    html,
    markdown,
    format = 'png',
    full_page = true,
    image_width,
    image_height,
    selector,
    viewport_width,
    viewport_height,
    response_type, // optional: 'by_format' | 'empty' | 'json'
  } = options;

  let accessKey;
  try {
    // Vite/ESM environment
    accessKey = import.meta?.env?.VITE_SCREENSHOTONE_ACCESS_KEY;
  } catch (_) {
    // ignore if import.meta is not available
  }
  if (!accessKey && typeof window !== 'undefined') {
    accessKey = window.SCREENSHOTONE_ACCESS_KEY;
  }

  if (!accessKey) {
    throw new Error('Missing ScreenshotOne access key. Set VITE_SCREENSHOTONE_ACCESS_KEY in your environment.');
  }

  if (!url && !html && !markdown) {
    throw new Error('ScreenshotOne: one of url, html, or markdown must be provided.');
  }

  const params = new URLSearchParams();
  if (url) params.set('url', url);
  if (html) params.set('html', html);
  if (markdown) params.set('markdown', markdown);
  if (format) params.set('format', format);
  if (typeof full_page !== 'undefined') params.set('full_page', String(Boolean(full_page)));
  if (image_width) params.set('image_width', String(image_width));
  if (image_height) params.set('image_height', String(image_height));
  if (selector) params.set('selector', selector);
  if (viewport_width) params.set('viewport_width', String(viewport_width));
  if (viewport_height) params.set('viewport_height', String(viewport_height));
  if (response_type) params.set('response_type', response_type);
  params.set('access_key', accessKey);

  const apiUrl = `https://api.screenshotone.com/take?${params.toString()}`;

  const res = await fetch(apiUrl, { method: 'GET' });
  if (!res.ok) {
    let message = `ScreenshotOne error: HTTP ${res.status}`;
    try {
      const maybeJson = await res.clone().json();
      if (maybeJson && maybeJson.error && maybeJson.error.message) {
        message = `ScreenshotOne error: ${maybeJson.error.message}`;
      }
    } catch (_) {
      // ignore JSON parse error, keep default message
    }
    throw new Error(message);
  }

  // If user asked for non-binary formats (like html/markdown with by_format), just return text
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || contentType.includes('text/markdown') || contentType.includes('application/json')) {
    const text = await res.text();
    return { dataUrl: null, text, apiUrl };
  }

  const blob = await res.blob();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return { dataUrl, apiUrl };
}
