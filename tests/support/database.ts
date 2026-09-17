import { randomUUID } from 'node:crypto';
import type { EntityManager } from '@mikro-orm/postgresql';
import { MikroORM } from '@mikro-orm/postgresql';
import { createOrmConfig } from '../../mikro-orm.config';

function testDatabaseUrl(): string {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) {
    throw new Error('TEST_DATABASE_URL is required');
  }

  const parsed = new URL(value);
  const databaseName = decodeURIComponent(parsed.pathname.slice(1));
  if (!databaseName.endsWith('_test')) {
    throw new Error('TEST_DATABASE_URL database name must end with _test');
  }

  return value;
}

function scopedUrl(baseUrl: string, schema: string): string {
  const parsed = new URL(baseUrl);
  parsed.searchParams.set('options', `-c search_path=${schema}`);
  return parsed.toString();
}

export async function withTestDb<T>(
  fn: (em: EntityManager) => Promise<T>,
): Promise<T> {
  const baseUrl = testDatabaseUrl();
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  const adminOrm = await MikroORM.init(createOrmConfig(baseUrl));
  let testOrm: MikroORM | undefined;
  const previousDatabaseUrl = process.env.DATABASE_URL;

  try {
    await adminOrm.em.getConnection().execute(`create schema "${schema}"`);
    const url = scopedUrl(baseUrl, schema);
    testOrm = await MikroORM.init(createOrmConfig(url, schema));
    await testOrm.migrator.up({ schema });
    process.env.DATABASE_URL = url;
    return await fn(testOrm.em.fork());
  } finally {
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
    await testOrm?.close(true);
    await adminOrm.em
      .getConnection()
      .execute(`drop schema if exists "${schema}" cascade`);
    await adminOrm.close(true);
  }
}
