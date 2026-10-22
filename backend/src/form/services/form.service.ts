import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosError } from 'axios';
import { Cron } from '@nestjs/schedule';
import { EmailSubmissionLogEntity } from '../entities/emailSubmissionLog.entity';
import { EmailSubmissionLog } from '../entities/emailSubmissionLog.interface';
import { EmailService } from '../../email/services/email.service';
import { EmailEntity } from '../../email/model/email.entity';

// --- Constants ---

/** Cron interval in minutes. Update the @Cron expression below to match. */
const CRON_INTERVAL_MINUTES = 10;

/** Maximum lookback window in hours for recovering missed submissions during an extended outage. */
const MAX_RECOVERY_WINDOW_HOURS = 24;
const MAX_RECOVERY_WINDOW_MS = MAX_RECOVERY_WINDOW_HOURS * 60 * 60 * 1000;

/** Earliest date from which update-email notifications are considered valid. */
const UPDATE_NOTIFICATION_EPOCH = new Date('2023-01-09T01:14:17.531Z');

const CHEFS_SUBMISSIONS_URL = (formId: string, formVersionId: string) =>
  `https://submit.digital.gov.bc.ca/app/api/v1/forms/${formId}/versions/${formVersionId}/submissions`;

/** Strongly-typed email classification for submission log entries. */
enum EmailType {
  NEW = 'NEW',
  UPDATE = 'UPDATE',
}

