import { randomUUID } from 'node:crypto';

export function uniqueFixtureName(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}
