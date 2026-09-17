import { defineConfig } from '@mikro-orm/postgresql';
import { SportSchema } from './src/db/entities';
import { migrations } from './src/db/migrations';

export function createOrmConfig(clientUrl: string, schema?: string) {
  return defineConfig({
    clientUrl,
    entities: [SportSchema],
    schema,
    migrations: {
      migrationsList: migrations,
      schema,
      snapshot: false,
    },
  });
}

export default createOrmConfig(
  process.env.DATABASE_URL ?? 'postgresql://127.0.0.1/low_on_legs',
);
