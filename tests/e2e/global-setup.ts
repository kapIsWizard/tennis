import { MikroORM } from '@mikro-orm/postgresql';
import { createOrmConfig } from '../../mikro-orm.config';

export default async function globalSetup(): Promise<void> {
  const databaseUrl = process.env.E2E_DATABASE_URL;
  if (!databaseUrl) throw new Error('E2E_DATABASE_URL is required');
  const databaseName = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
  if (!databaseName.endsWith('_e2e_test')) {
    throw new Error('E2E_DATABASE_URL database name must end with _e2e_test');
  }

  const orm = await MikroORM.init(createOrmConfig(databaseUrl));
  try {
    await orm.em.getConnection().execute('drop schema public cascade');
    await orm.em.getConnection().execute('create schema public');
    await orm.migrator.up();
  } finally {
    await orm.close(true);
  }
}
