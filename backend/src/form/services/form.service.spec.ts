import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { HttpException } from '@nestjs/common';
import axios from 'axios';
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

  it('skips the cron run and alerts when form settings are missing', async () => {
    await expect(service.handleIDIRForm()).resolves.toBeNull();
    expect(get).not.toHaveBeenCalled();
    expect(errorEmails()).toHaveLength(1);
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

  it('logs a failure and alerts when the district email is invalid', async () => {
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
    expect(errorEmails()).toHaveLength(1);
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

  it('logs a failure and alerts when CHEFS cannot be read', async () => {
    get.mockRejectedValue(new Error('unreachable'));

    const [result] = await service.handleSubmissions(FORM_ID, VERSION_ID, 'pw');

    expect(result).toBeInstanceOf(HttpException);
    expect(errorEmails()).toHaveLength(1);
    expect(repo.rows).toEqual([
      expect.objectContaining({ code: 'FAILED', formId: FORM_ID }),
    ]);
  });
});
