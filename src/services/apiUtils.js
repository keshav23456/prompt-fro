export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      errorData?.detail || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }
  return response.json();
};

// Fixed: now takes baseURL explicitly instead of silently dropping it.
// Every call site below passes (this.baseURL, endpoint).
export const createApiUrl = (baseURL, endpoint) => {
  return `${baseURL}${endpoint}`;
};
