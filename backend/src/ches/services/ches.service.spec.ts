import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ChesService } from './ches.service';

const ENV_KEYS = [
  'CHES_TOKEN_URL',
  'CHES_API_URL',
  'CHES_EMAIL_FROM',
  'CHES_CLIENT_ID',
  'CHES_CLIENT_SECRET',
  'NODE_ENV',
];

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

function fetchCall(fetchMock: ReturnType<typeof jest.spyOn>, index: number) {
  const [url, init] = fetchMock.mock.calls[index] as [string, RequestInit];
  return { url, init, headers: init.headers as Headers };
}

describe('ChesService', () => {
  let fetchMock: ReturnType<typeof jest.spyOn>;
  const saved: Record<string, string | undefined> = {};
  let service: ChesService;

  beforeEach(() => {
    for (const key of ENV_KEYS) saved[key] = process.env[key];
    process.env.CHES_TOKEN_URL = 'https://token.example/token';
    process.env.CHES_API_URL = 'https://ches.example/api/v1';
    process.env.CHES_EMAIL_FROM = 'noreply@gov.bc.ca';
    process.env.CHES_CLIENT_ID = 'client';
    process.env.CHES_CLIENT_SECRET = 'secret';
    process.env.NODE_ENV = 'test';
    service = new ChesService();
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  describe('getToken', () => {
    it('requests a client-credentials token and returns the access token', async () => {
      fetchMock.mockResolvedValue(json(200, { access_token: 'abc' }));

      await expect(service.getToken()).resolves.toBe('abc');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const { url, init, headers } = fetchCall(fetchMock, 0);
      expect(url).toBe('https://token.example/token');
      expect(init.method).toBe('POST');
      expect(init.body).toBe('grant_type=client_credentials');
      expect(headers.get('authorization')).toBe(
        `Basic ${Buffer.from('client:secret').toString('base64')}`,
      );
      expect(headers.get('content-type')).toBe(
        'application/x-www-form-urlencoded',
      );
    });

    it('wraps token failures in a 500 HttpException', async () => {
      fetchMock.mockRejectedValue(new Error('boom'));

      const error = await service.getToken().catch((e) => e);
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.getResponse().message).toContain('boom');
    });

    it('wraps non-2xx token responses in a 500 HttpException', async () => {
      fetchMock.mockResolvedValue(json(401, { error: 'unauthorized' }));

      const error = await service.getToken().catch((e) => e);
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.getResponse().message).toContain(
        'Request failed with status code 401',
      );
    });
  });

  describe('sendEmail', () => {
    it('rejects when CHES configuration is missing', () => {
      delete process.env.CHES_API_URL;

      expect(() => service.sendEmail({ emailTo: ['a@gov.bc.ca'] })).toThrow(
        HttpException,
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects when there is no recipient', () => {
      expect(() => service.sendEmail({ emailTo: undefined })).toThrow(
        'Failed to send email, missing required emailTo parameter',
      );
    });

    it('does not post outside production', async () => {
      fetchMock.mockResolvedValue(json(200, { access_token: 'abc' }));

      await expect(
        service.sendEmail({ emailTo: ['a@gov.bc.ca'] }),
      ).resolves.toEqual({
        status: 200,
        data: 'Not send email in dev deployment',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('posts the email with the bearer token in production', async () => {
      process.env.NODE_ENV = 'production';
      fetchMock
        .mockResolvedValueOnce(json(200, { access_token: 'abc' }))
        .mockResolvedValueOnce(json(201, { txId: '1' }));

      await expect(
        service.sendEmail({
          emailTo: ['a@gov.bc.ca'],
          emailSubject: 'Subject',
          emailBody: '<p>Body</p>',
          emailBodyType: 'html',
        }),
      ).resolves.toEqual({ status: 201, data: { txId: '1' } });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const { url, init, headers } = fetchCall(fetchMock, 1);
      expect(url).toBe('https://ches.example/api/v1/email');
      expect(init.method).toBe('POST');
      expect(headers.get('authorization')).toBe('Bearer abc');
      expect(headers.get('content-type')).toBe('application/json');
      expect(JSON.parse(init.body as string)).toEqual(
        expect.objectContaining({
          to: ['a@gov.bc.ca'],
          from: 'noreply@gov.bc.ca',
          subject: 'Subject',
          body: '<p>Body</p>',
          bodyType: 'html',
        }),
      );
    });

    it('wraps a failed post in an HttpException', async () => {
      process.env.NODE_ENV = 'production';
      fetchMock
        .mockResolvedValueOnce(json(200, { access_token: 'abc' }))
        .mockRejectedValueOnce(new Error('down'));

      await expect(
        service.sendEmail({ emailTo: ['a@gov.bc.ca'] }),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('wraps a non-2xx post in an HttpException', async () => {
      process.env.NODE_ENV = 'production';
      fetchMock
        .mockResolvedValueOnce(json(200, { access_token: 'abc' }))
        .mockResolvedValueOnce(json(500, { error: 'boom' }));

      await expect(
        service.sendEmail({ emailTo: ['a@gov.bc.ca'] }),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('fails when the token response has no access token', async () => {
      fetchMock.mockResolvedValue(json(200, {}));

      await expect(
        service.sendEmail({ emailTo: ['a@gov.bc.ca'] }),
      ).rejects.toBeInstanceOf(HttpException);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
