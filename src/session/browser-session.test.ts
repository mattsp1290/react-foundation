import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../test/server.js';
import { createBrowserSession } from './browser-session.js';
import { ApiError } from './errors.js';
import { createRequest } from './request.js';

const request = createRequest({ resolveUrl: (path) => `/api${path}` });
const session = createBrowserSession(request);

describe('browser session client', () => {
  it('honors the host URL resolver and includes credentials', async () => {
    let requested = '';
    let accept = '';
    let credentials = '';
    server.use(
      http.get('/api/users/me', ({ request }) => {
        requested = new URL(request.url).pathname;
        accept = request.headers.get('accept') ?? '';
        credentials = request.credentials;
        return HttpResponse.json({ username: 'bird' });
      }),
    );
    await expect(session.currentUser()).resolves.toEqual({ username: 'bird' });
    expect(requested).toBe('/api/users/me');
    expect(accept).toBe('application/json');
    expect(credentials).toBe('include');
  });

  it('lets caller headers override the default Accept header', async () => {
    let accept = '';
    server.use(
      http.get('/api/anything', ({ request }) => {
        accept = request.headers.get('accept') ?? '';
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await request('/anything', { headers: { Accept: 'text/plain' } });
    expect(accept).toBe('text/plain');
  });

  it('posts the exact credential document to register', async () => {
    let body: unknown;
    let authorization: string | null = '';
    server.use(
      http.post('/api/users', async ({ request }) => {
        body = await request.json();
        authorization = request.headers.get('authorization');
        return HttpResponse.json({ username: 'bird' }, { status: 201 });
      }),
    );
    await expect(session.register('bird', 'secret')).resolves.toEqual({
      username: 'bird',
    });
    expect(body).toEqual({ username: 'bird', password: 'secret' });
    expect(authorization).toBeNull();
  });

  it('sends UTF-8 Basic credentials only for login', async () => {
    let authorization = '';
    server.use(
      http.post('/api/auth/browser/login', ({ request }) => {
        authorization = request.headers.get('authorization') ?? '';
        return HttpResponse.json({});
      }),
    );
    await session.login('søren', 'secret');
    expect(authorization).toMatch(/^Basic /);
    const bytes = Uint8Array.from(atob(authorization.slice(6)), (c) =>
      c.charCodeAt(0),
    );
    expect(new TextDecoder().decode(bytes)).toBe('søren:secret');
  });

  it('preserves the API status and error code', async () => {
    server.use(
      http.post('/api/auth/browser/logout', () =>
        HttpResponse.json(
          { error: { code: 'logout_unavailable' } },
          { status: 503 },
        ),
      ),
    );
    await expect(session.logout()).rejects.toEqual(
      new ApiError(503, 'logout_unavailable'),
    );
  });

  it('reports a non-JSON error body without a code', async () => {
    server.use(
      http.get(
        '/api/users/me',
        () => new HttpResponse('<html>Bad gateway</html>', { status: 502 }),
      ),
    );
    const error = await session.currentUser().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 502,
      code: undefined,
      message: 'Request failed with 502',
    });
  });

  it('accepts only 204 as a completed logout', async () => {
    server.use(
      http.post(
        '/api/auth/browser/logout',
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    await expect(session.logout()).resolves.toBeUndefined();
    server.use(
      http.post('/api/auth/browser/logout', () =>
        HttpResponse.json({}, { status: 200 }),
      ),
    );
    await expect(session.logout()).rejects.toEqual(
      new ApiError(200, 'unexpected_logout_response'),
    );
  });
});
