export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 300000,
  DEFAULT_QUALITY: 'medium',
  POLL_INTERVAL: 2000,
};
  // types.js
  export const QUALITY_OPTIONS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  };
  
  export const VIDEO_STATUS = {
    GENERATING: 'generating',
    READY: 'ready',
    NOT_FOUND: 'not_found',
    ERROR: 'error'
  };