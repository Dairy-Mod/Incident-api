import 'dotenv/config';
import * as env from 'env-var';

export const envs = {
  PORT: env.get('PORT').required().asPortNumber(),
  MAILER_EMAIL: env.get('MAILER_EMAIL').required().asString(),
  MAILER_PASSWORD: env.get('MAILER_PASSWORD').required().asString(),
  MAILER_SERVICE: env.get('MAILER_SERVICE').required().asString(),
  MAPBOX_TOKEN: env.get('MAPBOX_TOKEN').required().asString(),
  APPINSIGHTS_CONNECTION_STRING: env
    .get('APPINSIGHTS_CONNECTION_STRING')
    .required()
    .asString(),
  DATABASE_URL: env.get('DATABASE_URL').required().asString(),
  REDIS_HOST: env.get('REDIS_HOST').required().asString(),
  REDIS_PORT: env.get('REDIS_PORT').required().asPortNumber(),
};
