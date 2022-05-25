import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { EmailSubmissionLogEntity } from '../entities/emailSubmissionLog.entity';
import { EmailSubmissionLog } from '../entities/emailSubmissionLog.interface';
import { from, Observable } from 'rxjs';

const oauth = require('axios-oauth-client');

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(
    @InjectRepository(EmailSubmissionLogEntity)
    private emailSubmissionLogRepository: Repository<EmailSubmissionLogEntity>,
  ) {}

  getStoredSubmissions(): Promise<EmailSubmissionLogEntity[]> {
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

  postEmailSubmissionLog(
    emailSubmissionLog: EmailSubmissionLog,
  ): Observable<EmailSubmissionLog> {
    const newEmailSubmissionLogEntity = new EmailSubmissionLogEntity();
    newEmailSubmissionLogEntity.code = emailSubmissionLog.code;
    newEmailSubmissionLogEntity.exceptionLog = emailSubmissionLog.exceptionLog;
    newEmailSubmissionLogEntity.confirmationId =
      emailSubmissionLog.confirmationId;
    newEmailSubmissionLogEntity.formId = emailSubmissionLog.formId;
    newEmailSubmissionLogEntity.formVersionId =
      emailSubmissionLog.formVersionId;

    try {
      return from(
        this.emailSubmissionLogRepository.save(newEmailSubmissionLogEntity),
      );
    } catch (e) {
      // todo: handle db write error
      this.logger.error('Failed to write into db: ');
      this.logger.error(e);
      return null;
    }
  }

  filterSubmissionList(
    submissions: Array<{ [key: string]: any }>,
    storedSubmission: Object,
    currTimeValue: Number,
    lastTimeValue: Number,
    formId: string,
    formVersionId: string,
  ) {
    try {
      const newSubmissions = [];
      submissions.forEach((s) => {
        const createdAtValue = new Date(s.createdAt).valueOf();
        if (
          // filter the submissionList to only select the createdAt date within the last cron job interval and status is submitted
          createdAtValue > lastTimeValue &&
          createdAtValue <= currTimeValue &&
          s.submission.state == 'submitted'
        ) {
          newSubmissions.push(s);
        } else if (
          // or has no record in our db, or our code indicates failed
          storedSubmission &&
          (!storedSubmission[s.confirmationId] ||
            storedSubmission[s.confirmationId].code == 'FAILED')
        ) {
          newSubmissions.push(s);
        }
      });

      return newSubmissions;
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

  getNewSubmissionList(
    formId: string,
    formVersionId: string,
    fromPassword: string,
  ) {
    return axios
      .get(
        `https://chefs.nrs.gov.bc.ca/app/api/v1/forms/${formId}/versions/${formVersionId}/submissions`,
        {
          auth: {
            username: formId,
            password: fromPassword,
          },
        },
      )
      .then((subListRes) => {
        if (subListRes && subListRes.data) {
          const currTime = new Date();
          const lastTime = new Date(currTime.getTime() - 1000 * 60 * 5);
          const currTimeValue = currTime.valueOf();
          const lastTimeValue = lastTime.valueOf();

          return this.getStoredSubmissions()
            .then((storedSubs) => {
              const formatStoredSubs = {};
              storedSubs.forEach((s) => {
                formatStoredSubs[s.confirmationId] = s;
              });

              return this.filterSubmissionList(
                subListRes.data,
                formatStoredSubs,
                currTimeValue,
                lastTimeValue,
                formId,
                formVersionId,
              );
            })
            .catch((e) => {
              this.logger.error('Failed to get log data from database');

              const newEmailSubmissionLogEntity: EmailSubmissionLog = {
                code: 'FAILED',
                exceptionLog: 'Failed to get log data from database: ' + e,
                formId: formId,
                formVersionId: formVersionId,
              };

              this.postEmailSubmissionLog(newEmailSubmissionLogEntity);

              return this.filterSubmissionList(
                subListRes.data,
                null,
                currTimeValue,
                lastTimeValue,
                formId,
                formVersionId,
              );
            });
        } else
          throw new HttpException(
            'Failed to get new submission data: response or response data is null',
            HttpStatus.BAD_REQUEST,
          );
      })
      .catch((e) => {
        throw new HttpException(
          `Failed to get submission data from API: ${e}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  @Cron('*/5 * * * *') //Runs every 5 minutes
  // @Cron('45 * * * * *') // Run every 45 seconds
  // @Cron('*/5 * * * * *') //Runs every 5 seconds
  handleIDIRForm(emailTo: string) {
    this.logger.debug('called every 5 mins');
    const formId = process.env.IDIR_FORM_ID;
    const formVersionId = process.env.IDIR_FORM_VERSION_ID;
    const formPassword = process.env.IDIR_FORM_PASSWORD;
    return this.handleSubmission(emailTo, formId, formVersionId, formPassword);
  }

  // @Cron('*/5 * * * *')
  handleBCEIDForm() {
    // const formId = "";
    // const formVersionId = "";
    // const formPassword = "";
    // return this.handleSubmission(null, formId, formVersionId, formPassword);
  }

  handleSubmission(
    emailTo: string,
    formId: string,
    formVersionId: string,
    formPassword: string,
  ) {
    return this.getNewSubmissionList(formId, formVersionId, formPassword)
      .then((newSubmissionList) => {
        if (newSubmissionList) {
          if (newSubmissionList.length > 0) {
            console.log(
              'submissions need to send notification: ',
              newSubmissionList,
            );
            var response = [];
            newSubmissionList.forEach((item) => {
              const testEmail =
                emailTo || item.submission.data.naturalResourceDistrict.email;

              console.log('mail to:', testEmail);

              response.push(
                this.sendEmail(item.id, item.confirmationId, testEmail)
                  .then((mailResponse) => {
                    console.log('mailResponse: ', mailResponse.data);

                    const newEmailSubmissionLogEntity: EmailSubmissionLog = {
                      code: 'DELIVERED',
                      confirmationId: item.confirmationId,
                      exceptionLog: '',
                      formId: formId,
                      formVersionId: formVersionId,
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
                      confirmationId: item.confirmationId,
                      exceptionLog: 'Failed to send email: ' + err,
                      formId: formId,
                      formVersionId: formVersionId,
                    };

                    this.postEmailSubmissionLog(newEmailSubmissionLogEntity);

                    this.logger.error(
                      'Failed to send email, error logged in db',
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
              'No new submission within the last cron job interval',
            );
            return [
              { msg: 'No new submission within the last cron job interval' },
            ];
          }
        } else {
          this.logger.error('New submission returns null, error logged in db');
          return [{ msg: 'New submission returns null, error logged in db' }];
        }
      })
      .catch((e) => {
        const newEmailSubmissionLogEntity: EmailSubmissionLog = {
          code: 'FAILED',
          exceptionLog: 'Failed to get new submission list from API: ' + e,
          formId: formId,
          formVersionId: formVersionId,
        };

        this.postEmailSubmissionLog(newEmailSubmissionLogEntity);

        this.logger.error(
          'Failed to get new submission list from API, error logged in db',
        );
        return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  getToken() {
    const getClientCredentials = oauth.client(axios.create(), {
      url: process.env.EMAIL_TOKEN_URL,
      grant_type: 'client_credentials',
      client_id: process.env.EMAIL_USERNAME,
      client_secret: process.env.EMAIL_PASSWORD,
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

  sendEmail(submissionId: string, confirmationId: string, emailTo: String) {
    const email_subject = `Old Growth Field Observation form and package, ${confirmationId}`;
    const email_tag = 'field_verification_email'; // might link this tag to the submission id
    const email_type = 'html';
    const email_body =
      `<div style="margin-bottom: 16px">An Old Growth Field Observation form and package has been submitted. Confirmation Number: ${confirmationId}</div>` +
      `<div><a href="https://chefs.nrs.gov.bc.ca/app/form/view?s=${submissionId}">View the submission</a></div>`;

    if (
      !process.env.EMAIL_TOKEN_URL ||
      !process.env.EMAIL_API_URL ||
      !process.env.EMAIL_FROM
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
          return axios
            .post(
              `${process.env.EMAIL_API_URL}/email`,
              {
                bcc: [],
                bodyType: email_type,
                body: email_body,
                cc: [],
                delayTS: 0,
                encoding: 'utf-8',
                from: process.env.EMAIL_FROM,
                priority: 'normal',
                subject: email_subject,
                to: [emailTo],
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
