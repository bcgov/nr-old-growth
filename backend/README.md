# Overview

The backend for nr-old-growth project is written in [NestJS](https://github.com/nestjs/nest) with the openapi integration.

## Setup local development

- Create a .env file inside this backend folder with the following options. **Please only set "NODE_ENV=production" in production deployment, for local, please set "NODE_ENV=development"**, so it won't send the real email

  ```
  NODE_ENV=development

  POSTGRESQL_USER=[local postgres username]
  POSTGRESQL_PASSWORD=[local postgres password]
  POSTGRESQL_DATABASE=[local postgres database]

  FRONTEND_URL=[enable cors for this frontend url]
  BACKEND_URL=[enable cors for this backend url to enable try in swagger]

  CHES_CLIENT_ID=[CHES service dev username]
  CHES_CLIENT_SECRET=[CHES service dev password]
  # CHES dev authentication url
  CHES_TOKEN_URL=https://dev.oidc.gov.bc.ca/auth/realms/jbd6rnxw/protocol/openid-connect/token
  # CHES dev email url
  EMAIL_POST_URL=https://ches-dev.apps.silver.devops.gov.bc.ca/api/v1/email
  CHES_EMAIL_FROM=[send from email address]

  IDIR_FORM_ID=[CHEFS form id for idir user]
  IDIR_FORM_VERSION_ID=[CHEFS form version id for idir user]
  IDIR_FORM_PASSWORD=[CHEFS form token for idir user]

  BCEID_FORM_ID=[CHEFS form id for bceid user]
  BCEID_FORM_VERSION_ID=[CHEFS form version id for bceid user]
  BCEID_FORM_PASSWORD=[CHEFS form token for bceid user]
  ```

- Install dependencies `npm install`
- Start the server `npm start`
- Run test `npm run test`

## Reference reading

[Setup openapi module with nestjs](https://dev.to/arnaudcortisse/trying-out-nestjs-part-3-creating-an-openapi-document-3800)
