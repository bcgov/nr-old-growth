import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { map, catchError } from 'rxjs/operators';

const oauth = require('axios-oauth-client');

@Injectable()
export class FormService {
  constructor(private httpService: HttpService) {}

  getSubmissionList(formId: String) {
    return axios
      .get(
        `https://chefs.nrs.gov.bc.ca/app/api/v1/forms/b6803f31-269b-4406-8cc7-b2bdc80d94dc/submissions`,
        {
          auth: {
            username: process.env.FORM_USERNAME,
            password: process.env.FORM_PASSWORD,
          },
        },
      )
      .then((r) => {
        if (r) return { status: r.status, data: r.data };
        else return { status: null, data: null };
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }

  handleSubmission(formId: String) {
    return this.getSubmissionList(formId)
      .then((submissionData) => {
        if (submissionData) {
          return this.httpService
            .get(
              // `https://chefs.nrs.gov.bc.ca/app/api/v1/forms/b6803f31-269b-4406-8cc7-b2bdc80d94dc/statusCodes`,
              // `https://chefs.nrs.gov.bc.ca/app/api/v1/submissions/f3106c02-3792-44f6-87f4-b60460d7e778`,
              `https://chefs.nrs.gov.bc.ca/app/api/v1/forms/b6803f31-269b-4406-8cc7-b2bdc80d94dc/versions/30243ebe-8e45-4568-b697-6cbc685abe32/submissions/discover`,
              {
                auth: {
                  username: process.env.FORM_USERNAME,
                  password: process.env.FORM_PASSWORD,
                },
                params: {
                  fields: 'naturalResourceDistrict',
                },
              },
            )
            .pipe(
              map((r) => {
                const submissionList = submissionData.data;
                const emailList = r.data;
                return { status: r.status, data: r.data };
              }),
            )
            .pipe(
              catchError((e) => {
                console.log(e);
                throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
              }),
            );
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

  sendEmail(submissionId: String) {
    return axios
      .post(
        `https://chefs.nrs.gov.bc.ca/app/api/v1/submissions/f3106c02-3792-44f6-87f4-b60460d7e778/email`,
        {
          auth: {
            username: process.env.FORM_USERNAME,
            password: process.env.FORM_PASSWORD,
          },
          data: {
            to: 'catherine.meng@gov.bc.ca',
          },
          // headers: { Referer: 'http://localhost:3000/api/' },
        },
      )
      .then((r) => {
        if (r) return { status: r.status, data: r.data };
        else return null;
      })
      .catch((e) => {
        throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });
  }
}
