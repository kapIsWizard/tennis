import { Migration001Platform } from './migrations/Migration001Platform';
import { Migration002Mutations } from './migrations/Migration002Mutations';
import { Migration003Players } from './migrations/Migration003Players';

export const migrations = [
  Migration001Platform,
  Migration002Mutations,
  Migration003Players,
];
