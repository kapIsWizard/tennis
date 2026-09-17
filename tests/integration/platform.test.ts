import { afterEach, expect, test, vi } from 'vitest';
import { createBarrier } from '../support/barrier';
import { withTestDb } from '../support/database';

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  vi.resetModules();
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

test('migracje są powtarzalne i sport TENNIS istnieje raz', async () => {
  await withTestDb(async em => {
    const { getOrm } = await import('@/db/orm');
    const { migrate } = await import('@/db/migrate');

    await migrate();
    await migrate();

    const rows = await em.getConnection().execute(
      "select code from sports where code = 'TENNIS'",
    );
    expect(rows).toEqual([{ code: 'TENNIS' }]);

    const orm = await getOrm();
    expect(await orm.migrator.getPending()).toEqual([]);
    const [{ current_schema: schema }] = await em
      .getConnection()
      .execute<{ current_schema: string }[]>('select current_schema()');
    const schemaDiff = await orm.schema.getUpdateSchemaMigrationSQL({
      schema,
      wrap: false,
    });
    expect(schemaDiff.up.trim()).toBe('');
    await orm.close(true);
  });
});

test('health zwraca 503 bez szczegółów połączenia oraz 200 dla dostępnej bazy', async () => {
  process.env.DATABASE_URL =
    'postgresql://postgres:invalid@127.0.0.1:1/low_on_legs_test?connect_timeout=1';
  const unavailableRoute = await import('@/app/api/health/route');

  const unavailable = await unavailableRoute.GET();

  expect(unavailable.status).toBe(503);
  expect(await unavailable.json()).toEqual({ status: 'unavailable' });
  const unavailableOrm = await import('@/db/orm');
  await (await unavailableOrm.getOrm()).close(true);

  await withTestDb(async () => {
    vi.resetModules();
    const availableRoute = await import('@/app/api/health/route');
    const available = await availableRoute.GET();
    expect(available.status).toBe(200);
    expect(await available.json()).toEqual({ status: 'ok' });

    const { getOrm } = await import('@/db/orm');
    await (await getOrm()).close(true);
  });
});

test('getOrm usuwa odrzuconą inicjalizację z cache', async () => {
  process.env.DATABASE_URL = 'not-a-postgresql-url';
  const { getOrm } = await import('@/db/orm');

  await expect(getOrm()).rejects.toThrow();

  await withTestDb(async () => {
    const orm = await getOrm();
    await expect(orm.em.getConnection().execute('select 1')).resolves.toBeTruthy();
    await orm.close(true);
  });
});

test('withDb przekazuje równoległym operacjom niezależne EntityManager', async () => {
  await withTestDb(async () => {
    const { getOrm, withDb } = await import('@/db/orm');
    const waitForBoth = createBarrier(2);
    const contexts: unknown[] = [];

    await Promise.all([
      withDb(async em => {
        contexts.push(em);
        await waitForBoth();
      }),
      withDb(async em => {
        contexts.push(em);
        await waitForBoth();
      }),
    ]);

    expect(contexts).toHaveLength(2);
    expect(contexts[0]).not.toBe(contexts[1]);

    await (await getOrm()).close(true);
  });
});
