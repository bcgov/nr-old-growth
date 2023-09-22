import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { EmailSubmissionLogEntity } from '../entities/emailSubmissionLog.entity';
import { EmailSubmissionLog } from '../entities/emailSubmissionLog.interface';
import { EmailService } from '../../email/services/email.service';
import { EmailEntity } from '../../email/model/email.entity';
import { from } from 'rxjs';

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(
    @InjectRepository(EmailSubmissionLogEntity)
    private emailSubmissionLogRepository: Repository<EmailSubmissionLogEntity>,
    private emailService: EmailService,
  ) {}

  // note: everytime change the cronjob interval, need to adjust the interval below that checks new submissions
  private interval = 10;
  @Cron('*/10 * * * *') //Runs every 10 minutes
  // @Cron('*/1 * * * *') //Runs every 1 minutes
  // @Cron('45 * * * * *') // Run every 45 seconds
  // @Cron('*/5 * * * * *') //Runs every 5 seconds
  handleIDIRForm(emailTo: string) {
    this.logger.debug('called every 10 mins for idir form');
    const formId = process.env.IDIR_FORM_ID;
    const formVersionId = process.env.IDIR_FORM_VERSION_ID;
    const formPassword = process.env.IDIR_FORM_PASSWORD;
    return this.handleSubmissions(emailTo, formId, formVersionId, formPassword);
  }

  @Cron('*/10 * * * *')
  handleBCEIDForm(emailTo: string) {
    this.logger.debug('called every 10 mins for bceid form');
    const formId = process.env.BCEID_FORM_ID;
    const formVersionId = process.env.BCEID_FORM_VERSION_ID;
    const formPassword = process.env.BCEID_FORM_PASSWORD;
    return this.handleSubmissions(emailTo, formId, formVersionId, formPassword);
  }

  getStoredSubmissionss(): Promise<EmailSubmissionLogEntity[]> {
    return this.emailSubmissionLogRepository
      .createQueryBuilder()
      .select('eslog')
      .from(EmailSubmissionLogEntity, 'eslog')
      .where('eslog.confirmationId is not null')
      .getMany();
  }

  findAllEmailSubmissionLogs(): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find();
  }

  findEmailSubmissionLog(
    confirmationId: string,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: { confirmationId },
    });
  }

  findNewEmailSubmissionLog(
    confirmationId: string,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: { confirmationId, emailType: 'NEW' },
    });
  }

  findUpdateEmailSubmissionLog(
    confirmationId: string,
    submissionUpdatedAt: Date,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: {
        confirmationId,
        emailType: 'UPDATE',
        submissionUpdatedAt,
      },
    });
  }

  async postEmailSubmissionLog(
    emailSubmissionLog: EmailSubmissionLog,
  ): Promise<any> {
    const emailSubmissionLogEntity = new EmailSubmissionLogEntity();
    emailSubmissionLogEntity.code = emailSubmissionLog.code;
    emailSubmissionLogEntity.exceptionLog = emailSubmissionLog.exceptionLog;
    emailSubmissionLogEntity.confirmationId = emailSubmissionLog.confirmationId;
    emailSubmissionLogEntity.formId = emailSubmissionLog.formId;
    emailSubmissionLogEntity.formVersionId = emailSubmissionLog.formVersionId;
    emailSubmissionLogEntity.emailType = emailSubmissionLog.emailType;

    try {
      if (emailSubmissionLog.confirmationId) {
        if (emailSubmissionLog.emailType == 'NEW') {
          const foundLogForNew = await this.findNewEmailSubmissionLog(
            emailSubmissionLog.confirmationId,
          );
          if (foundLogForNew && foundLogForNew.length > 0) {
            return this.updateEmailSubmissionLog(
              emailSubmissionLog.confirmationId,
              emailSubmissionLog.emailType,
              { code: emailSubmissionLog.code },
            );
          }
        } else if (emailSubmissionLog.emailType == 'UPDATE') {
          emailSubmissionLogEntity.submissionUpdatedAt =
            emailSubmissionLog.submissionUpdatedAt;
          const foundRecordsForUpdate = await this.findUpdateEmailSubmissionLog(
            emailSubmissionLog.confirmationId,
            emailSubmissionLog.submissionUpdatedAt,
          );
          if (
            foundRecordsForUpdate &&
            foundRecordsForUpdate.length > 0 &&
            foundRecordsForUpdate[0].code == 'FAILED'
          ) {
            return this.updateEmailSubmissionLog(
              emailSubmissionLog.confirmationId,
              emailSubmissionLog.emailType,
              { code: emailSubmissionLog.code },
              emailSubmissionLog.submissionUpdatedAt,
            );
          }
        }
      }
      return from(
        this.emailSubmissionLogRepository.save(emailSubmissionLogEntity),
      );
    } catch (e) {
      this.logger.error(`Failed to write into db: ${e}`);
      this.sendErrorNotification(`Failed to write into db: ${e}`);
      return null;
    }
  }

  updateEmailSubmissionLog(
    confirmationId: string,
    emailType: string,
    emailSubmissionLog: EmailSubmissionLog,
    submissionUpdatedAt?: Date,
  ): Promise<any> {
    try {
      if (submissionUpdatedAt) {
        return this.emailSubmissionLogRepository.update(
          { confirmationId, emailType, submissionUpdatedAt },
          emailSubmissionLog,
        );
      }
      return this.emailSubmissionLogRepository.update(
        { confirmationId, emailType },
        emailSubmissionLog,
      );
    } catch (e) {
      this.logger.error(`Failed to update the db: ${e}`);
      this.sendErrorNotification(`Failed to update the db: ${e}`);
      return null;
    }
  }

  async filterSubmissionList(
    allSubmissions: Array<{ [key: string]: any }>,
    currTimeValue: number,
    lastTimeValue: number,
    formId: string,
    formVersionId: string,
  ) {
    try {
      const returnSubmissions = [];

      await Promise.all(
        allSubmissions.map(async (submission) => {
          const createdAtValue = new Date(submission.createdAt).valueOf();
          const updatedAtValue = new Date(submission.updatedAt).valueOf();
          const enableEmailUpdateNotificationDate = new Date(
            '2023-01-09T01:14:17.531Z',
          ).valueOf();

          /* get new submission list:
          - select the ones with createdAt date within the last cron job interval, and state is submitted, and has no record in our db
          - has no record in our db or our record for this confirmation id indicates a failure code 
          */
          const foundRecords = await this.findEmailSubmissionLog(
            submission.confirmationId,
          );
          if (
            (createdAtValue > lastTimeValue &&
              createdAtValue <= currTimeValue &&
              submission.submission.state == 'submitted' &&
              foundRecords.length == 0) ||
            foundRecords.length == 0 ||
            (foundRecords.length > 0 && foundRecords[0].code == 'FAILED')
          ) {
            submission.emailType = 'NEW';
            returnSubmissions.push(submission);
          }

          /* get update submission list:
          - select the ones with updatedAt date within the last cron job interval, and updatedBy=createdBy, and has no record (type update, same submission update time) in our db
          - or updated but has no record (type update) in our db and update time after we enable the update email service
          - or our records (for update) for this confirmation id indicates a failure code 
          */
          const foundRecordsForUpdate = await this.findUpdateEmailSubmissionLog(
            submission.confirmationId,
            new Date(submission.updatedAt),
          );
          if (
            (updatedAtValue > lastTimeValue &&
              updatedAtValue <= currTimeValue &&
              submission.updatedBy &&
              submission.updatedBy == submission.createdBy &&
              foundRecordsForUpdate.length == 0) ||
            (submission.updatedBy &&
              submission.updatedBy == submission.createdBy &&
              foundRecordsForUpdate.length == 0 &&
              updatedAtValue > enableEmailUpdateNotificationDate) ||
            (foundRecordsForUpdate.length > 0 &&
              foundRecordsForUpdate[0].code == 'FAILED')
          ) {
            const submissionCopy = Object.assign({}, submission);
            submissionCopy.emailType = 'UPDATE';
            returnSubmissions.push(submissionCopy);
          }
        }),
      );

      return returnSubmissions;
    } catch (e) {
      const emailSubmissionLogEntity: EmailSubmissionLog = {
        code: 'FAILED',
        exceptionLog: 'Failed to filter submission data: ' + e,
        formId: formId,
        formVersionId: formVersionId,
      };
      this.postEmailSubmissionLog(emailSubmissionLogEntity);
      return null;
    }
  }

  getSubmissionsNeedNotification(
    formId: string,
    formVersionId: string,
    fromPassword: string,
  ) {
    return axios
      .get(
        `https://submit.digital.gov.bc.ca/app/api/v1/forms/${formId}/versions/${formVersionId}/submissions`,
        {
          auth: {
            username: formId,
            password: fromPassword,
          },
        },
      )
      .then((allSubmissions) => {
        if (allSubmissions && allSubmissions.data) {
          const currTime = new Date();
          const lastTime = new Date(
            currTime.getTime() - 1000 * 60 * this.interval,
          ); //TODO: put time in variable so we only change it in 1 place
          const currTimeValue = currTime.valueOf();
          const lastTimeValue = lastTime.valueOf();

          return this.filterSubmissionList(
            allSubmissions.data,
            currTimeValue,
            lastTimeValue,
            formId,
            formVersionId,
          );
        } else
          throw new HttpException(
            { message: 'Failed to get new submission data: response or response data is null' },
            HttpStatus.BAD_REQUEST,
          );
      })
      .catch((e) => {
        throw new HttpException(
          { message: 'Failed to get submission data from API: ' + e },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  handleSubmissions(
    emailTo: string, // for quick email test
    formId: string,
    formVersionId: string,
    formPassword: string,
  ) {
    return this.getSubmissionsNeedNotification(
      formId,
      formVersionId,
      formPassword,
    )
      .then((submissionList) => {
        if (submissionList) {
          if (submissionList.length > 0) {
            console.log(
              formId,
              'submissions need to send notification: ',
              submissionList,
            );
            let response = [];
            submissionList.forEach((eachSubmission) => {
              const emailDistrict =
                eachSubmission.submission.data.naturalResourceDistrict.split(
                  '-',
                )[1];
              const emailSendTo = emailTo || emailDistrict;
              let text = 'submitted';
              if (
                eachSubmission.emailType &&
                eachSubmission.emailType == 'UPDATE'
              ) {
                text = 'updated';
              }
              console.log(formId, 'mail to:', emailSendTo);
              const email: EmailEntity = {
                emailTo: [emailSendTo],
                emailSubject: `Old growth field observation form and package, ${eachSubmission.confirmationId}`,
                emailBody:
                  `<div style="margin-bottom: 16px">An old growth field observation form and package has been ${text}. Confirmation number: ${eachSubmission.confirmationId}</div>` +
                  `<div><a href="https://submit.digital.gov.bc.ca/app/form/view?s=${eachSubmission.id}">View the submission</a></div>`,
                emailBodyType: 'html',
              };
              response.push(
                this.emailService
                  .sendEmail(email)
                  .then((mailResponse) => {
                    console.log(formId, 'mailResponse: ', mailResponse.data);
                    const emailSubmissionLogEntity: EmailSubmissionLog = {
                      code: 'DELIVERED',
                      confirmationId: eachSubmission.confirmationId,
                      exceptionLog: '',
                      formId: formId,
                      formVersionId: formVersionId,
                      emailType: eachSubmission.emailType,
                      submissionUpdatedAt: new Date(eachSubmission.updatedAt),
                    };
                    this.postEmailSubmissionLog(emailSubmissionLogEntity);
                    return {
                      status: mailResponse.status,
                      data: mailResponse.data,
                    };
                  })
                  .catch((err) => {
                    const emailSubmissionLogEntity: EmailSubmissionLog = {
                      code: 'FAILED',
                      confirmationId: eachSubmission.confirmationId,
                      exceptionLog: 'Failed to send email: ' + err,
                      formId: formId,
                      formVersionId: formVersionId,
                      emailType: eachSubmission.emailType,
                      submissionUpdatedAt: new Date(eachSubmission.updatedAt),
                    };
                    this.postEmailSubmissionLog(emailSubmissionLogEntity);
                    this.logger.error(
                      `${formId}: Failed to send email, error logged in db`,
                    );
                    return new HttpException(
                      { message: err },
                      HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                  }),
              );
            });
            return Promise.all(response);
          } else {
            this.logger.debug(
              `${formId}: No new or updated submission within the last cron job interval`,
            );
            return [
              {
                msg: 'No new or updated submission within the last cron job interval',
              },
            ];
          }
        } else {
          this.logger.error(
            `${formId}: get submissions list need notification returns null, error logged in db`,
          );
          return [
            {
              msg: 'get submissions list need notification returns null, error logged in db',
            },
          ];
        }
      })
      .catch((e) => {
        const errorMsg = 'Failed to get submissions list need notification from API: ' + e;
        const emailSubmissionLogEntity: EmailSubmissionLog = {
          code: 'FAILED',
          exceptionLog: errorMsg,
          formId: formId,
          formVersionId: formVersionId,
        };

        this.postEmailSubmissionLog(emailSubmissionLogEntity);
        this.logger.error(formId + ' ' + errorMsg);
        this.sendErrorNotification(formId + ' ' + errorMsg);

        return new HttpException(
          { message: e }, 
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
  }

  sendErrorNotification(errorMsg) {
    this.logger.error('Send error notification email');
    const email: EmailEntity = {
      emailTo: [
        'maria.martinez@gov.bc.ca',
        'ziad.bhunnoo@gov.bc.ca',
        'paulo.cruz@gov.bc.ca',
      ],
      emailSubject: 'Old Growth Email Notification Error',
      emailBody: errorMsg,
    };
    try {
      this.emailService.sendEmail(email);
    } catch (e) {
      this.logger.error(`Failed to send error notification email: ${e}`);
    }
  }
}
