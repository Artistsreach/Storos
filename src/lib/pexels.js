// Pexels API client
// IMPORTANT: In a real application, use environment variables for API keys.
const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.error("VITE_PEXELS_API_KEY is not set. Please add it to your .env file. Pexels video search will fail.");
}

const PEXELS_VIDEO_API_URL = 'https://api.pexels.com/videos';
const PEXELS_PHOTO_API_URL = 'https://api.pexels.com/v1';

/**
 * Searches for videos on Pexels.
 * @param {string} query - The search query.
 * @param {number} perPage - Number of results per page.
 * @returns {Promise<object>} - A promise that resolves to an object containing videos or an error.
 */
export async function searchPexelsVideos(query, perPage = 15) { // Fetch more to get a random one
  if (!PEXELS_API_KEY) {
    return { error: "Pexels API Key not configured." };
  }
  if (!query || !query.trim()) {
    return { error: "Search query cannot be empty." };
  }

  // Ensure the query is a single word for relevance
  const searchQuery = query.split(' ')[0];

  const url = `${PEXELS_VIDEO_API_URL}/search?query=${encodeURIComponent(searchQuery)}&per_page=${perPage}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Pexels API error:', response.status, errorData);
      return { error: `Pexels API error: ${errorData.message || response.statusText}` };
    }

    const data = await response.json();
    
    if (!data.videos || data.videos.length === 0) {
      return { videos: [], totalResults: 0 };
    }

    // Select a random video from the results
    const randomIndex = Math.floor(Math.random() * data.videos.length);
    const randomVideo = data.videos[randomIndex];

    // Process the selected video
    const mp4File = randomVideo.video_files.find(vf => vf.file_type === 'video/mp4' && (vf.quality === 'hd' || vf.quality === 'sd'))
                    || randomVideo.video_files.find(vf => vf.file_type === 'video/mp4');

    const selectedVideo = {
      id: randomVideo.id,
      width: randomVideo.width,
      height: randomVideo.height,
      duration: randomVideo.duration,
      imageUrl: randomVideo.image,
      videoUrl: mp4File ? mp4File.link : (randomVideo.video_files[0] ? randomVideo.video_files[0].link : null),
      photographer: randomVideo.user.name,
      pexelsUrl: randomVideo.url,
    };

    // Return a single video object instead of an array
    return { video: selectedVideo, totalResults: data.total_results };

  } catch (error) {
    console.error('Error fetching from Pexels API:', error);
    return { error: `Network error or other issue fetching Pexels videos: ${error.message}` };
  }
}

/**
 * Searches for photos on Pexels.
 * @param {string} query - The search query.
 * @param {number} perPage - Number of results per page.
 * @returns {Promise<object>} - A promise that resolves to an object containing photos or an error.
 */
export async function searchPexelsPhotos(query, perPage = 9) {
  if (!PEXELS_API_KEY) {
    return { error: "Pexels API Key not configured." };
  }
  if (!query || !query.trim()) {
    return { error: "Search query cannot be empty." };
  }

  const url = `${PEXELS_PHOTO_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Pexels API error:', response.status, errorData);
      return { error: `Pexels API error: ${errorData.message || response.statusText}` };
    }

    const data = await response.json();
    
    const photos = data.photos.map(photo => ({
      id: photo.id,
      width: photo.width,
      height: photo.height,
      src: photo.src.medium, // Use 'medium' size for general display
      alt: photo.alt,
      photographer: photo.photographer,
      pexelsUrl: photo.url,
    }));

    return { photos, totalResults: data.total_results, page: data.page, perPage: data.per_page };

  } catch (error) {
    console.error('Error fetching from Pexels API:', error);
    return { error: `Network error or other issue fetching Pexels photos: ${error.message}` };
  }
}
