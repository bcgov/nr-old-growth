import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { EmailSubmissionLogEntity } from '../entities/emailSubmissionLog.entity';
import { EmailSubmissionLog } from '../entities/emailSubmissionLog.interface';
import { from } from 'rxjs';

const oauth = require('axios-oauth-client');

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(
    @InjectRepository(EmailSubmissionLogEntity)
    private emailSubmissionLogRepository: Repository<EmailSubmissionLogEntity>,
  ) {}

  // note: everytime change the cronjob interval, need to adjust the interval below that checks new submissions
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

  findEmailSubmissionLogByType(
    confirmationId: string,
    emailType: string,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: { confirmationId, emailType },
    });
  }

  async postEmailSubmissionLog(
    emailSubmissionLog: EmailSubmissionLog,
  ): Promise<any> {
    const newEmailSubmissionLogEntity = new EmailSubmissionLogEntity();
    newEmailSubmissionLogEntity.code = emailSubmissionLog.code;
    newEmailSubmissionLogEntity.exceptionLog = emailSubmissionLog.exceptionLog;
    newEmailSubmissionLogEntity.confirmationId =
      emailSubmissionLog.confirmationId;
    newEmailSubmissionLogEntity.formId = emailSubmissionLog.formId;
    newEmailSubmissionLogEntity.formVersionId =
      emailSubmissionLog.formVersionId;
    newEmailSubmissionLogEntity.emailType = emailSubmissionLog.emailType;

    try {
      if (emailSubmissionLog.confirmationId) {
        const foundLog = await this.findEmailSubmissionLogByType(
          emailSubmissionLog.confirmationId,
          emailSubmissionLog.emailType,
        );
        if (foundLog && foundLog.length > 0) {
          return this.updateEmailSubmissionLog(
            emailSubmissionLog.confirmationId,
            emailSubmissionLog.emailType,
            { code: emailSubmissionLog.code },
          );
        }
      }
      return from(
        this.emailSubmissionLogRepository.save(newEmailSubmissionLogEntity),
      );
    } catch (e) {
      this.logger.error('Failed to write into db: ');
      this.logger.error(e);
      try {
        this.sendEmail(
          ['catherine.meng@gov.bc.ca', 'maria.martinez@gov.bc.ca'],
          'Old Growth DB Write Error',
          'database_error',
          'text',
          'There is an error when writing into the database',
        );
      } catch (error) {
        this.logger.error(`Failed to send email: ${e}`);
      }
      return null;
    }
  }

  updateEmailSubmissionLog(
    confirmationId: string,
    emailType: string,
    emailSubmissionLog: EmailSubmissionLog,
  ): Promise<any> {
    try {
      return this.emailSubmissionLogRepository.update(
        { confirmationId, emailType },
        emailSubmissionLog,
      );
    } catch (e) {
      this.logger.error('Failed to update the db: ');
      this.logger.error(e);
      try {
        this.sendEmail(
          ['catherine.meng@gov.bc.ca', 'maria.martinez@gov.bc.ca'],
          'Old Growth DB Update Error',
          'database_error',
          'text',
          'There is an error when updating in the database',
        );
      } catch (error) {
        this.logger.error(`Failed to send dev email: ${e}`);
      }
      return null;
    }
  }

  async filterSubmissionList(
    allSubmissions: Array<{ [key: string]: any }>,
    currTimeValue: Number,
    lastTimeValue: Number,
    formId: string,
    formVersionId: string,
  ) {
    try {
      const returnSubmissions = [];

      await Promise.all(
        allSubmissions.map(async (submission) => {
          const createdAtValue = new Date(submission.createdAt).valueOf();
          const updatedAtValue = new Date(submission.updatedAt).valueOf();

          let foundRecords = await this.findEmailSubmissionLog(
            submission.confirmationId,
          );
          const foundRecordsForNew = foundRecords.filter(
            (r) => r.emailType == 'NEW',
          );
          const foundRecordsForUpdate = foundRecords.filter(
            (r) => r.emailType == 'UPDATE',
          );

          /* get new submission list:
          - select the ones with createdAt date within the last cron job interval, and state is submitted, and has no record (type new) in our db
          - has no record (type new) in our db or our record for this confirmation id indicates a failure code 
          */
          if (
            (createdAtValue > lastTimeValue &&
              createdAtValue <= currTimeValue &&
              submission.submission.state == 'submitted' &&
              foundRecordsForNew.length == 0) ||
            foundRecordsForNew.length == 0 ||
            (foundRecordsForNew.length > 0 &&
              foundRecordsForNew[0].code == 'FAILED')
          ) {
            submission.emailType = 'NEW';
            console.log('1');
            returnSubmissions.push(submission);
          }

          /* get update submission list:
          - select the ones with updatedAt date within the last cron job interval, and updatedBy=createdBy, and has no record (type update) in our db
          - our record (for update) for this confirmation id indicates a failure code 
          */
          if (
            (updatedAtValue > lastTimeValue &&
              updatedAtValue <= currTimeValue &&
              submission.updatedBy &&
              submission.updatedBy == submission.createdBy &&
              foundRecordsForUpdate.length == 0) ||
            (foundRecordsForUpdate.length > 0 &&
              foundRecordsForUpdate[0].code == 'FAILED')
          ) {
            console.log('2');
            submission.emailType = 'UPDATE';
            returnSubmissions.push(submission);
          }
        }),
      );

      return returnSubmissions;
    } catch (e) {
      const newEmailSubmissionLogEntity: EmailSubmissionLog = {
        code: 'FAILED',
        exceptionLog: 'Failed to filter submission data: ' + e,
        formId: formId,
        formVersionId: formVersionId,
      };
      this.postEmailSubmissionLog(newEmailSubmissionLogEntity);
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
          const lastTime = new Date(currTime.getTime() - 1000 * 60 * 10); //TODO: put time in variable so we only change it in 1 place
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
            'Failed to get new submission data: response or response data is null',
            HttpStatus.BAD_REQUEST,
          );
      })
      .catch((e) => {
        throw new HttpException(
          `Failed to get submission data from API: ${e.toString()}`,
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
          console.log('submissionList', submissionList);
          if (submissionList.length > 0) {
            console.log(
              formId,
              'new submissions need to send notification: ',
              submissionList,
            );
            let response = [];
            submissionList.forEach((eachSubmission) => {
              const emailString =
                eachSubmission.submission.data.naturalResourceDistrict.split(
                  '-',
                )[1];
              const testEmail = emailTo || emailString;

              console.log(formId, 'mail to:', testEmail);

              const email_subject = `Old Growth Field Observation form and package, ${eachSubmission.confirmationId}`;
              const email_tag = 'field_verification_email'; // might link this tag to the submission id
              const email_body_type = 'html';
              const email_body =
                `<div style="margin-bottom: 16px">An Old Growth Field Observation form and package has been submitted. Confirmation Number: ${eachSubmission.confirmationId}</div>` +
                `<div><a href="https://chefs.nrs.gov.bc.ca/app/form/view?s=${eachSubmission.id}">View the submission</a></div>`;

              response.push(
                this.sendEmail(
                  [testEmail],
                  email_subject,
                  email_tag,
                  email_body_type,
                  email_body,
                )
                  .then((mailResponse) => {
                    console.log(formId, 'mailResponse: ', mailResponse.data);

                    const newEmailSubmissionLogEntity: EmailSubmissionLog = {
                      code: 'DELIVERED',
                      confirmationId: eachSubmission.confirmationId,
                      exceptionLog: '',
                      formId: formId,
                      formVersionId: formVersionId,
                      emailType: eachSubmission.emailType,
                    };
                    this.postEmailSubmissionLog(newEmailSubmissionLogEntity);

                    return {
                      status: mailResponse.status,
                      data: mailResponse.data,
                    };
                  })
                  .catch((err) => {
                    const newEmailSubmissionLogEntity: EmailSubmissionLog = {
                      code: 'FAILED',
                      confirmationId: eachSubmission.confirmationId,
                      exceptionLog: 'Failed to send email: ' + err,
                      formId: formId,
                      formVersionId: formVersionId,
                      emailType: eachSubmission.emailType,
                    };

                    this.postEmailSubmissionLog(newEmailSubmissionLogEntity);

                    this.logger.error(
                      `${formId}: Failed to send email, error logged in db`,
                    );

                    return new HttpException(
                      err,
                      HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                  }),
              );
            });

            return Promise.all(response);
          } else {
            this.logger.debug(
              `${formId}: No new submission within the last cron job interval`,
            );
            return [
              { msg: 'No new submission within the last cron job interval' },
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
        const errorMsg =
          'Failed to get submissions list need notification from API: ';
        const newEmailSubmissionLogEntity: EmailSubmissionLog = {
          code: 'FAILED',
          exceptionLog: errorMsg + e.toString(),
          formId: formId,
          formVersionId: formVersionId,
        };

        this.postEmailSubmissionLog(newEmailSubmissionLogEntity);

        this.logger.error(errorMsg + formId);

        try {
          this.sendEmail(
            ['catherine.meng@gov.bc.ca', 'maria.martinez@gov.bc.ca'],
            'Old Growth CHEFS API ERROR',
            'api_error',
            'text',
            errorMsg + formId,
          );
        } catch (error) {
          this.logger.error(`Failed to send dev email: ${e.toString()}`);
        }

        return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  async getToken() {
    const getClientCredentials = oauth.client(axios.create(), {
      url: process.env.CHES_TOKEN_URL,
      grant_type: 'client_credentials',
      client_id: process.env.CHES_CLIENT_ID,
      client_secret: process.env.CHES_CLIENT_SECRET,
      scope: '',
    });

    return getClientCredentials()
      .then((res) => {
        if (res && res.access_token) return res.access_token;
        else return null;
      })
      .catch((e) => {
        throw new HttpException(
          `Failed to get email auth token from API: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  sendEmail(
    emailTo: Array<string>,
    email_subject: string,
    email_tag: string,
    email_body_type: string,
    email_body: string,
  ) {
    if (
      !process.env.CHES_TOKEN_URL ||
      !process.env.CHES_API_URL ||
      !process.env.CHES_EMAIL_FROM
    ) {
      throw new HttpException(
        'Failed to config email, server side missing config of authentication url' +
          'or CHES email server url or from email address or to email address',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.getToken()
      .then((access_token) => {
        if (access_token) {
          if (process.env.NODE_ENV == 'development') {
            return axios
              .post(
                `${process.env.CHES_API_URL}/email`,
                {
                  bcc: [],
                  bodyType: email_body_type,
                  body: email_body,
                  cc: [],
                  delayTS: 0,
                  encoding: 'utf-8',
                  from: process.env.CHES_EMAIL_FROM,
                  priority: 'normal',
                  subject: email_subject,
                  to: emailTo,
                  tag: email_tag,
                  attachments: [],
                },
                {
                  headers: { Authorization: `Bearer ${access_token}` },
                },
              )
              .then((r) => {
                return { status: r.status, data: r.data };
              })
              .catch((e) => {
                throw new HttpException(
                  `Failed to post email to API: ${e}`,
                  HttpStatus.INTERNAL_SERVER_ERROR,
                );
              });
          } else {
            return {
              status: 200,
              data: 'Not send email in dev deployment',
            };
          }
        }
        throw new HttpException(
          'Failed to get email auth token: response or response access token is null',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }
}
