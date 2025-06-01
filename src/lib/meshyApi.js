// Meshy API utility functions for 3D model generation
const MESHY_API_BASE_URL = 'https://api.meshy.ai/openapi/v1';

// Get API key from environment variable
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_MESHY_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_MESHY_API_KEY environment variable is not set');
  }
  return apiKey;
};

/**
 * Create a new Image to 3D task
 * @param {string} imageUrl - URL or data URI of the image
 * @param {Object} options - Optional parameters
 * @returns {Promise<string>} - Task ID
 */
export const createImageTo3DTask = async (imageUrl, options = {}) => {
  const apiKey = getApiKey();
  
  const payload = {
    image_url: imageUrl,
    ai_model: options.ai_model || 'meshy-4',
    topology: options.topology || 'triangle',
    target_polycount: options.target_polycount || 30000,
    symmetry_mode: options.symmetry_mode || 'auto',
    should_remesh: options.should_remesh !== undefined ? options.should_remesh : true,
    should_texture: options.should_texture !== undefined ? options.should_texture : true,
    enable_pbr: options.enable_pbr !== undefined ? options.enable_pbr : true,
    moderation: options.moderation !== undefined ? options.moderation : false,
    ...options
  };

  try {
    const response = await fetch(`${MESHY_API_BASE_URL}/image-to-3d`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || `API Error: ${response.status}`);
    }

    if (!data.result) {
      throw new Error('Task ID not found in response');
    }

    return data.result;
  } catch (error) {
    console.error('Error creating Meshy Image to 3D task:', error);
    throw error;
  }
};

/**
 * Get the status of an Image to 3D task
 * @param {string} taskId - The task ID
 * @returns {Promise<Object>} - Task object with status, progress, and model URLs
 */
export const getImageTo3DTask = async (taskId) => {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${MESHY_API_BASE_URL}/image-to-3d/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching Meshy task status:', error);
    throw error;
  }
};

/**
 * Poll a task until completion
 * @param {string} taskId - The task ID
 * @param {Function} onProgress - Callback for progress updates
 * @param {number} pollInterval - Polling interval in milliseconds (default: 5000)
 * @returns {Promise<Object>} - Final task object
 */
export const pollTaskUntilComplete = async (taskId, onProgress = () => {}, pollInterval = 5000) => {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const task = await getImageTo3DTask(taskId);
        
        // Call progress callback
        onProgress(task);

        if (task.status === 'SUCCEEDED') {
          resolve(task);
        } else if (task.status === 'FAILED') {
          reject(new Error(task.task_error?.message || 'Task failed'));
        } else if (task.status === 'CANCELED') {
          reject(new Error('Task was canceled'));
        } else {
          // Continue polling for PENDING or IN_PROGRESS
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
};

/**
 * Generate a 3D model from an image and wait for completion
 * @param {string} imageUrl - URL or data URI of the image
 * @param {Object} options - Optional parameters
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - Final task object with model URLs
 */
export const generateImageTo3D = async (imageUrl, options = {}, onProgress = () => {}) => {
  try {
    // Create the task
    const taskId = await createImageTo3DTask(imageUrl, options);
    
    // Poll until completion
    const result = await pollTaskUntilComplete(taskId, onProgress);
    
    return result;
  } catch (error) {
    console.error('Error generating 3D model:', error);
    throw error;
  }
};

/**
 * List all Image to 3D tasks
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Array of task objects
 */
export const listImageTo3DTasks = async (options = {}) => {
  const apiKey = getApiKey();
  
  const params = new URLSearchParams();
  if (options.page_num) params.append('page_num', options.page_num);
  if (options.page_size) params.append('page_size', options.page_size);
  if (options.sort_by) params.append('sort_by', options.sort_by);

  try {
    const response = await fetch(`${MESHY_API_BASE_URL}/image-to-3d?${params}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error listing Meshy tasks:', error);
    throw error;
  }
};

/**
 * Convert an image file to a data URI
 * @param {File} file - The image file
 * @returns {Promise<string>} - Data URI string
 */
export const fileToDataUri = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert an image URL to a data URI (for CORS-enabled images)
 * @param {string} imageUrl - The image URL
 * @returns {Promise<string>} - Data URI string
 */
export const imageUrlToDataUri = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataUri = canvas.toDataURL('image/png');
        resolve(dataUri);
      } catch (error) {
        reject(new Error('Failed to convert image to data URI'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};
