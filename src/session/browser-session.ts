import { basicAuthorization } from './credentials.js';
import { ApiError } from './errors.js';
import type { Request } from './request.js';

export type CurrentUser = { username: string };
export type RegisteredUser = { username: string };

export type BrowserSession = {
  register(username: string, password: string): Promise<RegisteredUser>;
  currentUser(): Promise<CurrentUser>;
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
};

/**
 * The Birb browser-session contract. Paths reach `request` unchanged; the
 * host's `resolveUrl` adds any proxy prefix.
 */
export function createBrowserSession(request: Request): BrowserSession {
  return {
    async register(username, password) {
      return (
        await request('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
      ).json() as Promise<RegisteredUser>;
    },
    async currentUser() {
      return (await request('/users/me')).json() as Promise<CurrentUser>;
    },
    async login(username, password) {
      await request('/auth/browser/login', {
        method: 'POST',
        headers: { Authorization: basicAuthorization(username, password) },
      });
    },
    async logout() {
      const response = await request('/auth/browser/logout', {
        method: 'POST',
      });
      if (response.status !== 204) {
        throw new ApiError(response.status, 'unexpected_logout_response');
      }
    },
  };
}
