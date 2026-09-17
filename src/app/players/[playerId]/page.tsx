import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { withDb } from '@/db/orm';
import { getPlayer } from '@/modules/players/queries';
import { DomainError } from '@/shared/errors';
import { deletePlayerAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  let player;
  try {
    player = await withDb(em => getPlayer(em, playerId));
  } catch (error) {
    if (error instanceof DomainError && error.code === 'PLAYER_NOT_FOUND') notFound();
    throw error;
  }

  return (
    <main>
      <Link className="back-link" href="/players">
        ← Wróć do graczy
      </Link>
      <section className="profile-header">
        {player.avatarVersion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`Awatar: ${player.nickname}`}
            className="avatar profile-avatar"
            height={180}
            src={`/api/players/${player.id}/avatar?v=${player.avatarVersion}`}
            width={180}
          />
        ) : (
          <span aria-hidden="true" className="avatar-placeholder profile-avatar">
            {player.firstName[0]}
            {player.lastName[0]}
          </span>
        )}
        <div>
          <p className="eyebrow">Profil gracza</p>
          <h1>{player.nickname}</h1>
          <p className="lead">
            {player.firstName} {player.lastName}
          </p>
        </div>
      </section>
      <section className="stats-grid" aria-label="Podsumowanie gracza">
        <article className="card stat-card">
          <strong>{player.leagueCount}</strong>
          <span>Ligi</span>
        </article>
        <article className="card stat-card">
          <strong>{player.matchCount}</strong>
          <span>Mecze</span>
        </article>
      </section>
      <div className="button-row profile-actions">
        <Link className="button" href={`/players/${player.id}/edit`}>
          Edytuj profil
        </Link>
        <ConfirmDelete
          action={deletePlayerAction}
          id={player.id}
          version={player.version}
        />
      </div>
    </main>
  );
}
