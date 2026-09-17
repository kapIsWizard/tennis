import { defineConfig } from '@mikro-orm/postgresql';
import {
  ApplicationSettingSchema,
  RateLimitBucketSchema,
  RequestTokenSchema,
  SportSchema,
} from './src/db/entities';
import { PlayerAvatarSchema } from './src/modules/players/avatar.entity';
import { PlayerSchema } from './src/modules/players/player.entity';
import { migrations } from './src/db/migrations';

export function createOrmConfig(clientUrl: string, schema?: string) {
  return defineConfig({
    clientUrl,
    driverOptions: schema ? { options: `-c search_path=${schema}` } : undefined,
    pool: { max: 10 },
    entities: [
      SportSchema,
      RequestTokenSchema,
      ApplicationSettingSchema,
      RateLimitBucketSchema,
      PlayerSchema,
      PlayerAvatarSchema,
    ],
    schema,
    migrations: {
      migrationsList: migrations,
      schema,
      snapshot: false,
    },
    schemaGenerator: {
      ignoreRoutines: true,
    },
  });
}

export default createOrmConfig(
  process.env.DATABASE_URL ?? 'postgresql://127.0.0.1/low_on_legs',
);
