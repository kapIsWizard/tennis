import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main>
      <p className="eyebrow">Amatorskie ligi tenisowe</p>
      <h1>Low on Legs</h1>
      <p>Zbuduj kartotekę graczy, a potem zaproś ich do wspólnej ligi.</p>
      <Link className="button" href="/players">
        Przejdź do graczy
      </Link>
    </main>
  );
}
