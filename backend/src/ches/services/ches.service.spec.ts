import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ChesService } from './ches.service';

const ENV_KEYS = [
  'CHES_TOKEN_URL',
  'CHES_API_URL',
  'CHES_EMAIL_FROM',
  'CHES_CLIENT_ID',
  'CHES_CLIENT_SECRET',
  'NODE_ENV',
];

describe('ChesService', () => {
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
      const request = jest
        .spyOn(axios, 'request')
        .mockResolvedValue({ data: { access_token: 'abc' } });

      await expect(service.getToken()).resolves.toBe('abc');
      expect(request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://token.example/token',
          auth: { username: 'client', password: 'secret' },
          data: 'grant_type=client_credentials',
        }),
      );
    });

    it('wraps token failures in a 500 HttpException', async () => {
      jest.spyOn(axios, 'request').mockRejectedValue(new Error('boom'));

      const error = await service.getToken().catch((e) => e);
      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('sendEmail', () => {
    it('rejects when CHES configuration is missing', () => {
      delete process.env.CHES_API_URL;
      const post = jest.spyOn(axios, 'post');

      expect(() => service.sendEmail({ emailTo: ['a@gov.bc.ca'] })).toThrow(
        HttpException,
      );
      expect(post).not.toHaveBeenCalled();
    });

    it('rejects when there is no recipient', () => {
      expect(() => service.sendEmail({ emailTo: undefined })).toThrow(
        'Failed to send email, missing required emailTo parameter',
      );
    });

    it('does not post outside production', async () => {
      jest
        .spyOn(axios, 'request')
        .mockResolvedValue({ data: { access_token: 'abc' } });
      const post = jest.spyOn(axios, 'post');

      await expect(
        service.sendEmail({ emailTo: ['a@gov.bc.ca'] }),
      ).resolves.toEqual({
        status: 200,
        data: 'Not send email in dev deployment',
      });
      expect(post).not.toHaveBeenCalled();
    });

    it('posts the email with the bearer token in production', async () => {
      process.env.NODE_ENV = 'production';
      jest
        .spyOn(axios, 'request')
        .mockResolvedValue({ data: { access_token: 'abc' } });
      const post = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ status: 201, data: { txId: '1' } });

      await expect(
        service.sendEmail({
          emailTo: ['a@gov.bc.ca'],
          emailSubject: 'Subject',
          emailBody: '<p>Body</p>',
          emailBodyType: 'html',
        }),
      ).resolves.toEqual({ status: 201, data: { txId: '1' } });

      expect(post).toHaveBeenCalledWith(
        'https://ches.example/api/v1/email',
        expect.objectContaining({
          to: ['a@gov.bc.ca'],
          from: 'noreply@gov.bc.ca',
          subject: 'Subject',
          body: '<p>Body</p>',
          bodyType: 'html',
        }),
        { headers: { Authorization: 'Bearer abc' } },
      );
    });

    it('wraps a failed post in an HttpException', async () => {
      process.env.NODE_ENV = 'production';
      jest
        .spyOn(axios, 'request')
        .mockResolvedValue({ data: { access_token: 'abc' } });
      jest.spyOn(axios, 'post').mockRejectedValue(new Error('down'));

      await expect(
        service.sendEmail({ emailTo: ['a@gov.bc.ca'] }),
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('fails when the token response has no access token', async () => {
      jest.spyOn(axios, 'request').mockResolvedValue({ data: {} });
      const post = jest.spyOn(axios, 'post');

      await expect(
        service.sendEmail({ emailTo: ['a@gov.bc.ca'] }),
      ).rejects.toBeInstanceOf(HttpException);
      expect(post).not.toHaveBeenCalled();
    });
  });
});
