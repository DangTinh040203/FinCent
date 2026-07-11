import Joi from 'joi';

export enum Env {
  NODE_ENV = 'NODE_ENV',

  PORT = 'PORT',
  API_PREFIX = 'API_PREFIX',
  FE_URL = 'FE_URL',

  CLERK_WEBHOOK_SECRET = 'CLERK_WEBHOOK_SECRET',
  CLERK_PUBLISHABLE_KEY = 'CLERK_PUBLISHABLE_KEY',
  CLERK_SECRET_KEY = 'CLERK_SECRET_KEY',

  DATABASE_URL = 'DATABASE_URL',
  REDIS_URL = 'REDIS_URL',
  REDIS_NAMESPACE = 'REDIS_NAMESPACE',
}

export const validationSchema = Joi.object({
  [Env.NODE_ENV]: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  [Env.PORT]: Joi.number().default(8000),
  [Env.API_PREFIX]: Joi.string().default('api'),
  [Env.FE_URL]: Joi.string().default('http://localhost:3001'),

  [Env.CLERK_WEBHOOK_SECRET]: Joi.string().required(),
  [Env.CLERK_PUBLISHABLE_KEY]: Joi.string().required(),
  [Env.CLERK_SECRET_KEY]: Joi.string().required(),

  [Env.DATABASE_URL]: Joi.string().required(),
  [Env.REDIS_URL]: Joi.string().required(),
  [Env.REDIS_NAMESPACE]: Joi.string().default('fincent'),
});
