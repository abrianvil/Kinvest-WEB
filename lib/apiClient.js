const isServer = typeof window === 'undefined';
const shouldUseProxy = process.env.NEXT_PUBLIC_USE_API_PROXY !== 'false' && !isServer;
const API_BASE_URL = shouldUseProxy
  ? ''
  : process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function buildHeaders(token, extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function fetchFromApi(path, { token, method = 'GET', body, headers } = {}) {
  if (!token) {
    throw new Error('Missing API token for authenticated request');
  }

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: buildHeaders(token, headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const error = new Error(errorPayload?.error || `API request failed: ${response.status}`);
    error.status = response.status;
    error.payload = errorPayload;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
