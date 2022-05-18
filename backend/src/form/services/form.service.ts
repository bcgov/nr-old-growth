import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';

const oauth = require('axios-oauth-client');

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  getSubmissionList(formId: String) {
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
          // todo: filter the submissionList to only select the createdAt date within the last cron job interval
          return r.data;
        } else return null;
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  @Cron('45 * * * * *')
  handleSubmission() {
    this.logger.debug('Called when the current second is 45');

    const formId = process.env.FORM_ID;
    const formVersionId = process.env.FORM_VERSION_ID;

    return this.getSubmissionList(formId)
      .then((submissionList) => {
        if (submissionList) {
          if (submissionList.length > 0) {
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
              .then((submissionListResponse) => {
                // submissionListData in the format of [{id: submission_id, naturalResourceDistrict: email_address}]
                const submissionListData = submissionListResponse.data;

                if (submissionListData.length === 0) {
                  return 'There are no new submissions';
                }
                else {
                  Object.keys(submissionListData).forEach((key) => {
                    this.sendEmail(
                      // todo: based on the submissionList, get naturalResourceDistrict email address from submissionListData
                      // todo: for each new submission, send email to the correspond office

                      // test to send first record from submissionListData to myself
                      submissionListData[key].id,
                      submissionListData[key].naturalResourceDistrict,
                    ).then((mailResponse) => {
                      return { status: mailResponse.status, data: mailResponse.data };
                    });
                  });
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
            'Failed to get submission list',
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

  sendEmail(submissionId: String, emailTo: String) {
    const email_subject = 'Old Growth Field Observation form and package';
    const email_tag = 'field_verification_email'; // might link this tag to the submission id
    const email_type = 'html';
    const email_body =
      '<div style="margin-bottom: 16px">An Old Growth Field Observation form and package has been submitted.</div>' +
      `<div><a href="https://chefs.nrs.gov.bc.ca/app/form/view?s=${submissionId}">View the submission</a></div>`;

    if (
      !process.env.EMAIL_TOKEN_URL ||
      !process.env.EMAIL_API_URL ||
      !process.env.EMAIL_FROM
    ) {
      throw new HttpException(
        'Failed to send email, server side missing config of authentication url or CHES email server url or from email address or to email address',
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
