import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { EmailSubmissionLogEntity } from './emailSubmissionLog.entity';

/**
 * Exercises the same pipe configuration used in main.ts
 * (whitelist: true, transform: true) against the submission-log contract
 * shared by POST /form/postLog and POST /form/updateLog.
 */
describe('EmailSubmissionLogEntity request validation', () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const transform = (payload: unknown) =>
    pipe.transform(payload, { type: 'body', metatype: EmailSubmissionLogEntity });

  const validLog = {
    code: 'DELIVERED',
    confirmationId: '23F86A29',
    formId: 'form-1',
    formVersionId: '1',
    emailType: 'NEW',
    exceptionLog: '',
  };

  it('accepts a valid payload', async () => {
    const result = await transform(validLog);
    expect(result.confirmationId).toBe('23F86A29');
    expect(result.code).toBe('DELIVERED');
  });

  it('strips the primary key (id) from the body — mass-assignment guard', async () => {
    const result = (await transform({ ...validLog, id: 42 })) as EmailSubmissionLogEntity;
    expect(result).not.toHaveProperty('id');
  });

  it('strips createTimestamp from the body — server-controlled field', async () => {
    const result = (await transform({
      ...validLog,
      createTimestamp: '2020-01-01T00:00:00.000Z',
    })) as EmailSubmissionLogEntity;
    expect(result).not.toHaveProperty('createTimestamp');
  });

  it('rejects an emailType outside NEW/UPDATE', async () => {
    await expect(transform({ ...validLog, emailType: 'UNKNOWN' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a code outside DELIVERED/FAILED', async () => {
    await expect(transform({ ...validLog, code: 'MAYBE' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects an over-length exceptionLog (varchar(500) column)', async () => {
    await expect(
      transform({ ...validLog, exceptionLog: 'x'.repeat(501) }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects an over-length confirmationId (varchar(10) column)', async () => {
    await expect(
      transform({ ...validLog, confirmationId: 'X'.repeat(11) }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects non-string form identifiers', async () => {
    await expect(transform({ ...validLog, formId: 12345 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('coerces an ISO string submissionUpdatedAt into a Date', async () => {
    const result = (await transform({
      ...validLog,
      submissionUpdatedAt: '2023-01-09T01:14:17.531Z',
    })) as EmailSubmissionLogEntity;
    expect(result.submissionUpdatedAt).toBeInstanceOf(Date);
  });

  it('strips unknown properties from the body', async () => {
    const result = (await transform({
      ...validLog,
      sneakyField: 'drop-table',
    })) as EmailSubmissionLogEntity;
    expect(result).not.toHaveProperty('sneakyField');
  });
});
