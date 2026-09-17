import { defineEntity, p } from '@mikro-orm/postgresql';

export const SportSchema = defineEntity({
  name: 'Sport',
  tableName: 'sports',
  properties: {
    id: p.uuid().primary(),
    code: p.text().unique().check("\"code\" in ('TENNIS')"),
    name: p.text(),
  },
});

export class Sport extends SportSchema.class {}

SportSchema.setClass(Sport);

export const RequestTokenSchema = defineEntity({
  name: 'RequestToken',
  tableName: 'request_tokens',
  properties: {
    id: p.uuid().primary(),
    operation: p.text(),
    token: p.text(),
    payloadHash: p.text(),
    response: p.json<unknown>().columnType('jsonb').nullable(),
  },
  uniques: [
    {
      name: 'request_tokens_operation_token_unique',
      properties: ['operation', 'token'],
    },
  ],
});

export class RequestToken extends RequestTokenSchema.class {}

RequestTokenSchema.setClass(RequestToken);

export const ApplicationSettingSchema = defineEntity({
  name: 'ApplicationSetting',
  tableName: 'application_settings',
  properties: {
    key: p.text().primary(),
    value: p.integer().check('"value" > 0'),
  },
});

export class ApplicationSetting extends ApplicationSettingSchema.class {}

ApplicationSettingSchema.setClass(ApplicationSetting);

export const RateLimitBucketSchema = defineEntity({
  name: 'RateLimitBucket',
  tableName: 'rate_limit_buckets',
  properties: {
    key: p.text().primary(),
    operation: p.text().primary(),
    windowStart: p.datetime().columnType('timestamptz').primary(),
    count: p.integer().check('"count" > 0'),
  },
  indexes: [
    {
      name: 'rate_limit_buckets_window_start_index',
      properties: ['windowStart'],
    },
  ],
});

export class RateLimitBucket extends RateLimitBucketSchema.class {}

RateLimitBucketSchema.setClass(RateLimitBucket);
