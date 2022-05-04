import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { map, catchError } from 'rxjs/operators';
import { CreateEmailDto } from '../dto/create-email.dto';

@Injectable()
export class EmailService {
  constructor(private httpService: HttpService) {}

  getToken() {
    return axios
      .post(process.env.EMAIL_TOKEN_URL, 'grant_type=client_credentials', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.EMAIL_USERNAME,
          password: process.env.EMAIL_PASSWORD,
        },
      })
      .then((res) => {
        if (res && res.data.access_token) return res.data.access_token;
        return null;
      })
      .catch((e) => {
        throw new HttpException(e.response.data, e.response.status);
      });
  }

  create(email: CreateEmailDto) {
    const email_to = ['catherine.meng@gov.bc.ca'];
    const email_subject = 'TEST Old Growth Email';
    const email_tag = 'field_verification_email'; // might link this tag to the submission id
    const email_type = 'text';

    if (process.env.EMAIL_TOKEN_URL && process.env.EMAIL_SEND_URL) {
      return this.getToken()
        .then((access_token) => {
          if (access_token) {
            return this.httpService
              .post(
                process.env.EMAIL_SEND_URL,
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
                  to: email_to,
                  tag: email_tag,
                  attachments: email.emailAttachments || [],
                },
                {
                  headers: { Authorization: `Bearer ${access_token}` },
                },
              )
              .pipe(
                map((r) => {
                  return [true, r.data];
                }),
              )
              .pipe(
                catchError((e) => {
                  throw new HttpException(e.response.data, e.response.status);
                }),
              );
          }
          return [
            false,
            'Failed to send email, failed to get the authentication token',
          ];
        })
        .catch((e) => {
          throw new HttpException(e.response.data, e.response.status);
        });
    }

    return [
      false,
      'Failed to send email, missing authentication url or CHES email server url',
    ];
  }
}
