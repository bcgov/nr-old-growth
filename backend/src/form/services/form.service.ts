import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

const oauth = require('axios-oauth-client');

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  getNewSubmissionList(formId: String, formVersionId: String) {
    return axios
      .get(
        `https://chefs.nrs.gov.bc.ca/app/api/v1/forms/${formId}/versions/${formVersionId}/submissions`,
        {
          auth: {
            username: process.env.FORM_ID,
            password: process.env.FORM_PASSWORD,
          },
        },
      )
      .then((subListResponse) => {
        if (subListResponse && subListResponse.data) {
          const newSubmissions = [];
          const currTime = new Date();
          const lastTime = new Date(currTime.getTime() - 1000 * 60 * 60);
          const currTimeValue = currTime.valueOf();
          const lastTimeValue = lastTime.valueOf();

          subListResponse.data.forEach((s) => {
            // filter the submissionList to only select the createdAt date within the last cron job interval
            // and status is submitted
            const createdAtValue = new Date(s.createdAt).valueOf();
            if (
              createdAtValue > lastTimeValue &&
              createdAtValue <= currTimeValue &&
              s.submission.state == 'submitted'
            ) {
              newSubmissions.push(s);
            }
          });

          return newSubmissions;
        } else return null;
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  // @Cron('*/5 * * * *')
  handleSubmission(emailTo: String) {
    this.logger.debug('Called every 5 mins');

    const formId = process.env.FORM_ID;
    const formVersionId = process.env.FORM_VERSION_ID;

    return this.getNewSubmissionList(formId, formVersionId)
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
                    return {
                      status: mailResponse.status,
                      data: mailResponse.data,
                    };
                  })
                  .catch((err) => {
                    throw new HttpException(
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
          }
        } else {
          throw new HttpException(
            'Failed to get new submission list, failed to get response data',
            HttpStatus.BAD_REQUEST,
          );
        }
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
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
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  sendEmail(submissionId: String, confirmationId: String, emailTo: String) {
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
        'Failed to send email, server side missing config of authentication url' +
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
              throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
            });
        }
        throw new HttpException(
          'Failed to send email, failed to get the authentication token',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }
}
