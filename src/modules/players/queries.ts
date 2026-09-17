import type { EntityManager } from '@mikro-orm/postgresql';
import { z } from 'zod';
import type { Id, Page } from '@/shared/contracts';
import { DomainError } from '@/shared/errors';

export interface PlayerDto {
  id: Id;
  firstName: string;
  lastName: string;
  nickname: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  avatarVersion: number | null;
  leagueCount: number;
  matchCount: number;
}

interface PlayerRow {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
  has_avatar: boolean;
}

function dto(row: PlayerRow): PlayerDto {
  const iso = (value: Date | string) =>
    value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    nickname: row.nickname,
    version: row.version,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    deletedAt: row.deleted_at ? iso(row.deleted_at) : null,
    avatarVersion: row.has_avatar ? row.version : null,
    leagueCount: 0,
    matchCount: 0,
  };
}

const CursorSchema = z.tuple([z.string(), z.string(), z.uuid()]);

function decodeCursor(cursor: string): [string, string, string] {
  try {
    return CursorSchema.parse(
      JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')),
    );
  } catch {
    throw new DomainError('VALIDATION', { cursor: 'Nieprawidłowy kursor.' });
  }
}

function encodeCursor(row: PlayerRow): string {
  return Buffer.from(
    JSON.stringify([row.last_name, row.first_name, row.id]),
  ).toString('base64url');
}

const columns = `p.id, p.first_name, p.last_name, p.nickname, p.version,
  p.created_at, p.updated_at, p.deleted_at,
  (a.player_id is not null) as has_avatar`;

export async function listPlayers(
  em: EntityManager,
  cursor?: string,
): Promise<Page<PlayerDto>> {
  const position = cursor ? decodeCursor(cursor) : undefined;
  const rows = await em.getConnection().execute<PlayerRow[]>(
    `select ${columns}
       from players p
       left join player_avatars a on a.player_id = p.id
      where p.deleted_at is null
        ${position ? 'and (p.last_name, p.first_name, p.id) > (?, ?, ?)' : ''}
      order by p.last_name, p.first_name, p.id
      limit 26`,
    position ?? [],
  );
  const pageRows = rows.slice(0, 25);
  return {
    items: pageRows.map(dto),
    nextCursor:
      rows.length > 25 && pageRows.at(-1) ? encodeCursor(pageRows.at(-1)!) : null,
  };
}

export async function getPlayer(
  em: EntityManager,
  id: Id,
  includeDeleted = false,
): Promise<PlayerDto> {
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) {
    throw new DomainError('VALIDATION', { id: 'Nieprawidłowe id.' });
  }
  const rows = await em.getConnection().execute<PlayerRow[]>(
    `select ${columns}
       from players p
       left join player_avatars a on a.player_id = p.id
      where p.id = ? ${includeDeleted ? '' : 'and p.deleted_at is null'}`,
    [parsedId.data],
  );
  if (!rows[0]) throw new DomainError('PLAYER_NOT_FOUND');
  return dto(rows[0]);
}

export async function getAvatar(
  em: EntityManager,
  id: Id,
): Promise<{ bytes: Buffer; updatedAt: string }> {
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) throw new DomainError('PLAYER_NOT_FOUND');
  const rows = await em.getConnection().execute<
    { bytes: Buffer; updated_at: Date | string }[]
  >(
    `select a.bytes, a.updated_at
       from player_avatars a
       join players p on p.id = a.player_id
      where a.player_id = ? and p.deleted_at is null`,
    [parsedId.data],
  );
  if (!rows[0]) throw new DomainError('PLAYER_NOT_FOUND');
  return {
    bytes: Buffer.from(rows[0].bytes),
    updatedAt: new Date(rows[0].updated_at).toISOString(),
  };
}
