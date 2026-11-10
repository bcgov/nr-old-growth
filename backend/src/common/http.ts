/**
 * Minimal native fetch helper that keeps the HTTP client behaviour this backend relied on:
 * HTTP Basic auth, JSON request bodies, JSON-or-text response parsing, and an error
 * with `response.status`/`response.data` for any non-2xx status. Network failures
 * throw an HttpRequestError without `response`, using the underlying cause's message.
 */
export interface HttpResponse<T = any> {
  status: number;
  data: T;
}

export class HttpRequestError extends Error {
  readonly response?: HttpResponse;

  constructor(message: string, response?: HttpResponse) {
    super(message);
    this.name = 'HttpRequestError';
    this.response = response;
  }
}

export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  auth?: { username?: string; password?: string };
  body?: unknown;
  timeoutMs?: number;
}

export async function httpRequest<T = any>(
  url: string,
  {
    method = 'GET',
    headers = {},
    auth,
    body,
    timeoutMs,
  }: HttpRequestOptions = {},
): Promise<HttpResponse<T>> {
  const finalHeaders = new Headers({
    Accept: 'application/json, text/plain, */*',
  });
  for (const [key, value] of Object.entries(headers)) {
    finalHeaders.set(key, value);
  }
  if (auth) {
    const credentials = `${auth.username ?? ''}:${auth.password ?? ''}`;
    finalHeaders.set(
      'Authorization',
      `Basic ${Buffer.from(credentials, 'utf8').toString('base64')}`,
    );
  }
  let payload: string | undefined;
  if (body !== undefined && body !== null) {
    if (typeof body === 'string') {
      payload = body;
    } else {
      payload = JSON.stringify(body);
      if (!finalHeaders.has('Content-Type')) {
        finalHeaders.set('Content-Type', 'application/json');
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      signal: timeoutMs ? AbortSignal.timeout(timeoutMs) : undefined,
    });
  } catch (e) {
    const cause = (e as { cause?: unknown })?.cause;
    const message =
      cause instanceof Error ? cause.message : (e as Error)?.message;
    throw new HttpRequestError(message ?? String(e));
  }

  const text = await response.text();
  let data: any = text;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    throw new HttpRequestError(
      `Request failed with status code ${response.status}`,
      { status: response.status, data },
    );
  }
  return { status: response.status, data };
}
