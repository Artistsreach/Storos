export async function captureScreenFrame() {
  // Prompt user to select a screen/window/tab
  const supported = !!(navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function');
  const secure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost');
  if (!supported) {
    throw new Error('Screen capture is not supported here. Use a Chromium-based desktop browser and serve over https or http://localhost. Alternatively, capture an image and use analyzeScreenshot methods.');
  }
  if (!secure) {
    throw new Error('Screen capture requires a secure context. Serve your app over https or http://localhost.');
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  try {
    const [track] = stream.getVideoTracks();

    // Try ImageCapture API if available
    let frameBitmap = null;
    try {
      if ('ImageCapture' in window) {
        // eslint-disable-next-line no-undef
        const imageCapture = new ImageCapture(track);
        if (imageCapture.grabFrame) {
          frameBitmap = await imageCapture.grabFrame();
        }
      }
    } catch (_) {
      // fall back below
    }

    if (!frameBitmap) {
      // Fallback via a hidden <video>
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      await new Promise((r) => setTimeout(r, 120));
      const { videoWidth: w, videoHeight: h } = video;
      const canvas = Object.assign(document.createElement('canvas'), { width: w, height: h });
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      track.stop();
      return { dataUrl: canvas.toDataURL('image/png'), mime: 'image/png' };
    }

    const canvas = Object.assign(document.createElement('canvas'), { width: frameBitmap.width, height: frameBitmap.height });
    const ctx = canvas.getContext('2d');
    ctx.drawImage(frameBitmap, 0, 0);
    track.stop();
    return { dataUrl: canvas.toDataURL('image/png'), mime: 'image/png' };
  } finally {
    // Ensure all tracks are stopped
    stream.getTracks().forEach((t) => t.stop());
  }
}
