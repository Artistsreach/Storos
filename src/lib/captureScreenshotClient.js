// Capture the current screen/tab using the Screen Capture API and return a PNG data URL
// Note: This prompts the user to select a screen/window/tab. Most browsers support it over HTTPS or localhost.
export async function captureScreenPngDataUrl() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    throw new Error('Screen capture not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  try {
    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    // Prefer grabbing a frame if available
    if (imageCapture && imageCapture.grabFrame) {
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      track.stop();
      return dataUrl;
    }
  } catch (_) {
    // Fallback to drawing <video> frame
  }

  // Fallback approach using <video>
  return await new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play().then(() => {
        const w = video.videoWidth;
        const h = video.videoHeight;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/png');
        // stop tracks
        stream.getTracks().forEach(t => t.stop());
        resolve(dataUrl);
      }).catch(err => {
        stream.getTracks().forEach(t => t.stop());
        reject(err);
      });
    };
    video.onerror = (e) => {
      stream.getTracks().forEach(t => t.stop());
      reject(new Error('Unable to play captured stream.'));
    };
  });
}
