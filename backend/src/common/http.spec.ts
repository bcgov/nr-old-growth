import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { HttpRequestError, httpRequest } from './http';

function mockFetch(status: number, body: string) {
  return jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(body, { status }));
}

describe('httpRequest', () => {
  afterEach(() => jest.restoreAllMocks());

  it('sends basic auth and parses a JSON response', async () => {
    const fetchMock = mockFetch(200, JSON.stringify([{ id: 1 }]));
    const res = await httpRequest('https://x/api', {
      auth: { username: 'user', password: 'pässword' },
    });
    expect(res).toEqual({ status: 200, data: [{ id: 1 }] });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://x/api');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.signal).toBeUndefined();
    const headers = init.headers as Headers;
    expect(headers.get('authorization')).toBe(
      `Basic ${Buffer.from('user:pässword', 'utf8').toString('base64')}`,
    );
    expect(headers.get('accept')).toBe('application/json, text/plain, */*');
  });

  it('serializes object bodies as JSON and keeps string bodies as-is', async () => {
    const fetchMock = mockFetch(201, '');
    await httpRequest('https://x', { method: 'POST', body: { a: 1 } });
    await httpRequest('https://x', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const [, json] = fetchMock.mock.calls[0] as [string, RequestInit];
    const [, form] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(json.body).toBe('{"a":1}');
    expect((json.headers as Headers).get('content-type')).toBe(
      'application/json',
    );
    expect(form.body).toBe('grant_type=client_credentials');
    expect((form.headers as Headers).get('content-type')).toBe(
      'application/x-www-form-urlencoded',
    );
  });

  it('returns text for non-JSON and an empty string for an empty body', async () => {
    mockFetch(200, 'plain');
    await expect(httpRequest('https://x')).resolves.toEqual({
      status: 200,
      data: 'plain',
    });
    jest.restoreAllMocks();
    mockFetch(200, '');
    await expect(httpRequest('https://x')).resolves.toEqual({
      status: 200,
      data: '',
    });
  });

  it('throws with response status and data on non-2xx', async () => {
    mockFetch(503, JSON.stringify({ detail: 'down' }));
    const error = (await httpRequest('https://x').catch(
      (e) => e,
    )) as HttpRequestError;
    expect(error).toBeInstanceOf(HttpRequestError);
    expect(error.message).toBe('Request failed with status code 503');
    expect(error.response).toEqual({ status: 503, data: { detail: 'down' } });
  });

  it('throws without a response on network failure, using the cause message', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('fetch failed', {
        cause: new Error('getaddrinfo ENOTFOUND x'),
      }),
    );
    const error = (await httpRequest('https://x').catch(
      (e) => e,
    )) as HttpRequestError;
    expect(error).toBeInstanceOf(HttpRequestError);
    expect(error.message).toBe('getaddrinfo ENOTFOUND x');
    expect(error.response).toBeUndefined();
  });

  it('passes an abort signal when a timeout is set', async () => {
    const fetchMock = mockFetch(200, '{}');
    await httpRequest('https://x', { timeoutMs: 1000 });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
