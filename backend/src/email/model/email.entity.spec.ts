import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { EmailEntity } from './email.entity';

/**
 * Exercises the same pipe configuration used in main.ts
 * (whitelist: true, transform: true) against the EmailEntity contract.
 */
describe('EmailEntity request validation', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const transform = (payload: unknown) =>
    pipe.transform(payload, { type: 'body', metatype: EmailEntity });

  const validEmail: Partial<EmailEntity> = {
    emailTo: ['name@gov.bc.ca'],
    emailSubject: 'Test Email',
    emailBody: 'Hello World',
    emailBodyType: 'text',
  };

  it('accepts a valid payload', async () => {
    const result = await transform(validEmail);
    expect(result.emailTo).toEqual(['name@gov.bc.ca']);
    expect(result.emailBodyType).toBe('text');
  });

  it('rejects a non-array or empty emailTo', async () => {
    await expect(transform({ ...validEmail, emailTo: undefined })).rejects.toThrow(
      BadRequestException,
    );
    await expect(transform({ ...validEmail, emailTo: [] })).rejects.toThrow(
      BadRequestException,
    );
    await expect(transform({ ...validEmail, emailTo: 'name@gov.bc.ca' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects malformed recipient addresses', async () => {
    await expect(
      transform({ ...validEmail, emailTo: ['not-an-email'] }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects more than 50 recipients', async () => {
    const recipients = Array.from({ length: 51 }, (_, i) => `user${i}@gov.bc.ca`);
    await expect(transform({ ...validEmail, emailTo: recipients })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an invalid sender address when provided', async () => {
    await expect(
      transform({ ...validEmail, emailFrom: 'not-an-email' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects an unsupported emailBodyType', async () => {
    await expect(
      transform({ ...validEmail, emailBodyType: 'markdown' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects an over-length subject', async () => {
    await expect(
      transform({ ...validEmail, emailSubject: 'x'.repeat(256) }),
    ).rejects.toThrow(BadRequestException);
  });

  it('strips unknown properties from the body', async () => {
    const result = (await transform({
      ...validEmail,
      emailFrom: 'sender@gov.bc.ca',
      bcc: ['sneaky@evil.example'],
    })) as EmailEntity;
    expect(result.emailFrom).toBe('sender@gov.bc.ca');
    expect(result).not.toHaveProperty('bcc');
  });

  it('rejects malformed attachment entries', async () => {
    await expect(
      transform({
        ...validEmail,
        emailAttachments: [{ content: 42 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects an unsupported attachment encoding', async () => {
    await expect(
      transform({
        ...validEmail,
        emailAttachments: [{ content: 'aGk=', encoding: 'rot13' }],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
