import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

const oauth = require('axios-oauth-client');

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  getNewSubmissionList(formId: String) {
    return axios
      .get(
        `https://chefs.nrs.gov.bc.ca/app/api/v1/forms/${formId}/submissions`,
        {
          auth: {
            username: process.env.FORM_ID,
            password: process.env.FORM_PASSWORD,
          },
        },
      )
      .then((r) => {
        if (r && r.data) {
          const newSubmission = {};
          r.data.forEach((s) => {
            // todo: filter the submissionList to only select the createdAt date within the last cron job interval
            newSubmission[s.submissionId] = s;
          });
          // newSubmission is in the format of {submission_id: {...submission_data}}
          return newSubmission;
        } else return null;
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  @Cron('*/5 * * * *')
  handleSubmission(emailTo: String) {
    this.logger.debug('Called every 5 mins');

    const formId = process.env.FORM_ID;
    const formVersionId = process.env.FORM_VERSION_ID;
    const testEmail = emailTo || 'catherine.meng@gov.bc.ca';

    return this.getNewSubmissionList(formId)
      .then((newSubmission) => {
        if (newSubmission) {
          const newSubmissionIds = Object.keys(newSubmission);
          if (newSubmissionIds.length > 0) {
            // get naturalResourceDistrict field value to send email to
            return axios
              .get(
                `https://chefs.nrs.gov.bc.ca/app/api/v1/forms/${formId}/versions/${formVersionId}/submissions/discover`,
                {
                  auth: {
                    username: process.env.FORM_ID,
                    password: process.env.FORM_PASSWORD,
                  },
                  params: {
                    fields: 'naturalResourceDistrict',
                  },
                },
              )
              .then((r) => {
                if (r && r.data) {
                  const fieldList = r.data;
                  if (fieldList.length > 0) {
                    // fieldList is in the format of [{id: submission_id, naturalResourceDistrict: email_address}]
                    // fieldList contains data for all submissions, so need to select only the new submission data
                    const emailList = [];
                    fieldList.forEach((f) => {
                      if (newSubmissionIds.includes(f.id)) {
                        emailList.push({
                          ...f,
                          confirmationId: newSubmission[f.id].confirmationId,
                        });
                      }
                    });

                    console.log(emailList);

                    var response = [];
                    emailList.forEach((d) => {
                      response.push(
                        this.sendEmail(d.id, d.confirmationId, testEmail)
                          .then((mailResponse) => {
                            console.log('mailResponse', mailResponse.data);
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
                    console.log('No submission fields data found');
                  }
                } else {
                  throw new HttpException(
                    'Failed to get submission field data, failed to get response data',
                    HttpStatus.BAD_REQUEST,
                  );
                }
              })
              .catch((e) => {
                throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
              });
          } else {
            console.log('No new submission within the last cron job interval');
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
        if (res) return res.access_token;
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
