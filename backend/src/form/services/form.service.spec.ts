import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HttpException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { EmailService } from '../../email/services/email.service';
import { EmailSubmissionLog } from '../entities/emailSubmissionLog.interface';
import { FormService } from './form.service';

// In-memory stand-in for the TypeORM repository, matching on plain equality.
class FakeRepository {
  rows: EmailSubmissionLog[] = [];

  private matches(row: EmailSubmissionLog, where: Record<string, unknown>) {
    return Object.entries(where).every(([key, value]) => {
      const actual = row[key as keyof EmailSubmissionLog];
      if (value instanceof Date && actual instanceof Date) {
        return value.getTime() === actual.getTime();
      }
      return actual === value;
    });
  }

  async find(options?: { where: Record<string, unknown> }) {
    return this.rows.filter(
      (row) => !options || this.matches(row, options.where),
    );
  }

  async save(entity: EmailSubmissionLog) {
    if (!entity.id) {
      entity.id = this.rows.length + 1;
    }
    this.rows.push({ ...entity });
    return entity;
  }

  async update(where: Record<string, unknown>, patch: EmailSubmissionLog) {
    this.rows
      .filter((row) => this.matches(row, where))
      .forEach((row) => Object.assign(row, patch));
  }
}

const FORM_ID = 'form-1';
const VERSION_ID = 'version-1';
const DISTRICT = 'Example Natural Resource District - district@gov.bc.ca';

function submission(overrides: Record<string, unknown> = {}) {
  const recent = new Date(Date.now() - 60 * 1000).toISOString();
  return {
    id: 'sub-1',
    confirmationId: 'ABC123',
    createdAt: recent,
    updatedAt: recent,
    createdBy: 'submitter',
    updatedBy: 'someone-else',
    submission: {
      state: 'submitted',
      data: { naturalResourceDistrict: DISTRICT },
    },
    ...overrides,
  };
}

