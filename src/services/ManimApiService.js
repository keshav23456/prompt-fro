import { API_CONFIG, QUALITY_OPTIONS, VIDEO_STATUS } from "./apiConfig.js";
import { ApiError, handleApiResponse, createApiUrl } from "./apiUtils.js";

class ManimApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.pollInterval = API_CONFIG.POLL_INTERVAL;
  }

  createAbortController() {
    return new AbortController();
  }

  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return await handleApiResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    }
  }

  // Fixed: createApiUrl now correctly receives (baseURL, endpoint).
  async getApiStatus() {
    try {
      const url = createApiUrl(this.baseURL, '/');
      return await this.fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      throw new ApiError(`Failed to get API status: ${error.message}`, error.status || 500);
    }
  }

  async getAiStatus() {
    try {
      const url = createApiUrl(this.baseURL, '/ai-status');
      return await this.fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      throw new ApiError(`Failed to get AI status: ${error.message}`, error.status || 500);
    }
  }

  async generateVideo({ prompt, quality = QUALITY_OPTIONS.MEDIUM, useAi = true, signal = null }) {
    if (!prompt || prompt.trim().length === 0) {
      throw new ApiError('Prompt is required', 400);
    }

    if (!Object.values(QUALITY_OPTIONS).includes(quality)) {
      throw new ApiError(`Invalid quality option: ${quality}`, 400);
    }

    try {
      const url = createApiUrl(this.baseURL, '/generate-video');
      const requestBody = {
        prompt: prompt.trim(),
        quality,
        use_ai: useAi
      };

      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        signal
      });

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Video generation was cancelled', 499);
      }
      throw new ApiError(`Failed to generate video: ${error.message}`, error.status || 500);
    }
  }

  async getVideoStatus(videoId) {
    if (!videoId) {
      throw new ApiError('Video ID is required', 400);
    }

    try {
      const url = createApiUrl(this.baseURL, `/status/${videoId}`);
      return await this.fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      throw new ApiError(`Failed to get video status: ${error.message}`, error.status || 500);
    }
  }

  // New: list all previously generated videos (backend now persists an
  // index on disk), so the library survives a page refresh.
  async listVideos() {
    try {
      const url = createApiUrl(this.baseURL, '/videos');
      return await this.fetchWithTimeout(url, { method: 'GET' });
    } catch (error) {
      throw new ApiError(`Failed to list videos: ${error.message}`, error.status || 500);
    }
  }

  async downloadVideo(videoId) {
    if (!videoId) {
      throw new ApiError('Video ID is required', 400);
    }

    try {
      const url = createApiUrl(this.baseURL, `/download/${videoId}`);
      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        throw new ApiError(`Download failed: ${response.statusText}`, response.status);
      }

      return response;
    } catch (error) {
      throw new ApiError(`Failed to download video: ${error.message}`, error.status || 500);
    }
  }

  async deleteVideo(videoId) {
    if (!videoId) {
      throw new ApiError('Video ID is required', 400);
    }

    try {
      const url = createApiUrl(this.baseURL, `/delete/${videoId}`);
      return await this.fetchWithTimeout(url, { method: 'DELETE' });
    } catch (error) {
      throw new ApiError(`Failed to delete video: ${error.message}`, error.status || 500);
    }
  }

  async pollVideoStatus(videoId, onProgress = null, signal = null) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          if (signal?.aborted) {
            reject(new ApiError('Status polling was cancelled', 499));
            return;
          }

          const status = await this.getVideoStatus(videoId);

          if (onProgress) {
            onProgress(status);
          }

          if (status.status === VIDEO_STATUS.READY) {
            resolve(status);
          } else if (status.status === VIDEO_STATUS.NOT_FOUND) {
            reject(new ApiError('Video not found', 404));
          } else {
            setTimeout(poll, this.pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  async generateVideoWithPolling({
    prompt,
    quality = QUALITY_OPTIONS.MEDIUM,
    useAi = true,
    onProgress = null,
    signal = null
  }) {
    const generateResponse = await this.generateVideo({ prompt, quality, useAi, signal });

    if (generateResponse.status !== 'success' || !generateResponse.video_id) {
      throw new ApiError('Video generation failed', 500, generateResponse);
    }

    // Backend renders synchronously before responding, so the video is
    // already ready — but we still confirm via status for UI consistency.
    const finalStatus = await this.pollVideoStatus(generateResponse.video_id, onProgress, signal);

    return { ...generateResponse, finalStatus };
  }

  async downloadVideoBlob(videoId, filename = null) {
    try {
      const response = await this.downloadVideo(videoId);
      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || `manim_animation_${videoId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, filename: link.download };
    } catch (error) {
      throw new ApiError(`Failed to download video: ${error.message}`, error.status || 500);
    }
  }

  async deleteMultipleVideos(videoIds) {
    const results = await Promise.allSettled(videoIds.map(id => this.deleteVideo(id)));

    return results.map((result, index) => ({
      videoId: videoIds[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  }

  async healthCheck() {
    try {
      const response = await this.getApiStatus();
      return {
        healthy: true,
        status: response.status,
        version: response.version,
        aiAvailable: response.ai_available
      };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

export const manimApi = new ManimApiService();

export const {
  getApiStatus,
  getAiStatus,
  generateVideo,
  getVideoStatus,
  listVideos,
  downloadVideo,
  deleteVideo,
  pollVideoStatus,
  generateVideoWithPolling,
  downloadVideoBlob,
  deleteMultipleVideos,
  healthCheck
} = manimApi;

export { ManimApiService };

export const useApiService = () => manimApi;

export default manimApi;
