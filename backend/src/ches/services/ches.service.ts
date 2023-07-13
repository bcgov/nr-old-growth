import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
//import axios from 'axios';
import { EmailEntity } from '../../email/model/email.entity';

const { create } = require('simple-oauth2');
const axios = require('axios');

@Injectable()
export class ChesService {
  getToken() {
    const oauth2 = create({
      client: {
        id: process.env.CHES_CLIENT_ID,
        secret: process.env.CHES_CLIENT_SECRET,
      },
      auth: {
        tokenHost: process.env.CHES_TOKEN_URL,
      },
    });

    const tokenConfig = {
      grant_type: 'client_credentials',
    };

    return oauth2.clientCredentials
      .getToken(tokenConfig)
      .then((result) => {
        const accessToken = oauth2.accessToken.create(result);

        if (accessToken && accessToken.token) {
          return accessToken.token.access_token;
        } else {
          return null;
        }
      })
      .catch((e) => {
        throw new HttpException(
          { message: 'Failed to get email auth token from API: ' + e },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  sendEmail(email: EmailEntity) {
    const emailTo = email.emailTo;
    const emailFrom = email.emailFrom || process.env.CHES_EMAIL_FROM;
    const emailSubject = email.emailSubject || 'test email';
    const emailBody = email.emailBody || 'hello world';
    const emailBodyType = email.emailBodyType || 'text';
    const emailAttachments = email.emailAttachments || [];

    if (
      !process.env.CHES_TOKEN_URL ||
      !process.env.CHES_API_URL ||
      !process.env.CHES_EMAIL_FROM
    ) {
      throw new HttpException(
        { message: 'Failed to config email, server side missing config of authentication url' +
        'or CHES email server url or from email address' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!emailTo) {
      throw new HttpException(
        { message: 'Failed to send email, missing required emailTo parameter' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.getToken()
      .then((access_token) => {
        if (access_token) {
          if (process.env.NODE_ENV == 'production') {
            return axios
              .post(
                `${process.env.CHES_API_URL}/email`,
                {
                  bcc: [],
                  bodyType: emailBodyType,
                  body: emailBody,
                  cc: [],
                  delayTS: 0,
                  encoding: 'utf-8',
                  from: emailFrom,
                  priority: 'normal',
                  subject: emailSubject,
                  to: emailTo,
                  attachments: emailAttachments,
                },
                {
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                  },
                },
              )
              .then((r) => {
                return { status: r.status, data: r.data };
              })
              .catch((e) => {
                throw new HttpException(
                  { message: 'Failed to post email to API: ' + e },
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
          { message: 'Failed to get email auth token: response or response access token is null' },
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((e) => {
        throw new HttpException(
          { message: e }, 
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      });
  }
}
