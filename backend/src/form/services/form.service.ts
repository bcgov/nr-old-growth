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

/** Earliest date from which update-email notifications are considered valid. */
const UPDATE_NOTIFICATION_EPOCH = new Date('2023-01-09T01:14:17.531Z');

const CHEFS_SUBMISSIONS_URL = (formId: string, formVersionId: string) =>
  `https://submit.digital.gov.bc.ca/app/api/v1/forms/${formId}/versions/${formVersionId}/submissions`;

const ERROR_NOTIFICATION_RECIPIENTS = [
  'maria.martinez@gov.bc.ca',
  'ziad.bhunnoo@gov.bc.ca',
  'paulo.cruz@gov.bc.ca',
];

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
      const msg = 'IDIR form environment variables are not set; skipping cron run';
      this.logger.warn(msg);
      await this.sendErrorNotification(msg);
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
      const msg = 'BCEID form environment variables are not set; skipping cron run';
      this.logger.warn(msg);
      await this.sendErrorNotification(msg);
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

  findNewEmailSubmissionLog(confirmationId: string): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: { confirmationId, emailType: EmailType.NEW },
    });
  }

  findUpdateEmailSubmissionLog(
    confirmationId: string,
    submissionUpdatedAt: Date,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: { confirmationId, emailType: EmailType.UPDATE, submissionUpdatedAt },
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
          const existing = await this.findNewEmailSubmissionLog(log.confirmationId);
          if (existing.length > 0) {
            await this.updateEmailSubmissionLog(log.confirmationId, log.emailType, {
              code: log.code,
            });
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

      const entity = Object.assign(new EmailSubmissionLogEntity(), log);
      await this.emailSubmissionLogRepository.save(entity);
    } catch (e) {
      this.logger.error(`Failed to write log to DB: ${e}`);
      await this.sendErrorNotification(`Failed to write log to DB: ${e}`);
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
      this.logger.error(`Failed to update log in DB: ${e}`);
      await this.sendErrorNotification(`Failed to update log in DB: ${e}`);
    }
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
   * Fetches all submissions for a form version from CHEFS and returns only
   * those that require an email notification (new or updated since last cron run).
   */
  async getSubmissionsNeedingNotification(
    formId: string,
    formVersionId: string,
    formPassword: string,
  ): Promise<Array<{ [key: string]: any }>> {
    let allSubmissions: Array<{ [key: string]: any }>;

    try {
      const response = await axios.get(CHEFS_SUBMISSIONS_URL(formId, formVersionId), {
        auth: { username: formId, password: formPassword },
      });

      if (!response?.data) {
        throw new HttpException(
          { message: 'CHEFS API returned an empty response' },
          HttpStatus.BAD_REQUEST,
        );
      }

      allSubmissions = response.data;
    } catch (e) {
      if (e instanceof HttpException) throw e;

      const axiosError = e as AxiosError;
      throw new HttpException(
        { message: `Failed to fetch submissions from CHEFS: ${axiosError.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - 1000 * 60 * CRON_INTERVAL_MINUTES);
    return this.filterSubmissions(allSubmissions, windowStart, now, formId, formVersionId);
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
          const logsAll = await this.findEmailSubmissionLog(submission.confirmationId);
          const needsNew =
            (logsAll.length === 0 &&
              createdMs > windowStartMs &&
              createdMs <= windowEndMs &&
              submission.submission?.state === 'submitted') ||
            logsAll[0]?.code === LogCode.FAILED;

          const pushIfNotExists = (item: any) => {
            const exists = results.some(
              (r) => r.confirmationId === item.confirmationId && r.emailType === item.emailType,
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
          const submitterIsOwner = submission.updatedBy && submission.updatedBy === submission.createdBy;
          const updatedAfterEpoch = updatedMs > UPDATE_NOTIFICATION_EPOCH.valueOf();

          const needsUpdate =
            ((updatedMs > windowStartMs && updatedMs <= windowEndMs && submitterIsOwner && logsUpdate.length === 0) ||
              (submitterIsOwner && logsUpdate.length === 0 && updatedAfterEpoch) ||
              logsUpdate[0]?.code === LogCode.FAILED);

          if (needsUpdate) {
            pushIfNotExists({ ...submission, emailType: EmailType.UPDATE });
          }
        }),
      );
    } catch (e) {
      this.logger.error(`Failed to filter submissions: ${e}`);
      await this.postEmailSubmissionLog({
        code: LogCode.FAILED,
        exceptionLog: `Failed to filter submission data: ${e}`,
        formId,
        formVersionId,
      });
      return [];
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
    let submissionsToNotify: Array<{ [key: string]: any }>;

    try {
      submissionsToNotify = await this.getSubmissionsNeedingNotification(
        formId,
        formVersionId,
        formPassword,
      );
    } catch (e) {
      const errorMsg = `Failed to fetch submissions needing notification for form ${formId}: ${e}`;
      this.logger.error(errorMsg);
      await this.postEmailSubmissionLog({
        code: LogCode.FAILED,
        exceptionLog: errorMsg,
        formId,
        formVersionId,
      });
      await this.sendErrorNotification(errorMsg);
      return [new HttpException({ message: errorMsg }, HttpStatus.INTERNAL_SERVER_ERROR)];
    }

    if (!submissionsToNotify?.length) {
      this.logger.debug(`${formId}: No notifications needed in this cron window`);
      return [{ msg: 'No new or updated submissions within the last cron job interval' }];
    }

    this.logger.log(`${formId}: Sending ${submissionsToNotify.length} notification(s)`);

    return Promise.all(
      submissionsToNotify.map((submission) => this.sendSubmissionEmail(submission, formId, formVersionId)),
    );
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

    const districtRaw: string = submission.submission?.data?.naturalResourceDistrict ?? '';
    const emailTo = districtRaw.split('-')[1]?.trim();

    const isValidEmail = (addr: string): boolean => {
      if (!addr) return false;

      const atIndex = addr.indexOf("@");
      if (atIndex <= 0 || atIndex !== addr.lastIndexOf("@")) return false;

      const local = addr.slice(0, atIndex);
      const domain = addr.slice(atIndex + 1);

      if (!local || !domain) return false;
      if (domain.startsWith(".") || domain.endsWith(".")) return false;
      if (!domain.includes(".")) return false;

      return !addr.includes(" ");
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
      await this.sendErrorNotification(errMsg);
      return new HttpException({ message: errMsg }, HttpStatus.BAD_REQUEST);
    }

    this.logger.debug(`${formId}: Notifying "${emailTo}" for submission ${submission.confirmationId} (${actionWord})`);

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

    try {
      const mailResponse = await this.emailService.sendEmail(email);
      this.logger.log(`${formId}: Email delivered for ${submission.confirmationId}`);
      await this.postEmailSubmissionLog({
        ...baseLog,
        code: LogCode.DELIVERED,
        exceptionLog: '',
      });
      return { status: mailResponse.status, data: mailResponse.data };
    } catch (err) {
      const errorMsg = `Failed to send email for ${submission.confirmationId}: ${err}`;
      this.logger.error(`${formId}: ${errorMsg}`);
      await this.postEmailSubmissionLog({
        ...baseLog,
        code: LogCode.FAILED,
        exceptionLog: errorMsg,
      });
      return new HttpException({ message: errorMsg }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /** Sends an operational alert email to the on-call list. */
  async sendErrorNotification(errorMsg: string): Promise<void> {
    this.logger.error(`Dispatching error notification: ${errorMsg}`);
    const email: EmailEntity = {
      emailTo: ERROR_NOTIFICATION_RECIPIENTS,
      emailSubject: 'Old Growth Email Notification Error',
      emailBody: errorMsg,
    };
    try {
      await this.emailService.sendEmail(email);
    } catch (e) {
      this.logger.error(`Failed to send error notification email: ${e}`);
    }
  }
}
