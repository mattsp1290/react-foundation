import { ApiError } from './errors.js';

export type Request = (path: string, init?: RequestInit) => Promise<Response>;

/**
 * Builds the fetch wrapper for a cookie-session API. The host decides how a
 * path becomes a URL (for example by adding a same-origin proxy prefix).
 */
export function createRequest({
  resolveUrl,
}: {
  resolveUrl: (path: string) => string;
}): Request {
  return async (path, init = {}) => {
    const response = await fetch(resolveUrl(path), {
      ...init,
      credentials: 'include',
      headers: { Accept: 'application/json', ...init.headers },
    });
    if (!response.ok) {
      let code: string | undefined;
      try {
        code = ((await response.json()) as { error?: { code?: string } }).error
          ?.code;
      } catch {
        // An unavailable proxy can return a non-JSON response.
      }
      throw new ApiError(response.status, code);
    }
    return response;
  };
}