describe('FormService', () => {
  let repo: FakeRepository;
  let sendEmail: jest.Mock<
    (email: unknown) => Promise<{ status: number; data: unknown }>
  >;
  let service: FormService;
  let get: ReturnType<typeof jest.spyOn>;

  const submissionEmails = () =>
    sendEmail.mock.calls
      .map(
        ([email]) =>
          email as {
            emailTo: string[];
            emailSubject: string;
            emailBody: string;
          },
      )
      .filter((email) =>
        email.emailSubject.startsWith('Old growth field observation'),
      );
  const errorEmails = () =>
    sendEmail.mock.calls
      .map(([email]) => email as { emailSubject: string })
      .filter(
        (email) => email.emailSubject === 'Old Growth Email Notification Error',
      );

  function chefsReturns(submissions: unknown[]) {
    get.mockResolvedValue({ data: submissions });
  }

  beforeEach(() => {
    repo = new FakeRepository();
    sendEmail = jest.fn(async () => ({ status: 201, data: 'sent' }));
    service = new FormService(
      repo as never,
      { sendEmail } as unknown as EmailService,
    );
    get = jest.spyOn(axios, 'get');
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.IDIR_FORM_ID;
    delete process.env.IDIR_FORM_VERSION_ID;
    delete process.env.IDIR_FORM_PASSWORD;
  });

  it('skips the cron run and logs an error when form settings are missing', async () => {
    const errorSpy = jest.spyOn(service['logger'], 'error');
    await expect(service.handleIDIRForm()).resolves.toBeNull();
    expect(get).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      'IDIR form environment variables are not set; skipping cron run',
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('reads the configured form from CHEFS with its credentials', async () => {
    process.env.IDIR_FORM_ID = FORM_ID;
    process.env.IDIR_FORM_VERSION_ID = VERSION_ID;
    process.env.IDIR_FORM_PASSWORD = 'form-password';
    chefsReturns([]);

    await service.handleIDIRForm();

    expect(get).toHaveBeenCalledWith(
      `https://submit.digital.gov.bc.ca/app/api/v1/forms/${FORM_ID}/versions/${VERSION_ID}/submissions`,
      { auth: { username: FORM_ID, password: 'form-password' } },
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('emails the district for a new submission and logs it as delivered', async () => {
    chefsReturns([submission()]);

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    const [email] = submissionEmails();
    expect(submissionEmails()).toHaveLength(1);
    expect(email.emailTo).toEqual(['district@gov.bc.ca']);
    expect(email.emailSubject).toContain('ABC123');
    expect(email.emailBody).toContain('has been submitted');
    expect(repo.rows).toEqual([
      expect.objectContaining({
        confirmationId: 'ABC123',
        emailType: 'NEW',
        code: 'DELIVERED',
        formId: FORM_ID,
      }),
    ]);
  });

  it('does not email a submission that was already delivered', async () => {
    repo.rows.push({
      confirmationId: 'ABC123',
      emailType: 'NEW',
      code: 'DELIVERED',
    });
    chefsReturns([submission()]);

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('ignores submissions created before the cron window', async () => {
    const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    chefsReturns([submission({ createdAt: old, updatedAt: old })]);

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('retries a failed delivery and updates its log', async () => {
    const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    repo.rows.push({
      confirmationId: 'ABC123',
      emailType: 'NEW',
      code: 'FAILED',
    });
    chefsReturns([submission({ createdAt: old, updatedAt: old })]);

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(submissionEmails()).toHaveLength(1);
    expect(repo.rows).toHaveLength(1);
    expect(repo.rows[0].code).toBe('DELIVERED');
  });

  it('sends an update email when the submitter edits their submission', async () => {
    const old = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    repo.rows.push({
      confirmationId: 'ABC123',
      emailType: 'NEW',
      code: 'DELIVERED',
    });
    chefsReturns([submission({ createdAt: old, updatedBy: 'submitter' })]);

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    const emails = submissionEmails();
    expect(emails).toHaveLength(1);
    expect(emails[0].emailBody).toContain('has been updated');
    expect(repo.rows).toContainEqual(
      expect.objectContaining({ emailType: 'UPDATE', code: 'DELIVERED' }),
    );
  });

  it('escapes submission values in the email body', async () => {
    chefsReturns([submission({ confirmationId: '<b>X</b>', id: '"><x' })]);

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    const [email] = submissionEmails();
    expect(email.emailBody).toContain('&lt;b&gt;X&lt;/b&gt;');
    expect(email.emailBody).toContain('&quot;&gt;&lt;x');
    expect(email.emailBody).not.toContain('<b>X</b>');
  });

  it('logs a failure and warns when the district email is invalid', async () => {
    chefsReturns([
      submission({
        submission: {
          state: 'submitted',
          data: { naturalResourceDistrict: 'No email here' },
        },
      }),
    ]);

    const [result] = await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(result).toBeInstanceOf(HttpException);
    expect(submissionEmails()).toHaveLength(0);
    expect(errorEmails()).toHaveLength(0);
    expect(repo.rows).toEqual([
      expect.objectContaining({ confirmationId: 'ABC123', code: 'FAILED' }),
    ]);
  });

  it('logs a failure when the email cannot be sent', async () => {
    sendEmail.mockRejectedValue(new Error('CHES down'));
    chefsReturns([submission()]);

    const [result] = await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(result).toBeInstanceOf(HttpException);
    expect(repo.rows).toEqual([
      expect.objectContaining({ confirmationId: 'ABC123', code: 'FAILED' }),
    ]);
  });

  it('logs a failure when CHEFS cannot be read', async () => {
    const errorSpy = jest.spyOn(service['logger'], 'error');
    get.mockRejectedValue(new Error('unreachable'));

    const [result] = await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(result).toBeInstanceOf(HttpException);
    expect(errorEmails()).toHaveLength(0);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `Failed to fetch submissions needing notification for form ${FORM_ID}`,
      ),
    );
    expect(repo.rows).toEqual([
      expect.objectContaining({ code: 'FAILED', formId: FORM_ID }),
    ]);
  });

  it('retries transient 503 errors from CHEFS and delivers notifications on retry', async () => {
    const error503 = new AxiosError(
      'Request failed with status code 503',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      { status: 503 } as any,
    );
    get
      .mockRejectedValueOnce(error503)
      .mockResolvedValueOnce({ data: [submission()] });

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(get).toHaveBeenCalledTimes(2);
    expect(submissionEmails()).toHaveLength(1);
    expect(repo.rows).toEqual([
      expect.objectContaining({
        confirmationId: 'ABC123',
        emailType: 'NEW',
        code: 'DELIVERED',
      }),
    ]);
  });

  it('does not retry 401 client errors from CHEFS', async () => {
    const error401 = new AxiosError(
      'Request failed with status code 401',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      { status: 401 } as any,
    );
    get.mockRejectedValue(error401);

    const [result] = await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(result).toBeInstanceOf(HttpException);
    expect(get).toHaveBeenCalledTimes(1);
    expect(repo.rows).toEqual([
      expect.objectContaining({ code: 'FAILED', formId: FORM_ID }),
    ]);
  });

  it('recovers missed new submissions from a previous failed cron run', async () => {
    const missedCreatedAt = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    repo.rows.push({
      id: 1,
      formId: FORM_ID,
      formVersionId: VERSION_ID,
      code: 'FAILED',
      exceptionLog: 'Failed to fetch submissions from CHEFS: 503',
      createTimestamp: new Date(Date.now() - 10 * 60 * 1000),
    });

    chefsReturns([
      submission({
        confirmationId: 'MISSED1',
        createdAt: missedCreatedAt,
        updatedAt: missedCreatedAt,
      }),
    ]);

    await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(submissionEmails()).toHaveLength(1);
    expect(repo.rows).toContainEqual(
      expect.objectContaining({
        confirmationId: 'MISSED1',
        emailType: 'NEW',
        code: 'DELIVERED',
      }),
    );
    expect(repo.rows[0].exceptionLog).toContain('[RECOVERED]');
  });
});
