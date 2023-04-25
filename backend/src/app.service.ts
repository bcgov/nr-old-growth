import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
const oauth = require('axios-oauth-client');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Ok';
  }

  getToken() {
    const getClientCredentials = oauth.client(axios.create(), {
      url: process.env.CHES_TOKEN_URL,
      grant_type: 'client_credentials',
      client_id: process.env.CHES_CLIENT_ID,
      client_secret: process.env.CHES_CLIENT_SECRET,
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
}