/** Result codes stored against each log entry. */
enum LogCode {
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

// ---------------------------------------------------------------------------

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);
  private readonly lastSuccessfulPoll = new Map<string, Date>();

  constructor(
    @InjectRepository(EmailSubmissionLogEntity)
    private readonly emailSubmissionLogRepository: Repository<EmailSubmissionLogEntity>,
    private readonly emailService: EmailService,
  ) {}

  // -------------------------------------------------------------------------
  // Cron handlers
  // -------------------------------------------------------------------------

  /** Runs every 10 minutes – keep the @Cron expression in sync with CRON_INTERVAL_MINUTES. */
  @Cron('*/10 * * * *')
  async handleIDIRForm(): Promise<unknown> {
    this.logger.debug('IDIR form cron triggered');
    const formId = process.env.IDIR_FORM_ID;
    const formVersionId = process.env.IDIR_FORM_VERSION_ID;
    const formPassword = process.env.IDIR_FORM_PASSWORD;

    if (!formId || !formVersionId || !formPassword) {
      const msg =
        'IDIR form environment variables are not set; skipping cron run';
      this.logger.error(msg);
      return null;
    }

    return this.handleSubmissions(formId, formVersionId, formPassword);
  }

  @Cron('*/10 * * * *')
  async handleBCEIDForm(): Promise<unknown> {
    this.logger.debug('BCEID form cron triggered');
    const formId = process.env.BCEID_FORM_ID;
    const formVersionId = process.env.BCEID_FORM_VERSION_ID;
    const formPassword = process.env.BCEID_FORM_PASSWORD;

    if (!formId || !formVersionId || !formPassword) {
      const msg =
        'BCEID form environment variables are not set; skipping cron run';
      this.logger.error(msg);
      return null;
    }

    return this.handleSubmissions(formId, formVersionId, formPassword);
  }

  // -------------------------------------------------------------------------
  // Repository helpers
  // -------------------------------------------------------------------------

  findAllEmailSubmissionLogs(): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find();
  }

  findEmailSubmissionLog(confirmationId: string): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({ where: { confirmationId } });
  }

  findNewEmailSubmissionLog(
    confirmationId: string,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: { confirmationId, emailType: EmailType.NEW },
    });
  }

  findUpdateEmailSubmissionLog(
    confirmationId: string,
    submissionUpdatedAt: Date,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: {
        confirmationId,
        emailType: EmailType.UPDATE,
        submissionUpdatedAt,
      },
    });
  }

  /**
   * Persists a new log entry, or updates an existing one when appropriate:
   *  - NEW  entry: updates if a record already exists (idempotent re-delivery).
   *  - UPDATE entry: updates only when the existing record shows FAILED.
   */
  async postEmailSubmissionLog(log: EmailSubmissionLog): Promise<void> {
    try {
      if (log.confirmationId) {
        if (log.emailType === EmailType.NEW) {
          const existing = await this.findNewEmailSubmissionLog(
            log.confirmationId,
          );
          if (existing.length > 0) {
            await this.updateEmailSubmissionLog(
              log.confirmationId,
              log.emailType,
              {
                code: log.code,
              },
            );
            return;
          }
        } else if (log.emailType === EmailType.UPDATE) {
          const existing = await this.findUpdateEmailSubmissionLog(
            log.confirmationId,
            log.submissionUpdatedAt,
          );
          if (existing.length > 0 && existing[0].code === LogCode.FAILED) {
            await this.updateEmailSubmissionLog(
              log.confirmationId,
              log.emailType,
              { code: log.code },
              log.submissionUpdatedAt,
            );
            return;
          }
        }
      }

      log.createTimestamp = log.createTimestamp ?? new Date();
      const entity = Object.assign(new EmailSubmissionLogEntity(), log);
      await this.emailSubmissionLogRepository.save(entity);
    } catch (e) {
      this.logger.error(
        `Failed to write log to DB: ${this.getErrorMessage(e)}`,
      );
      throw e;
    }
  }

  async updateEmailSubmissionLog(
    confirmationId: string,
    emailType: EmailType | string,
    patch: Partial<EmailSubmissionLog>,
    submissionUpdatedAt?: Date,
  ): Promise<void> {
    try {
      const criteria = submissionUpdatedAt
        ? { confirmationId, emailType, submissionUpdatedAt }
        : { confirmationId, emailType };
      await this.emailSubmissionLogRepository.update(criteria, patch);
    } catch (e) {
      this.logger.error(
        `Failed to update log in DB: ${this.getErrorMessage(e)}`,
      );
      throw e;
    }
  }

  /** Safely extracts an error message without defaulting to '[object Object]'. */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /** Minimal HTML escape to avoid injecting submission values into emails. */
  private escapeHtml(input: string): string {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // -------------------------------------------------------------------------
  // Core processing
  // -------------------------------------------------------------------------

  /**
   * Determines whether an Axios error is retryable (transient server errors, rate limits, or network failures).
   */
  private isRetryableError(error: AxiosError): boolean {
    const status = error.response?.status;
    if (status && (status >= 500 || status === 429)) {
      return true;
    }
    if (!error.response) {
      return true;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      if (typeof timer.unref === 'function') {
        timer.unref();
      }
    });
  }

  /**
   * Performs an HTTP GET to CHEFS API with exponential backoff retry on transient errors.
   */
  async fetchChefsSubmissions(
    url: string,
    formId: string,
    formPassword: string,
    options?: {
      maxRetries?: number;
      initialDelayMs?: number;
      backoffFactor?: number;
    },
  ): Promise<Array<{ [key: string]: any }>> {
    const maxRetries = options?.maxRetries ?? 3;
    const initialDelay =
      options?.initialDelayMs ?? (process.env.NODE_ENV === 'test' ? 0 : 1000);
    const backoffFactor = options?.backoffFactor ?? 2;

    const executeAttempt = async (
      attempt: number,
      delay: number,
    ): Promise<any> => {
      try {
        const response = await axios.get(url, {
          auth: { username: formId, password: formPassword },
        });

        if (!response?.data) {
          throw new HttpException(
            { message: 'CHEFS API returned an empty response' },
            HttpStatus.BAD_REQUEST,
          );
        }

        return response.data;
      } catch (e) {
        if (e instanceof HttpException) throw e;

        const axiosError = e as AxiosError;
        const isRetryable = this.isRetryableError(axiosError);

        if (!isRetryable || attempt >= maxRetries) {
          throw new HttpException(
            {
              message: `Failed to fetch submissions from CHEFS: ${axiosError.message}`,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        this.logger.warn(
          `CHEFS API request failed (attempt ${attempt}/${maxRetries}): ${axiosError.message}. Retrying in ${delay}ms...`,
        );

        if (delay > 0) {
          await this.sleep(delay);
        }

        return executeAttempt(attempt + 1, delay * backoffFactor);
      }
    };

    return executeAttempt(1, initialDelay);
  }

  /**
   * Determines the start of the query window. Expands the window back if a previous
   * cron poll failed, ensuring submissions submitted during downtime are not lost.
   * Clamps recovery to a maximum of MAX_RECOVERY_WINDOW_HOURS.
   */
  async determineWindowStart(formId: string, now: Date): Promise<Date> {
    const defaultStart = new Date(
      now.getTime() - 1000 * 60 * CRON_INTERVAL_MINUTES,
    );
    const maxRecoveryStart = new Date(now.getTime() - MAX_RECOVERY_WINDOW_MS);

    const inMemoryStart = this.getInMemoryRecoveryStart(
      formId,
      defaultStart,
      maxRecoveryStart,
    );
    if (inMemoryStart) {
      return inMemoryStart;
    }

    const logRecoveryStart = await this.getLogRecoveryStart(
      formId,
      defaultStart,
      maxRecoveryStart,
    );
    return logRecoveryStart ?? defaultStart;
  }

  private getInMemoryRecoveryStart(
    formId: string,
    defaultStart: Date,
    maxRecoveryStart: Date,
  ): Date | null {
    const inMemoryLast = this.lastSuccessfulPoll.get(formId);
    if (!inMemoryLast) {
      return null;
    }
    if (inMemoryLast < defaultStart) {
      const clampedStart =
        inMemoryLast < maxRecoveryStart ? maxRecoveryStart : inMemoryLast;
      this.logger.warn(
        `${formId}: Expanding query window to ${clampedStart.toISOString()} (last successful poll was ${inMemoryLast.toISOString()})`,
      );
      return clampedStart;
    }
    return defaultStart;
  }

  private async getLogRecoveryStart(
    formId: string,
    defaultStart: Date,
    maxRecoveryStart: Date,
  ): Promise<Date | null> {
    try {
      const logs = await this.emailSubmissionLogRepository.find({
        where: { formId, code: LogCode.FAILED },
      });
      const unhandled = logs.filter(
        (log) =>
          !log.confirmationId &&
          log.createTimestamp &&
          !log.exceptionLog?.includes('[RECOVERED]'),
      );
      if (unhandled.length === 0) {
        return null;
      }

      const recent = unhandled.filter(
        (log) =>
          new Date(log.createTimestamp).getTime() >=
          maxRecoveryStart.getTime(),
      );
      if (recent.length === 0) {
        return null;
      }

      recent.sort(
        (a, b) =>
          new Date(a.createTimestamp).getTime() -
          new Date(b.createTimestamp).getTime(),
      );
      const earliestFailure = recent[0];
      const failureWindowStart =
        this.calculateFailureWindowStart(earliestFailure);
      const clampedStart =
        failureWindowStart < maxRecoveryStart
          ? maxRecoveryStart
          : failureWindowStart;

      if (clampedStart < defaultStart) {
        this.logger.warn(
          `${formId}: Found prior API failure from ${new Date(earliestFailure.createTimestamp).toISOString()}; expanding query window to ${clampedStart.toISOString()}`,
        );
        return clampedStart;
      }
    } catch (e) {
      this.logger.warn(
        `Failed to inspect previous failure logs for form ${formId}: ${this.getErrorMessage(e)}; falling back to max recovery window ${maxRecoveryStart.toISOString()}`,
      );
      return maxRecoveryStart;
    }

    return null;
  }

  private calculateFailureWindowStart(
    failureLog: EmailSubmissionLogEntity | EmailSubmissionLog,
  ): Date {
    // Use exact persisted boundary if available; otherwise fall back to failure timestamp with safety buffer
    if (failureLog.submissionUpdatedAt) {
      return new Date(failureLog.submissionUpdatedAt);
    }
    return new Date(
      new Date(failureLog.createTimestamp).getTime() -
        1000 * 60 * (CRON_INTERVAL_MINUTES + 1),
    );
  }

  /**
   * Marks unhandled API failure logs as recovered after a successful poll.
   */
  private async markApiFailuresRecovered(formId: string): Promise<void> {
    try {
      const logs = await this.emailSubmissionLogRepository.find({
        where: { formId, code: LogCode.FAILED },
      });
      const unhandled = logs.filter(
        (log) =>
          !log.confirmationId && !log.exceptionLog?.includes('[RECOVERED]'),
      );
      await Promise.all(
        unhandled.map((log) => {
          const updatedMsg = `${(log.exceptionLog || '').slice(0, 480)} [RECOVERED]`;
          if (log.id) {
            return this.emailSubmissionLogRepository.update(
              { id: log.id },
              { exceptionLog: updatedMsg },
            );
          }
          return this.emailSubmissionLogRepository.update(
            { formId, code: LogCode.FAILED, exceptionLog: log.exceptionLog },
            { exceptionLog: updatedMsg },
          );
        }),
      );
    } catch (e) {
      this.logger.warn(
        `Failed to mark API failure logs as recovered for form ${formId}: ${this.getErrorMessage(e)}`,
      );
    }
  }

  /**
   * Fetches all submissions for a form version from CHEFS and returns only
   * those that require an email notification (new or updated since last cron run).
   */
  async getSubmissionsNeedingNotification(
    formId: string,
    formVersionId: string,
    formPassword: string,
    pollStartTime: Date = new Date(),
    windowStart?: Date,
  ): Promise<Array<{ [key: string]: any }>> {
    const allSubmissions = await this.fetchChefsSubmissions(
      CHEFS_SUBMISSIONS_URL(formId, formVersionId),
      formId,
      formPassword,
    );

    const effectiveWindowStart =
      windowStart ?? (await this.determineWindowStart(formId, pollStartTime));
    const filterEndTime = new Date();
    return this.filterSubmissions(
      allSubmissions,
      effectiveWindowStart,
      filterEndTime,
      formId,
      formVersionId,
    );
  }

  /**
   * Durably records successful poll recovery after all notifications in the
   * window have had their outcomes persisted to the database.
   */
  private async acknowledgeRecovery(
    formId: string,
    pollStartTime: Date,
  ): Promise<void> {
    this.lastSuccessfulPoll.set(formId, pollStartTime);
    await this.markApiFailuresRecovered(formId);
  }

  /**
   * Classifies each submission as NEW, UPDATE, both, or neither based on
   * database state and the current cron window.
   */
  async filterSubmissions(
    submissions: Array<{ [key: string]: any }>,
    windowStart: Date,
    windowEnd: Date,
    formId: string,
    formVersionId: string,
  ): Promise<Array<{ [key: string]: any }>> {
    const windowStartMs = windowStart.valueOf();
    const windowEndMs = windowEnd.valueOf();
    const results: Array<{ [key: string]: any }> = [];

    try {
      await Promise.all(
        submissions.map(async (submission) => {
          const createdMs = new Date(submission.createdAt).valueOf();
          const updatedMs = new Date(submission.updatedAt).valueOf();

          // --- NEW email ---
          const logsAll = await this.findEmailSubmissionLog(
            submission.confirmationId,
          );
          const needsNew =
            (logsAll.length === 0 &&
              createdMs > windowStartMs &&
              createdMs <= windowEndMs &&
              submission.submission?.state === 'submitted') ||
            logsAll[0]?.code === LogCode.FAILED;

          const pushIfNotExists = (item: any) => {
            const exists = results.some(
              (r) =>
                r.confirmationId === item.confirmationId &&
                r.emailType === item.emailType,
            );
            if (!exists) results.push(item);
          };

          if (needsNew) {
            pushIfNotExists({ ...submission, emailType: EmailType.NEW });
          }

          // --- UPDATE email ---
          const logsUpdate = await this.findUpdateEmailSubmissionLog(
            submission.confirmationId,
            new Date(submission.updatedAt),
          );
          const submitterIsOwner =
            submission.updatedBy &&
            submission.updatedBy === submission.createdBy;
          const updatedAfterEpoch =
            updatedMs > UPDATE_NOTIFICATION_EPOCH.valueOf();

          const needsUpdate =
            (updatedMs > windowStartMs &&
              updatedMs <= windowEndMs &&
              submitterIsOwner &&
              logsUpdate.length === 0) ||
            (submitterIsOwner &&
              logsUpdate.length === 0 &&
              updatedAfterEpoch) ||
            logsUpdate[0]?.code === LogCode.FAILED;

          if (needsUpdate) {
            pushIfNotExists({ ...submission, emailType: EmailType.UPDATE });
          }
        }),
      );
    } catch (e) {
      this.logger.error(
        `Failed to filter submissions for form ${formId}: ${this.getErrorMessage(e)}`,
      );
      throw e;
    }

    return results;
  }

  /**
   * Orchestrates the full notification pipeline for a single form:
   * fetch → filter → send emails → log outcomes.
   */
  async handleSubmissions(
    formId: string,
    formVersionId: string,
    formPassword: string,
  ): Promise<unknown[]> {
    const pollStartTime = new Date();
    let windowStart: Date;
    try {
      windowStart = await this.determineWindowStart(formId, pollStartTime);
    } catch {
      windowStart = new Date(
        pollStartTime.getTime() - 1000 * 60 * CRON_INTERVAL_MINUTES,
      );
    }

    let submissionsToNotify: Array<{ [key: string]: any }>;

    try {
      submissionsToNotify = await this.getSubmissionsNeedingNotification(
        formId,
        formVersionId,
        formPassword,
        pollStartTime,
        windowStart,
      );
    } catch (e) {
      const errorMsg = `Failed to fetch submissions needing notification for form ${formId}: ${this.getErrorMessage(e)}`;
      this.logger.error(errorMsg);
      await this.postEmailSubmissionLog({
        code: LogCode.FAILED,
        exceptionLog: errorMsg,
        formId,
        formVersionId,
        createTimestamp: pollStartTime,
        submissionUpdatedAt: windowStart,
      }).catch((logErr) => {
        this.logger.warn(
          `Could not persist form-level failure log for form ${formId}: ${this.getErrorMessage(logErr)}`,
        );
      });
      return [
        new HttpException(
          { message: errorMsg },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      ];
    }

    if (!submissionsToNotify?.length) {
      await this.acknowledgeRecovery(formId, pollStartTime);
      this.logger.debug(
        `${formId}: No notifications needed in this cron window`,
      );
      return [
        {
          msg: 'No new or updated submissions within the last cron job interval',
        },
      ];
    }

    this.logger.log(
      `${formId}: Sending ${submissionsToNotify.length} notification(s)`,
    );

    let outcomes: unknown[];
    try {
      outcomes = await Promise.all(
        submissionsToNotify.map((submission) =>
          this.sendSubmissionEmail(submission, formId, formVersionId),
        ),
      );
    } catch (e) {
      const errorMsg = `Failed to process notifications or persist outcomes for form ${formId}: ${this.getErrorMessage(e)}`;
      this.logger.error(errorMsg);
      return [
        new HttpException(
          { message: errorMsg },
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      ];
    }

    await this.acknowledgeRecovery(formId, pollStartTime);

    return outcomes;
  }

  // -------------------------------------------------------------------------
  // Email helpers
  // -------------------------------------------------------------------------

  /**
   * Sends a single submission notification email and records the outcome.
   */
  private async sendSubmissionEmail(
    submission: { [key: string]: any },
    formId: string,
    formVersionId: string,
  ): Promise<{ status: number; data: unknown } | HttpException> {
    const isUpdate = submission.emailType === EmailType.UPDATE;
    const actionWord = isUpdate ? 'updated' : 'submitted';

    const districtRaw: string =
      submission.submission?.data?.naturalResourceDistrict ?? '';
    const emailTo = districtRaw.split('-')[1]?.trim();

    const isValidEmail = (addr: string): boolean => {
      if (!addr) return false;

      const atIndex = addr.indexOf('@');
      if (atIndex <= 0 || atIndex !== addr.lastIndexOf('@')) return false;

      const local = addr.slice(0, atIndex);
      const domain = addr.slice(atIndex + 1);

      if (!local || !domain) return false;
      if (domain.startsWith('.') || domain.endsWith('.')) return false;
      if (!domain.includes('.')) return false;

      return !addr.includes(' ');
    };

    if (!emailTo || !isValidEmail(emailTo)) {
      this.logger.warn(
        `${formId}: Could not parse valid district email from "${districtRaw}" for ${submission.confirmationId}`,
      );
      const errMsg = `${formId}: Invalid or missing recipient for ${submission.confirmationId}`;
      await this.postEmailSubmissionLog({
        confirmationId: submission.confirmationId,
        formId,
        formVersionId,
        emailType: submission.emailType,
        submissionUpdatedAt: new Date(submission.updatedAt),
        code: LogCode.FAILED,
        exceptionLog: errMsg,
      });
      return new HttpException({ message: errMsg }, HttpStatus.BAD_REQUEST);
    }

    this.logger.debug(
      `${formId}: Notifying "${emailTo}" for submission ${submission.confirmationId} (${actionWord})`,
    );

    const email: EmailEntity = {
      emailTo: [emailTo],
      emailSubject: `Old growth field observation form and package, ${submission.confirmationId}`,
      emailBody:
        `<div style="margin-bottom:16px">An old growth field observation form and package has been ${actionWord}. ` +
        `Confirmation number: ${this.escapeHtml(String(submission.confirmationId))}</div>` +
        `<div><a href="https://submit.digital.gov.bc.ca/app/form/view?s=${this.escapeHtml(String(submission.id))}">View the submission</a></div>`,
      emailBodyType: 'html',
    };

    const baseLog: EmailSubmissionLog = {
      confirmationId: submission.confirmationId,
      formId,
      formVersionId,
      emailType: submission.emailType,
      submissionUpdatedAt: new Date(submission.updatedAt),
    };

    let mailResponse: { status: number; data: unknown };
    try {
      mailResponse = await this.emailService.sendEmail(email);
      this.logger.log(
        `${formId}: Email delivered for ${submission.confirmationId}`,
      );
    } catch (err) {
      const errorMsg = `Failed to send email for ${submission.confirmationId}: ${this.getErrorMessage(err)}`;
      this.logger.error(`${formId}: ${errorMsg}`);
      await this.postEmailSubmissionLog({
        ...baseLog,
        code: LogCode.FAILED,
        exceptionLog: errorMsg,
      });
      return new HttpException(
        { message: errorMsg },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.postEmailSubmissionLog({
      ...baseLog,
      code: LogCode.DELIVERED,
      exceptionLog: '',
    });
    return { status: mailResponse.status, data: mailResponse.data };
  }
}
