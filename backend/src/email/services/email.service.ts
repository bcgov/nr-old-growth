import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { map, catchError } from 'rxjs/operators';
import { EmailEntity } from '../model/email.entity';

@Injectable()
export class EmailService {
  constructor(private httpService: HttpService) {}

  getToken() {
    return axios
      .post(
        process.env.EMAIL_TOKEN_URL,
        `grant_type=client_credentials&client_id=${process.env.EMAIL_USERNAME}&client_secret=${process.env.EMAIL_PASSWORD}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          // auth: {
          //   username: process.env.EMAIL_USERNAME,
          //   password: process.env.EMAIL_PASSWORD,
          // },
        },
      )
      .then((res) => {
        if (res && res.data.access_token) return res.data.access_token;
        return null;
      })
      .catch((e) => {
        console.log('token error', e);
        throw new HttpException(
          `Failed to get token, ${e.response.data}`,
          e.response.status,
        );
      });
  }

  create(email: EmailEntity) {
    const email_subject = 'Old Growth Field Observation form and package';
    const email_tag = 'field_verification_email'; // might link this tag to the submission id
    const email_type = 'text';

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

    if (!email.emailTo) {
      throw new HttpException(
        'Failed to send email, missing required emailTo parameter',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.getToken()
      .then((access_token) => {
        if (access_token) {
          return this.httpService
            .post(
              `${process.env.EMAIL_API_URL}/email`,
              {
                bcc: [],
                bodyType: email_type,
                body: email.emailBody || 'Hello World',
                cc: [],
                delayTS: 0,
                encoding: 'utf-8',
                from: process.env.EMAIL_FROM,
                priority: 'normal',
                subject: email_subject,
                to: email.emailTo,
                tag: email_tag,
                attachments: email.emailAttachments || [],
              },
              {
                headers: { Authorization: `Bearer ${access_token}` },
              },
            )
            .pipe(
              map((r) => {
                return { status: r.status, data: r.data };
              }),
            )
            .pipe(
              catchError((e) => {
                throw new HttpException(e.response.data, e.response.status);
              }),
            );
        }
        throw new HttpException(
          'Failed to send email, failed to get the authentication token',
          HttpStatus.BAD_REQUEST,
        );
      })
      .catch((e) => {
        throw new HttpException(e.response.data, e.response.status);
      });
  }
}
