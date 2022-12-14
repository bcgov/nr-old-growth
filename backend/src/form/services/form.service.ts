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
    return this.handleSubmission(emailTo, formId, formVersionId, formPassword);
  }

  @Cron('*/10 * * * *')
  handleBCEIDForm(emailTo: string) {
    this.logger.debug('called every 10 mins for bceid form');
    const formId = process.env.BCEID_FORM_ID;
    const formVersionId = process.env.BCEID_FORM_VERSION_ID;
    const formPassword = process.env.BCEID_FORM_PASSWORD;
    return this.handleSubmission(emailTo, formId, formVersionId, formPassword);
  }

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

  findEmailSubmissionLog(
    confirmationId: string,
  ): Promise<EmailSubmissionLog[]> {
    return this.emailSubmissionLogRepository.find({
      where: { confirmationId },
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

    try {
      if (emailSubmissionLog.confirmationId) {
        const foundLog = await this.findEmailSubmissionLog(
          emailSubmissionLog.confirmationId,
        );
        if (foundLog && foundLog.length > 0) {
          return this.updateEmailSubmissionLog(
            emailSubmissionLog.confirmationId,
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
    emailSubmissionLog: EmailSubmissionLog,
  ): Promise<any> {
    try {
      return this.emailSubmissionLogRepository.update(
        { confirmationId },
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
      submissions.forEach((newSubmission) => {
        const createdAtValue = new Date(newSubmission.createdAt).valueOf();
        if (
          // filter the submissionList to only select the createdAt date within the last cron job interval
          // and status is submitted
          // no stored submission or not stored in our db
          createdAtValue > lastTimeValue &&
          createdAtValue <= currTimeValue &&
          newSubmission.submission.state == 'submitted' &&
          (!storedSubmission ||
            (storedSubmission &&
              !storedSubmission[newSubmission.confirmationId]))
        ) {
          newSubmissions.push(newSubmission);
        } else if (
          // or has no record in our db, or our code indicates failed
          storedSubmission &&
          (!storedSubmission[newSubmission.confirmationId] ||
            storedSubmission[newSubmission.confirmationId].code == 'FAILED')
        ) {
          newSubmissions.push(newSubmission);
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
        `https://submit.digital.gov.bc.ca/app/api/v1/forms/${formId}/versions/${formVersionId}/submissions`,
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
          //TODO: put time in variable so we only change it in 1 place
          const lastTime = new Date(currTime.getTime() - 1000 * 60 * 10);
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
              this.logger.error(
                `${formId}: Failed to get log data from database`,
              );

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
              formId,
              'submissions need to send notification: ',
              newSubmissionList,
            );
            var response = [];
            newSubmissionList.forEach((item) => {
              const emailString =
                item.submission.data.naturalResourceDistrict.split('-')[1];
              const testEmail = emailTo || emailString;

              console.log(formId, 'mail to:', testEmail);

              const email_subject = `Old Growth Field Observation form and package, ${item.confirmationId}`;
              const email_tag = 'field_verification_email'; // might link this tag to the submission id
              const email_type = 'html';
              const email_body =
                `<div style="margin-bottom: 16px">An Old Growth Field Observation form and package has been submitted. Confirmation Number: ${item.confirmationId}</div>` +
                `<div><a href="https://submit.digital.gov.bc.ca/app/form/view?s=$${item.id}">View the submission</a></div>`;

              response.push(
                this.sendEmail(
                  [testEmail],
                  email_subject,
                  email_tag,
                  email_type,
                  email_body,
                )
                  .then((mailResponse) => {
                    console.log(formId, 'mailResponse: ', mailResponse.data);

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
            `${formId}: New submission returns null, error logged in db`,
          );
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
          formId +
            ': Failed to get new submission list from API, error logged in db',
        );

        try {
          this.sendEmail(
            ['catherine.meng@gov.bc.ca', 'maria.martinez@gov.bc.ca'],
            'Old Growth CHEFS API ERROR',
            'api_error',
            'text',
            'There is an error when get the form submission list',
          );
        } catch (error) {
          this.logger.error(`Failed to send dev email: ${e}`);
        }

        return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  getToken() {
    const getClientCredentials = oauth.client(axios.create(), {
      url: process.env.EMAIL_TOKEN_URL,
      grant_type: 'client_credentials',
      client_id: process.env.EMAIL_USERNAME,
      client_secret: process.env.EMAIL_PASSWORD,
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
    email_type: string,
    email_body: string,
  ) {
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
          if (process.env.NODE_ENV === 'production') {
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
