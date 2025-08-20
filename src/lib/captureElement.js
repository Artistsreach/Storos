// Capture a DOM element (or selector) to a PNG data URL using html2canvas
// Falls back to document.getElementById('root') or document.body if selector not found
export async function captureElementPngDataUrl(elementOrSelector, options = {}) {
  const { backgroundColor = null, scale = window.devicePixelRatio || 1 } = options;

  let el = elementOrSelector;
  if (typeof elementOrSelector === 'string') {
    el = document.querySelector(elementOrSelector);
  }
  if (!el) {
    el = document.getElementById('root') || document.body;
  }
  if (!el) throw new Error('No element found to capture.');

  // Dynamic import to avoid bundling issues if not always used
  const { default: html2canvas } = await import('html2canvas');

  const canvas = await html2canvas(el, {
    backgroundColor, // null preserves transparency if possible
    scale,
    useCORS: true,
    logging: false,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight,
  });
  return canvas.toDataURL('image/png');
}
