# Low On Legs MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox ('- [ ]') syntax for tracking.

**Goal:** Zbudować publiczną aplikację do amatorskich lig tenisowych: klasyczny round-robin oraz indywidualny ranking Elo, w singlu i deblu, z historią, statystykami i przenośnym uruchomieniem kontenerowym.

**Architecture:** Modularny monolit Next.js z PostgreSQL i MikroORM oraz osobny proces workera z tego samego repozytorium i obrazu. Czyste funkcje domenowe walidują tenis, generują terminarz i liczą klasyfikacje; serwisy aplikacyjne koordynują transakcje. Elo dopisuje nowe wyniki synchronicznie tylko przy aktualnym rankingu, a korekty odtwarza asynchronicznie z atomową publikacją.

**Tech Stack:** Next.js App Router 16.x, React zgodny z peer dependencies Next.js, TypeScript strict, Node.js 24 LTS, MikroORM 7.2.x (PostgreSQL), PostgreSQL 18, npm z package-lock.json, Zod, Sharp, Vitest, Playwright, Docker Compose v2. Dokładne wspierane wydania poprawkowe przypiąć przez instalację z --save-exact w zadaniu 1 i zachować w lockfile.

**Spec:** [Zatwierdzony projekt](../specs/2026-09-15-low-on-legs-mvp-design.md), [specyfikacja szczegółowa](../../detailed-specification.md), [specyfikacja bazowa](../../base-specification.md).

**Data:** 2026-09-16.
**Status:** Plan implementacji; kod aplikacji nie został jeszcze napisany.
**Akceptacja projektu:** Użytkownik zatwierdził cały dokument po brainstormingu w rozmowie 2026-09-16. Jego wcześniejszy status „oczekuje na przegląd” jest historyczny.
**Miejsce pracy:** Obecny folder C:/Users/Adam/Repo/tennis. Bez worktrees. Ten plan nie zleca wdrożenia produkcyjnego ani nie rozpoczyna implementacji.

## Global Constraints

Poniższe reguły obowiązują w każdym zadaniu. Rozstrzygnięcia projektu §2 mają pierwszeństwo nad sprzecznymi fragmentami starszych specyfikacji.

- Next.js App Router, TypeScript strict, MikroORM i PostgreSQL; runtime Node.js.
- Bez kont, logowania, ról, prywatnych grup, mikroserwisów i zewnętrznego brokera.
- Sport TENNIS; rodzaje CLASSIC/ELO_INFINITE; tryby SINGLES/DOUBLES.
- Sport, rodzaj i tryb ligi są niezmienne od utworzenia.
- Minimum: 2 graczy w singlu, 2 pełne stałe pary w klasycznym deblu, 4 graczy w deblu Elo.
- Klasyczna liga, członkostwa, pary i cały terminarz powstają atomowo; brak utrwalanych szkiców.
- Terminarz: n × (n − 1) / 2 albo n × (n − 1); rewanże z odwróconymi stronami w drugiej części.
- Dowolna kolejka może otrzymać wynik. Nie wolno usuwać meczu klasycznego, czyścić wyniku ani zmieniać jego stron.
- Liga klasyczna kończy się automatycznie po wszystkich wynikach; korekta jej nie otwiera.
- Best of 3: dokładnie 2 sety przy 2:0 albo 3 przy 2:1.
- Pierwsze dwa sety mają wspólny format. Fast4: 4:0, 4:1, 4:2, 4:3. Normalny: 6:0–6:4, 7:5, 7:6; także wyniki odwrócone.
- Trzeci set przy 1:1: FAST4, NORMAL albo SUPER_TIE_BREAK, niezależnie od formatu otwierającego.
- Super tie-break: 10:0–10:8 albo wynik powyżej 10 z przewagą dokładnie 2; 12:8 jest niepoprawne.
- Małe punkty tylko w trzecim secie SUPER_TIE_BREAK; dodaje on zero gemów.
- Klasyczna punktacja: 5/0 za 2:0, 4/2 za 2:1. Sortowanie: punkty, bilans setów, bilans gemów.
- Pełny remis w tabeli i równy rating Elo dają miejsca 1, 1, 3.
- Elo: start 1000, minimum 500, K domyślnie 32, całkowite 10–60; połówki zaokrąglane od zera.
- Debel Elo: średnie ratingi stron; wspólne calculatedDelta, indywidualne appliedDelta.
- resultRecordedAt i eloKSnapshot są niezmienne po pierwszym zapisie; czas nadaje serwer po blokadzie ligi.
- Kolejność Elo: resultRecordedAt, id; nadawane czasy ściśle rosną w lidze.
- Dodawanie członków Elo dozwolone w dowolnym momencie; brak wypisywania i ponownego dołączania.
- Soft delete gracza zachowuje członkostwa, historię, miejsce i rating. Pseudonim pozostaje zarezerwowany.
- Usunięta liga nie występuje w publicznych odczytach, statystykach, profilach ani mutacjach.
- Awatary: JPEG, PNG i WebP do 5 MB; po przetworzeniu maksymalnie 256 × 256 px z zachowaniem proporcji.
- Interfejs polski, responsywny i dostępny z klawiatury; czas Europe/Warsaw, etykieta „Wynik zapisano”.
- UUID jako klucze; timestamptz jako czasy; wersjonowane migracje; oddzielny EntityManager na żądanie i job.
- App i worker jako osobne kontenery tej samej wersji obrazu; migracja jako osobny krok; backup i próba odtworzenia przed produkcją.

## Zakres i kolejność

Repozytorium zawiera obecnie wyłącznie trzy dokumenty wymagań. Nie ma aplikacji, zależności ani testów bazowych. Nie używać generatora, który nadpisze dokumentację.

Jest to jeden powiązany produkt, nie zestaw niezależnych podsystemów. Plan ma trzy odbieralne etapy: A — gracze i liga klasyczna (1–6), B — pełne Elo i profile (7–11), C — eksploatacja i odbiór całości (12–13). Nie wydzielamy osobnych projektów z własnymi modelami meczu lub gracza.

| Zadanie | Rezultat | Zależności |
|---|---|---|
| 1 | Uruchamialny szkielet, baza i infrastruktura testów | brak |
| 2 | Wspólny protokół mutacji, limity i konflikty | 1 |
| 3 | Poprawny strukturalny wynik tenisowy | 1 |
| 4 | Globalni gracze, awatary i ich ekrany | 1–2 |
| 5 | Tworzenie lig i terminarz klasyczny | 2, 4 |
| 6 | Wyniki klasyczne, formularz i tabela | 3, 5 |
| 7 | Kalkulator Elo i deterministyczne odtwarzanie | 3 |
| 8 | Liga Elo, członkowie i synchroniczny zapis | 2, 5–7 |
| 9 | Korekty Elo, kolejka, worker i odzyskanie joba | 8 |
| 10 | Ranking, historia i status aktualizacji w UI | 9 |
| 11 | Profile, statystyki, strona główna i widoczność | 6, 10 |
| 12 | Obraz, Compose, migracje, recovery i instrukcja | 1–11 |
| 13 | Odbiór E2E, pomiary i kompletność MVP | 12 |

Kroki z checkboxami wykonujemy pojedynczo; dodawanie kolejnych przypadków z tabel testowych powtarza cykl czerwony test → implementacja → zielony test. Zadanie obejmuje kilka takich cykli, nie jedną ogromną zmianę. Commit dopiero po sprawdzeniu różnic i właściwych testach, ze stagingiem konkretnych plików zadania, bez git add .; nie publikować gałęzi automatycznie.

## Parametry techniczne przyjęte na potrzeby implementacji

To parametry eksploatacyjne do sprawdzenia w zadaniu 13, nie dodatkowe zasady sportowe.

| Parametr | Wartość początkowa |
|---|---|
| Imię/nazwisko/pseudonim/nazwa ligi | 1–80 / 1–80 / 1–40 / 1–120 znaków po trim |
| Zwykła mutacja / upload HTTP | 256 KiB / 6 MiB całego body |
| Plik obrazu | 5 000 000 bajtów; maks. 16 mln pikseli, 1 klatka |
| Terminarz | maks. 5 000 spotkań na utworzenie; brak limitu 30 graczy |
| Listy | 25 rekordów, maks. 100; stabilny kursor z id |
| Częstotliwość na klienta | 60 mutacji/min, 5 nowych lig/min, 10 uploadów/min, 20 korekt Elo/min |
| Globalny limit aplikacji | 600 mutacji/min; współdzielony w PostgreSQL |
| Worker | sprawdzanie co 1 s; lease 30 s, heartbeat co 5 s |
| Retry błędów workera | 5 prób; opóźnienia 1, 2, 4, 8 s przed kolejnymi próbami |
| Status UI | polling co 2 s w widocznej karcie, co 10 s po błędzie; ponowienie po focus |
| DB pool | app 10, worker 5; zestawić z limitem połączeń hostingu |
| Blokada transakcji | lock_timeout 5 s; transakcje mutacji ograniczone do 15 s |

Wspólna konfiguracja limitów w tabeli application_settings; wszystkie procesy czytają ją z bazy, bez odrębnych wartości w pamięci. Klient identyfikowany przez HMAC adresu IP ustalonego przez zaufany reverse proxy; nie ufać dowolnemu X-Forwarded-For. Instrukcja wdrożenia określi zaufany proxy i APP_ORIGIN. Lokalnie wspólny koszyk jest akceptowalny. Brak identyfikacji użytkowników pozostaje zamierzony.

## Mapa plików i odpowiedzialności

Wszystkie wymienione dalej ścieżki są względem repozytorium. Pliki powstają dopiero w zadaniu, które ich potrzebuje.

| Obszar | Pliki |
|---|---|
| Narzędzia | package.json, package-lock.json, tsconfig.json, next.config.ts, eslint.config.mjs, vitest.config.ts, playwright.config.ts, .gitignore, .env.example, .nvmrc |
| Baza | mikro-orm.config.ts, src/db/orm.ts, src/db/entities.ts, src/db/migrations.ts, src/db/migrate.ts, src/db/migrations/Migration001Platform.ts do Migration006Elo.ts |
| Wspólny zapis | src/shared/contracts.ts, errors.ts, limits.ts, mutation.ts, idempotency.ts, rate-limit.ts, logger.ts (w src/shared/) |
| Gracze | src/modules/players/player.entity.ts, avatar.entity.ts, commands.ts, queries.ts, avatar.ts |
| Ligi | src/modules/leagues/league.entity.ts, membership.entity.ts, team.entity.ts, schedule.ts, commands.ts, queries.ts |
| Mecze | src/modules/matches/match.entity.ts, revision.entity.ts, commands.ts, queries.ts |
| Tenis | src/modules/tennis/types.ts, validate.ts, project.ts, score.entity.ts |
| Klasyfikacje | src/modules/standings/calculate.ts; src/modules/elo/types.ts, calculate.ts, replay.ts, publication.entity.ts, job.entity.ts, append.ts, queue.ts, queries.ts |
| Worker | src/workers/elo/claim.ts, snapshot.ts, publish.ts, run-once.ts, main.ts, health.ts |
| Statystyki | src/modules/statistics/player.ts, league.ts, queries.ts |
| UI wspólne | src/components/PlayerForm.tsx, LeagueForm.tsx, ScoreForm.tsx, ConfirmDelete.tsx, FieldError.tsx, Classification.tsx, EloStatus.tsx, Pagination.tsx |
| Routing | src/app/layout.tsx, page.tsx, globals.css, error.tsx, not-found.tsx; strony i akcje wskazane w zadaniach |
| Testy | tests/support/database.ts, fixtures.ts, barrier.ts; tests/unit/, tests/integration/, tests/e2e/ |
| Uruchomienie | Dockerfile, .dockerignore, compose.yaml, compose.external.yaml, compose.test.yaml, scripts/recover.ts, scripts/benchmark.ts, docs/operations.md |

Nie tworzyć pustych piętrowych warstw application/domain/infrastructure w każdym module. Domenowe funkcje nie importują Next.js ani ORM. Encje nie przechodzą do Client Components — zwracamy serializowalne DTO.

## Kontrakty wspólne

Zadania muszą zachować te nazwy i typy; zmiana kontraktu wymaga aktualizacji wszystkich zależnych fragmentów planu i testów.

~~~ts
// src/shared/contracts.ts
export type Id = string;
export type Side = 'A' | 'B';
export type Mode = 'SINGLES' | 'DOUBLES';
export type LeagueKind = 'CLASSIC' | 'ELO_INFINITE';
export type Sides = readonly [readonly Id[], readonly Id[]];
export type Versioned = { id: Id; expectedVersion: number };
export type Creation<T> = { token: string; data: T };
export type ActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string;
      fields?: Record<string, string>; retryAfterSeconds?: number };
export type Page<T> = { items: T[]; nextCursor: string | null };
~~~

Serwisy: pierwszy parametr em: EntityManager, dalej jawny command; wewnątrz mutacji jedna transakcja. Warstwa HTTP odpowiada za origin, limit body, parsowanie i rewalidację. Serwisy ponownie sprawdzają reguły domenowe oraz wersje.

Spójność blokad: najpierw liga FOR UPDATE (gdy dotyczy), następnie gracze po rosnącym UUID FOR SHARE, następnie mecz/job. Globalne usunięcie gracza blokuje jego wiersz FOR UPDATE, nie blokuje lig. Dzięki temu zapis i usunięcie mają jednoznaczną kolejność bez odwrócenia kolejności blokad. Aktualizacja ligi nie zwiększa wersji formularza przy każdym obliczeniu Elo — osobne version i input_revision/published_revision.

## Task 1: Uruchamialny fundament z PostgreSQL

**Files:** Utwórz pliki narzędziowe z mapy, src/app/layout.tsx, page.tsx, globals.css, src/app/api/health/route.ts, pliki src/db/, Migration001Platform.ts, compose.test.yaml, tests/support/database.ts, fixtures.ts, barrier.ts, tests/integration/platform.test.ts.
**Interfaces:** Produkuje getOrm(): Promise<MikroORM>, withDb<T>(fn: (em: EntityManager) => Promise<T>): Promise<T>, migrate(): Promise<void>, withTestDb<T>(fn: (em: EntityManager) => Promise<T>): Promise<T>.

- [ ] Sprawdź Node/npm/Docker/Git; Git w tym środowisku jest pod C:/Program Files/Git/cmd/git.exe. Wybierz Node 24 i utwórz package.json ręcznie, zachowując docs/. Zainstaluj poniższe pakiety, wszystkie MikroORM w identycznej wersji poprawkowej. Jest to setup, przed testem wymagającym runnera.
~~~powershell
npm install --save-exact next@16 react react-dom @mikro-orm/core@7.2 @mikro-orm/postgresql@7.2 @mikro-orm/migrations@7.2 zod sharp
npm install --save-dev --save-exact typescript @types/node @types/react @types/react-dom @mikro-orm/cli@7.2 vitest @playwright/test eslint eslint-config-next@16 tsx
~~~
- [ ] Skonfiguruj strict, alias @/* → src/*, Node runtime, dynamiczne strony czytające bazę i skrypty:
~~~json
{
  "dev": "next dev",
  "build": "next build && tsc -p tsconfig.worker.json",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration",
  "test:e2e": "playwright test",
  "db:migrate": "tsx src/db/migrate.ts",
  "worker": "tsx src/workers/elo/main.ts",
  "benchmark": "tsx scripts/benchmark.ts"
}
~~~
tsconfig.worker.json dodać przy workerze; do tego czasu build jest next build. Nie dodawać nieistniejących entrypointów do wymaganych sprawdzeń.
- [ ] Dodaj poniższy test po przygotowaniu testowego PostgreSQL. withTestDb tworzy losowy schemat, migruje go i usuwa wyłącznie ten schemat po teście; twardo wymaga TEST_DATABASE_URL z nazwą bazy kończącą się _test. Każdy równoległy test ma własny schemat, wszystkie połączenia danego testu ten sam search_path.
~~~ts
import { expect, test } from 'vitest';
import { withTestDb } from '../support/database';

test('migracje są powtarzalne i sport TENNIS istnieje raz', async () => {
  await withTestDb(async em => {
    const rows = await em.getConnection().execute(
      "select code from sports where code = 'TENNIS'"
    );
    expect(rows).toEqual([{ code: 'TENNIS' }]);
  });
});
~~~
- [ ] Uruchom npm run test:integration -- tests/integration/platform.test.ts; oczekuj błędu braku tabeli przed migracją. Następnie dodaj migrację sports(id UUID PK, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL) i seed TENNIS w tej samej migracji.
- [ ] Zaimplementuj ORM jako cache Promise inicjalizacji, z usunięciem odrzuconej obietnicy z cache; bez migracji przy inicjalizacji. Jawnie importuj encje i migracje, jawne tableName, defineEntity; withDb tworzy fork EntityManager. Health wykonuje SELECT 1 i zwraca 503 przy niedostępnej bazie, bez szczegółów połączenia.
~~~ts
export async function withDb<T>(
  fn: (em: EntityManager) => Promise<T>
): Promise<T> {
  const orm = await getOrm();
  return fn(orm.em.fork());
}
~~~
- [ ] Potwierdź powtórne uruchomienie migracji bez zmian, health 200/503, dwa niezależne konteksty ORM oraz produkcyjny build bez aktywnego połączenia w czasie kompilacji.
- [ ] Uruchom typecheck, lint, test platformy i build; przejrzyj lockfile oraz diff. Commit: chore: bootstrap application and database.

**Odbiór:** Strona startowa działa, schemat migruje się od zera, brak sekretów w repo. Na tym etapie brak funkcji biznesowych jest zamierzony.

## Task 2: Idempotentne i kontrolowane mutacje

**Files:** Utwórz pliki src/shared/ z mapy, src/db/migrations/Migration002Mutations.ts, tests/integration/mutations.test.ts, tests/unit/input.test.ts.
**Interfaces:** Consumes withDb i kontrakty. Produces once<T>(em, operation: string, token: string, canonicalPayload: unknown, execute: () => Promise<T>): Promise<T>; assertVersion(actual: number, expected: number): void; consumeLimit(em, clientKey: string, operation: string): Promise<void>; DomainError(code, fields?).

- [ ] Dodaj test konfliktu i powtórzenia tokenu; testy wywołują once w transakcji na osobnym em, nie współdzielą transakcji równolegle.
~~~ts
test('ten sam token nie tworzy drugiego zasobu', async () => {
  await withTestDb(async em => {
    let calls = 0;
    const invoke = (payload: object) => em.transactional(tx =>
      once(tx, 'CREATE_PLAYER', 'token-1', payload, async () => {
        calls += 1;
        return { id: 'saved' };
      }));
    expect(await invoke({ nickname: 'Adam' })).toEqual({ id: 'saved' });
    expect(await invoke({ nickname: 'Adam' })).toEqual({ id: 'saved' });
    expect(calls).toBe(1);
    await expect(invoke({ nickname: 'Ewa' }))
      .rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  });
});
~~~
- [ ] Uruchom test przed implementacją. Utwórz request_tokens z UNIQUE(operation, token), payload_hash i response JSONB. W tej samej transakcji INSERT ON CONFLICT DO NOTHING RETURNING, następnie SELECT FOR UPDATE; porównaj hash, zwróć istniejący response lub wykonaj callback i zapisz wynik. Rollback usuwa także nowy token. Hash SHA-256 z rekursywnie sortowanych kluczy, zachowując kolejność tablic; normalizacja danych przed hashem.
- [ ] Dodaj application_settings oraz rate_limit_buckets(key, operation, window_start, count), z kluczem złożonym. Atomowy UPSERT zwiększa licznik tylko poniżej limitu; brak RETURNING oznacza RATE_LIMITED. Kontrola limitu przed dekodowaniem obrazów i kosztowną transakcją; odrzucone próby mogą zużyć limit, ale nie tworzą zasobów.
~~~sql
INSERT INTO rate_limit_buckets(key, operation, window_start, count)
VALUES (?, ?, ?, 1)
ON CONFLICT (key, operation, window_start)
DO UPDATE SET count = rate_limit_buckets.count + 1
WHERE rate_limit_buckets.count < ?
RETURNING count;
~~~
- [ ] Dodaj ścisłe schematy Zod odrzucające nieznane pola, nieujemne wersje meczu (0 dla PENDING), dodatnie wersje gracza i ligi, UUID zasobów i token UUID tworzony przez formularz. Token żyje w stanie formularza/sessionStorage do potwierdzonego sukcesu lub świadomego rozpoczęcia nowej operacji. Ten sam payload po błędzie sieciowym używa tego samego tokenu.
- [ ] Dodaj błędy VALIDATION, VERSION_CONFLICT, IDEMPOTENCY_CONFLICT, RATE_LIMITED, NOT_FOUND, FORBIDDEN_OPERATION; mapuj później także domenowe kody specyfikacji §25. Zewnętrzny błąd zawiera polski komunikat, log wewnętrzny requestId, code i czas bez całego formularza.
- [ ] Sprawdź 20 jednoczesnych identycznych utworzeń, różny payload pod tym samym tokenem, rollback callbacku, limit z dwóch połączeń, niezaufany forwarded header i przekroczenie body. Użyj Promise.all na oddzielnych forkach EM, bez sleep jako synchronizacji.
- [ ] Uruchom testy mutations/input, typecheck i lint. Commit: feat: protect public mutations.

**Odbiór:** Mechanizm serwerowy działa między procesami; nie polega na zablokowaniu przycisku ani pamięci aplikacji.

## Task 3: Strukturalny wynik tenisowy

**Files:** Utwórz src/modules/tennis/types.ts, validate.ts, project.ts, tests/unit/tennis.test.ts.
**Interfaces:** Produces TennisScore, TennisProjection, validateScore(score): TennisProjection. Nie przyjmuje winner ani daty od klienta.

~~~ts
export type Format = 'FAST4' | 'NORMAL';
export type TennisScore = {
  openingSetFormat: Format;
  decidingSetFormat: Format | 'SUPER_TIE_BREAK' | null;
  sets: { order: number; kind: 'GAME_SET' | 'SUPER_TIE_BREAK';
          sideA: number; sideB: number }[];
};
export type TennisProjection = {
  winner: 'A' | 'B';
  setsA: number; setsB: number; gamesA: number; gamesB: number;
  superTieBreaksA: number; superTieBreaksB: number;
};
~~~

- [ ] Dodaj testy parametryczne legalnych wyników i lustrzanych stron. Główny test regresyjny:
~~~ts
test('super tie-break liczy set, nie gemy', () => {
  expect(validateScore({
    openingSetFormat: 'NORMAL',
    decidingSetFormat: 'SUPER_TIE_BREAK',
    sets: [
      { order: 1, kind: 'GAME_SET', sideA: 6, sideB: 4 },
      { order: 2, kind: 'GAME_SET', sideA: 4, sideB: 6 },
      { order: 3, kind: 'SUPER_TIE_BREAK', sideA: 10, sideB: 8 }
    ]
  })).toEqual({
    winner: 'A', setsA: 2, setsB: 1, gamesA: 10, gamesB: 10,
    superTieBreaksA: 1, superTieBreaksB: 0
  });
});
~~~
- [ ] Uruchom npm run test:unit -- tests/unit/tennis.test.ts i potwierdź czerwony wynik.
- [ ] Zaimplementuj walidację skończonych, bezpiecznych liczb całkowitych ≥0; pozycji 1–3 bez luk; rodzaju wynikającego z formatu. Dla dwóch setów normalizuj decidingSetFormat do null. Odrzucaj trzeci po 2:0 i brak trzeciego po 1:1.
~~~ts
function isFinishedSet(format: Format | 'SUPER_TIE_BREAK', a: number, b: number) {
  if (![a, b].every(v => Number.isSafeInteger(v) && v >= 0)) return false;
  const hi = Math.max(a, b), lo = Math.min(a, b);
  if (format === 'FAST4') return hi === 4 && lo <= 3;
  if (format === 'NORMAL') return (hi === 6 && lo <= 4) ||
    (hi === 7 && (lo === 5 || lo === 6));
  return (hi === 10 && lo <= 8) || (hi > 10 && hi - lo === 2);
}
~~~
- [ ] Iteruj sety, przed każdym sprawdzając czy któraś strona już wygrała dwa; gemy sumuj tylko GAME_SET. Zwróć pola TennisProjection; błąd wskazuje sets.2.sideB lub właściwe pole.
- [ ] Pokryj: Fast4 3:3/5:3, NORMAL 6:5/8:6, STB 10:9/12:8, ujemne, ułamki, NaN, brakujące sety, dodatkowe sety, super tie-break w otwarciu, dwa różne formaty pierwszych setów przez próby przemycenia dodatkowych pól.
- [ ] Uruchom tennis.test.ts i typecheck. Commit: feat: implement tennis score rules.

**Odbiór:** Jedna funkcja obsługuje tworzenie, korekty i statystyki, bez reguł punkt po punkcie.


## Task 4: Globalni gracze i awatary

**Files:** Utwórz src/modules/players/player.entity.ts, avatar.entity.ts, commands.ts, queries.ts, avatar.ts; Migration003Players.ts; src/app/players/page.tsx, new/page.tsx, [playerId]/page.tsx, [playerId]/edit/page.tsx, actions.ts; src/app/api/players/[playerId]/avatar/route.ts; src/components/PlayerForm.tsx, FieldError.tsx, ConfirmDelete.tsx; tests/integration/players.test.ts, tests/e2e/players.spec.ts.
**Interfaces:** createPlayer(em, Creation<PlayerInput>): Promise<{id,version}>; updatePlayer(em, Versioned & PlayerInput); deletePlayer(em, Versioned); listPlayers(em, cursor?): Promise<Page<PlayerDto>>; getPlayer(em,id,includeDeleted=false); setAvatar(em,id,expectedVersion,bytes): Promise<{version}>. PlayerInput = {firstName,lastName,nickname}; PlayerDto dodaje id, version, deletedAt i avatarVersion.

- [ ] Dodaj test rezerwacji pseudonimu również po usunięciu.
~~~ts
test('usunięcie nie zwalnia pseudonimu', async () => {
  await withTestDb(async em => {
    const p = await createPlayer(em, {
      token: crypto.randomUUID(),
      data: { firstName: 'Adam', lastName: 'Nowak', nickname: ' As ' }
    });
    await deletePlayer(em, { id: p.id, expectedVersion: p.version });
    await expect(createPlayer(em, {
      token: crypto.randomUUID(),
      data: { firstName: 'Ewa', lastName: 'Nowak', nickname: 'as' }
    })).rejects.toMatchObject({ code: 'NICKNAME_TAKEN' });
  });
});
~~~
- [ ] Potwierdź czerwony test. Utwórz players z version, znacznikami czasu i nickname_key; player_avatars ma PK/FK player_id, bytes BYTEA, mime_type, updated_at. UNIQUE na nickname_key obejmuje usunięte rekordy. Opracuj jedną normalizację trim + lowercase bez usuwania diakrytyków; funkcja SQL normalize_nickname jest źródłem nickname_key (kolumna generowana normalize_nickname(nickname)). Trim usuwa ten sam zestaw białych znaków co String.trim, także tabulatory i NBSP. Wszystkie serwerowe kontrole zajętości wywołują tę funkcję; UI nie implementuje niezależnego porównania Unicode. Test polskich liter, tabulatorów i NBSP pilnuje zgodności. Nie opieraj unikalności tylko na odczycie przed INSERT.
- [ ] Zaimplementuj soft delete i edycję przez porównanie version pod blokadą. Ponowione usunięcie zwraca sukces bez podbicia wersji, zanim sprawdzisz expectedVersion dla już usuniętego rekordu. W tym zadaniu liczby powiązań wynoszą zero; po utworzeniu relacji w zadaniu 5 queries liczy prawdziwe ligi/mecze.
- [ ] Dodaj walidację i ponowne kodowanie awatara. Body czytaj strumieniowo z limitem; nie polegaj na Content-Length. Postać formularza binarna multipart; sprawdź origin i wersję przed podmianą rekordu.
~~~ts
import sharp from 'sharp';

export async function sanitizeAvatar(bytes: Buffer): Promise<Buffer> {
  if (bytes.length > 5_000_000) throw new DomainError('AVATAR_TOO_LARGE');
  const image = sharp(bytes, { limitInputPixels: 16_000_000, animated: true });
  const meta = await image.metadata();
  if (!['jpeg', 'png', 'webp'].includes(meta.format ?? '') ||
      (meta.pages ?? 1) !== 1) throw new DomainError('INVALID_AVATAR');
  return image.rotate()
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .webp().toBuffer();
}
~~~
Dodaj ograniczenie liczby jednoczesnych dekoderów w procesie i timeout, oprócz współdzielonego limitu uploadów. Błędne dekodowanie mapuj na INVALID_AVATAR. GET zwraca wyłącznie przetworzone image/webp, nosniff, ETag; nigdy surowy upload.
- [ ] Zbuduj polskie strony listy, dodawania i edycji oraz prosty profil, który w zadaniu 11 otrzyma statystyki. Formularz zachowuje dane po błędzie; konflikt wersji pokazuje akcję odświeżenia. Awatar można pominąć. Zapis podstawowych danych i osobny upload mają oddzielne potwierdzenia, aby błąd obrazu nie udawał błędu utworzenia gracza.
- [ ] Testuj duplikat równoległy, trim i puste pola, edycję bez zmiany id, odrzucenie SVG udającego PNG, ponad 5 MB, zbyt dużo pikseli, animację oraz obrazy pionowe/poziome ≤256 px. E2E: dodanie bez awatara, konflikt nicku i potwierdzenie usunięcia klawiaturą.
- [ ] Uruchom players integration/E2E, typecheck, lint. Commit: feat: manage players and avatars.

**Odbiór:** Działający pierwszy fragment produktu, z walidacją i wersjami na serwerze.

## Task 5: Liga i atomowy terminarz

**Files:** Utwórz pliki src/modules/leagues/ z mapy, src/modules/matches/match.entity.ts, Migration004LeaguesMatches.ts; src/app/leagues/page.tsx, new/page.tsx, [leagueId]/layout.tsx, [leagueId]/page.tsx, [leagueId]/matches/page.tsx, [leagueId]/settings/page.tsx, actions.ts; LeagueForm.tsx; tests/unit/schedule.test.ts, tests/integration/leagues.test.ts; rozszerz players/queries.ts.
**Interfaces:** generateSchedule(sideIds: string[], returnLegs: boolean): Fixture[]; Fixture = {key,round,leg,sideA,sideB}. createLeague(em, Creation<LeagueInput>): Promise<{id,version}>; getLeague(em,id); updateLeague(em,Versioned & {name,eloK?}); deleteLeague(em,Versioned). LeagueInput = {name,kind,mode,playerIds,teams: [Id,Id][],hasReturnLegs: boolean|null,eloK: number|null}.

- [ ] Dodaj test własności terminarza.
~~~ts
test.each([5, 6, 30])('terminarz dla %i stron', n => {
  const ids = Array.from({ length: n }, (_, i) => String(i));
  const fixtures = generateSchedule(ids, true);
  expect(fixtures).toHaveLength(n * (n - 1));
  expect(new Set(fixtures.map(m => m.key)).size).toBe(fixtures.length);
  for (const round of new Set(fixtures.map(m => m.round))) {
    const sides = fixtures.filter(m => m.round === round)
      .flatMap(m => [m.sideA, m.sideB]);
    expect(new Set(sides).size).toBe(sides.length);
  }
});
~~~
- [ ] Potwierdź czerwony test; zaimplementuj metodę kołową: sortowanie stabilnych identyfikatorów, dopisanie null dla nieparzystej liczby, nieruchomy pierwszy element, obrót reszty, parowanie początku z końcem, pomijanie null. Drugą serię zbuduj przez odwrócenie stron i przesunięcie numerów kolejek. fixtureKey = uporządkowane id stron + numer leg.
~~~ts
const ring: (string | null)[] = [...sideIds].sort();
if (ring.length % 2) ring.push(null);
for (let round = 1; round < ring.length; round++) {
  for (let i = 0; i < ring.length / 2; i++) {
    const a = ring[i], b = ring[ring.length - 1 - i];
    if (a !== null && b !== null) {
      fixtures.push({ key: [a, b].sort().join(':') + ':1',
        round, leg: 1, sideA: a, sideB: b });
    }
  }
  ring.splice(1, 0, ring.pop()!);
}
~~~
- [ ] Dodaj relacyjne encje i migrację. leagues: sport_id, kind, game_mode, name, has_return_legs/elo_k zależne od rodzaju, status ACTIVE/COMPLETED, version, timestamps. league_players: UNIQUE(league_id,player_id) bez filtra deleted_at. league_teams: id, league_id, display_name; league_team_players: team_id, league_id, player_id, position.
- [ ] W migracji uwzględnij spójne klucze złożone: UNIQUE(id,league_id) w matches i league_teams; match_sides(id,match_id,league_id,side_number,team_id nullable) z FK(match_id,league_id) i opcjonalnym FK(team_id,league_id); match_side_players(side_id,match_id,league_id,player_id,position) z FK(side_id,match_id,league_id) i FK(league_id,player_id). UNIQUE(match_id,player_id) blokuje powtórkę po obu stronach. UNIQUE(league_id,player_id) w league_team_players blokuje dwie stałe pary. UNIQUE(league_id,fixture_key), bez zwalniania przez soft delete.
- [ ] Transakcja once tworzy ligę, członków, pełne pary i mecze PENDING. Przed zapisem blokuje graczy i sprawdza aktywność, minima, rozmiary par, brak duplikatów i limit 5 000 meczów. Klasyczna para jest jawnym team_id w stronie. Elo tworzy ligę bez meczów; jej rozszerzenie ratingowe dopiero w zadaniu 8.
- [ ] Dodaj test atomowości: wstrzyknij błąd po pierwszym INSERT meczu; liczba nowych lig, członkostw i spotkań po rollback = 0. Dodaj powtórzenie tokenu, bezpośrednią próbę zmiany rodzaju/trybu/par/rewanzów, gracza w dwóch parach i gracza obcej ligi w meczu. Publicznego polecenia osobnego generowania terminarza ani ustawiania uczestników klasycznych nie udostępniaj.
- [ ] Zbuduj LeagueForm: konfiguracja → podsumowanie z liczbą meczów i ostrzeżeniem o niezmienności → zatwierdzenie z tokenem. Cofnięcie zachowuje dane lokalnie. Debel Elo pozwala wybrać 5 graczy. Dodaj listę lig z rodzajem, trybem, filtrem i statusami; ustawienia nazwy/usunięcia.
- [ ] Usunięcie ligi blokuje jej wiersz i zachowuje dane. Wszystkie queries na lidze filtrują deleted_at; późniejsze mutacje przechodzą przez getVisibleLeagueForUpdate(em: EntityManager, leagueId: Id): Promise<League>, zdefiniowane w leagues/queries.ts. Rozszerz liczby powiązań gracza przed potwierdzeniem usunięcia.
- [ ] Uruchom schedule/leagues, typecheck i E2E tworzenia obu trybów klasycznych. Commit: feat: create leagues and classic fixtures.

**Odbiór:** 6 singlistów daje 15 lub 30 meczów; 30 z rewanżami daje 870; minimum uczestników i brak podwójnego występu są egzekwowane.

## Task 6: Klasyczny wynik, historia i tabela

**Files:** Utwórz src/modules/tennis/score.entity.ts, src/modules/matches/revision.entity.ts, commands.ts, queries.ts, src/modules/standings/calculate.ts, Migration005Scores.ts; ScoreForm.tsx, Classification.tsx; src/app/leagues/[leagueId]/table/page.tsx, add-result/page.tsx, matches/[matchId]/page.tsx, matches/[matchId]/edit/page.tsx, src/app/matches/actions.ts; tests/unit/standings.test.ts, tests/integration/classic-results.test.ts, tests/e2e/classic.spec.ts.
**Interfaces:** recordClassicResult(em, Versioned & {score: TennisScore}); correctClassicResult(em, Versioned & {score: TennisScore}); getMatch(em,leagueId,matchId); classicStandings(entries: {id,label}[], results: {sideA,sideB,projection:TennisProjection}[]): Standing[]. Standing = {id,label,place,played,won,lost,points,setsFor,setsAgainst,gamesFor,gamesAgainst}.

- [ ] Dodaj test tabeli z wynikiem 2:1 i STB; następnie test pełnego remisu 1,1,3.
~~~ts
test('2:1 daje 4/2, a STB nie dodaje gemów', () => {
  const rows = classicStandings(
    [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }],
    [{ sideA: 'a', sideB: 'b', projection: {
      winner: 'A', setsA: 2, setsB: 1, gamesA: 10, gamesB: 10,
      superTieBreaksA: 1, superTieBreaksB: 0
    } }]
  );
  expect(rows.map(r => [r.points, r.gamesFor, r.gamesAgainst]))
    .toEqual([[4,10,10],[2,10,10]]);
});
~~~
- [ ] Uruchom czerwone testy. Dodaj tennis_match_rules 1:1 i tennis_sets z CHECK kolejności, rodzaju i nieujemnych wyników oraz UNIQUE(match_id,set_order). Format seta jest wyprowadzany z rules, nie osobnym edytowalnym polem. MatchRevision ma UNIQUE(match_id,version), changed_at, komplet stron/formatów/setów/deletedAt w typowanym JSONB oraz powiązanie z meczem.
- [ ] Implementuj transakcję: blokada ligi, następnie meczu; sprawdzenie leagueId i version; walidacja wyniku; zapis setów i reguł; pierwsze result_recorded_at, podniesienie result_version; dopisanie niezmiennej rewizji; ustawienie ligi COMPLETED jeśli brak PENDING. Usunięci gracze wcześniej zaplanowanego meczu są dozwoleni. Korekta zachowuje strony, czas pierwszego zapisu i tworzy kolejną rewizję.
~~~sql
UPDATE matches
SET status = 'COMPLETED', result_version = result_version + 1,
    result_recorded_at = COALESCE(result_recorded_at, clock_timestamp()),
    updated_at = clock_timestamp()
WHERE id = ? AND league_id = ? AND result_version = ?
RETURNING result_version, result_recorded_at;
~~~
To fragment po blokadzie i walidacji; brak wiersza oznacza konflikt. Zapis rewizji, setów i statusu ligi jest częścią tej samej transakcji.
- [ ] Kalkulator sumuje wyniki dla wszystkich uczestników, także bez meczów. Sortuj malejąco po [points,setsDiff,gamesDiff]; remis wyznacza miejsce poprzedniego, kolejny różny wpis dostaje index+1. Nazwa i id zapewniają tylko porządek prezentacji.
- [ ] Zbuduj ScoreForm z polami numerycznymi i etykietami, wyborem wspólnego otwarcia; trzeci set pojawia się dopiero po poprawnych pierwszych setach dających 1:1. Po zmianie na 2:0 usuń trzeci z payloadu. Nie ma daty ani wyboru winner. W klasycznej lidze add-result wybiera istniejący fixture, z kolejką i rewanżem; strony w edycji są tylko do odczytu.
- [ ] Server Actions mapują błędy na pola i rewalidują ligę, listy i profile stron. Tabela używa aktualnych wyników bez cache niezgodnego z mutacjami. Dodaj szczegóły meczu z wynikami setów, sumą gemów, kolejką i „Wynik zapisano”.
- [ ] Testuj dwie edycje tej samej wersji: jeden sukces, jeden konflikt; wcześniejszy wynik/revision nie znika. Testuj próby usunięcia/wyczyszczenia przez bezpośrednią akcję, zapis z przyszłej kolejki, korektę po COMPLETED, zachowanie historii usuniętego gracza i błąd podczas zapisu trzeciego seta.
- [ ] E2E obejmuje pełną ligę dwóch graczy i klasyczny debel, obie punktacje, STB, zakończenie oraz mobilną edycję. Uruchom unit/integration tego zadania, classic.spec.ts, typecheck, lint. Commit: feat: record classic results and standings.

**Odbiór etapu A:** Gracze i klasyczne ligi są używalne; pełna historia wersji i ochrona współbieżności już istnieją.

## Task 7: Wspólny kalkulator Elo

**Files:** Utwórz src/modules/elo/types.ts, calculate.ts, replay.ts; tests/unit/elo.test.ts, replay.test.ts.
**Interfaces:** calculateElo(sides: Sides, ratings: ReadonlyMap<Id,number>, winner: Side, k: number): Delta[]; replayElo(memberIds: Id[], matches: ReplayMatch[]): ReplayOutput.
Delta = {playerId,before,expected,actual,k,calculatedDelta,appliedDelta,after}.
ReplayMatch = {id,version,resultRecordedAt: string,sides,winner,k}.
ReplayOutput = {ratings: Map<Id,number>, events: (Delta & {matchId,matchVersion})[], played: Map<Id,number>, lastDelta: Map<Id,number|null>}.

- [ ] Dodaj test równych ratingów i połówki przy K=31.
~~~ts
test('połówki zaokrąglają się od zera', () => {
  const result = calculateElo([['a'],['b']], new Map([['a',1000],['b',1000]]), 'A', 31);
  expect(result.map(r => r.calculatedDelta)).toEqual([16,-16]);
});
test('partnerzy mają różne faktyczne straty przy minimum', () => {
  const ratings = new Map([['a',505],['b',1000],['c',752],['d',753]]);
  const result = calculateElo([['a','b'],['c','d']], ratings, 'B', 32);
  expect(result.slice(0,2).map(r => r.calculatedDelta)).toEqual([-16,-16]);
  expect(result.slice(0,2).map(r => r.appliedDelta)).toEqual([-5,-16]);
});
~~~
- [ ] Uruchom testy czerwone. Zaimplementuj wzór, bez aktualizowania ratingu pierwszego partnera przed policzeniem średniej wszystkich stron.
~~~ts
export const roundAway = (x: number) =>
  x === 0 ? 0 : Math.sign(x) * Math.floor(Math.abs(x) + 0.5);

const expectedA = 1 / (1 + 10 ** ((meanB - meanA) / 400));
const deltaA = roundAway(k * ((winner === 'A' ? 1 : 0) - expectedA));
const deltaB = -deltaA;
// Dla każdego gracza: after = Math.max(500, before + deltaSide).
// appliedDelta = after - before; calculatedDelta = deltaSide.
~~~
- [ ] replayElo inicjalizuje WSZYSTKICH członków od 1000, niezależnie od joinedAt i globalnego usunięcia. Sortuje kopię meczów po resultRecordedAt i id, wywołuje calculateElo, aktualizuje maps. Dane wejściowe zawierają wyłącznie ukończone, nieusunięte mecze; filtracja w snapshot workera.
- [ ] Testuj singiel/debel, K=10/60, odrzucenie 9/61/ułamków, rating 500, rozstrzygnięcie bez wpływu liczby setów, reset po korekcie najstarszego meczu, nowego członka podmienionego do starszego spotkania, niegrającego członka na 1000, stabilny wynik po odwróceniu kolejności niesortowanego wejścia.
- [ ] Uruchom elo/replay i typecheck. Commit: feat: calculate and replay Elo ratings.

**Odbiór:** Append i worker mogą korzystać z jednego kalkulatora; żadna funkcja nie dotyka bazy.


## Task 8: Publikacje Elo i zapis nowego meczu

**Files:** Utwórz src/modules/elo/publication.entity.ts, job.entity.ts, append.ts, queue.ts, queries.ts, Migration006Elo.ts, tests/integration/elo-append.test.ts; rozszerz leagues/commands.ts, matches/commands.ts, LeagueForm.tsx, ScoreForm.tsx i app/matches/actions.ts.
**Interfaces:** createEloMatch(em,Creation<{leagueId:Id,sides:Sides,score:TennisScore}>): Promise<{id,version}>; joinEloLeague(em,Creation<{leagueId:Id,playerId:Id}>); getEloRanking(em,leagueId): Promise<RankingDto>; enqueueLatest(em,leagueId,revision): Promise<void>. Rewizje BIGINT odczytywane jako string i porównywane jako bigint; DTO serializuje string, nigdy number z utratą precyzji.

**Model publikacji:** leagues otrzymuje input_revision BIGINT, published_revision BIGINT, published_publication_id UUID nullable, elo_state CURRENT/RECALCULATING/FAILED, last_result_recorded_at timestamptz. elo_publications(id,league_id,revision,created_at), elo_ratings(publication_id,player_id,rating,played,last_delta), elo_rating_events(publication_id,match_id,match_version,player_id,rating_before,expected_score,actual_score,k_factor,calculated_delta,applied_delta,rating_after). UNIQUE(publication_id,player_id) i UNIQUE(publication_id,match_id,player_id), FK(match_id,match_version) → match_revisions(match_id,version).

Każda publikacja jest kompletnym, niezmiennym snapshotem. Append kopiuje poprzednie pochodne ratingi/zdarzenia do nowego publication_id i dopisuje mecz w tej samej transakcji. Przy kilkuset meczach to prosty mechanizm o mierzalnym koszcie; pomiar w zadaniu 13 obejmuje koszt kopiowania, nie tylko wzór Elo. Starsze publikacje można technicznie usuwać po okresie retencji, ale wyniki i MatchRevision nigdy nie są takim cache. W MVP zachowaj ostatnie 2 publikacje oraz bieżącą, z czyszczeniem po publikacji, pod blokadą ligi; odczyt wielozapytaniowy używa REPEATABLE READ. Nie kasuj publikacji wskazywanej przez ligę.

- [ ] Rozszerz testowe fixtures.ts o makeEloLeague(em,mode='SINGLES',count=2): Promise<{leagueId,playerIds}>; helper tworzy graczy i ligę przez prawdziwe commands z nowymi tokenami. Dodaj test:
~~~ts
test('dwa równoczesne mecze odtwarzają się identycznie', async () => {
  await withTestDb(async em => {
    const { leagueId, playerIds: [a,b] } = await makeEloLeague(em);
    const score: TennisScore = {
      openingSetFormat:'FAST4', decidingSetFormat:null,
      sets:[{order:1,kind:'GAME_SET',sideA:4,sideB:0},
            {order:2,kind:'GAME_SET',sideA:4,sideB:0}]
    };
    await Promise.all([0,1].map(() => createEloMatch(em.fork(), {
      token:crypto.randomUUID(), data:{leagueId,sides:[[a],[b]],score}
    })));
    const ranking = await getEloRanking(em.fork(), leagueId);
    expect(ranking.rows.map(r => r.rating).sort()).toEqual([969,1031]);
    expect(ranking.inputRevision).toBe(ranking.publishedRevision);
  });
});
~~~
RankingDto = {inputRevision:string,publishedRevision:string,state,rows: {playerId,label,deleted,place,rating,played,lastDelta}[]}. Równoczesny test uruchom także z wymuszonym jednakowym odczytem zegara i porównaj pełne replayElo z odczytanych wyników/wersji/K.
- [ ] Uruchom czerwony test; utwórz migrację publikacji oraz jobów z zadania 9. Przy tworzeniu ligi Elo od razu utwórz kompletną publikację zerową wszystkich członków (1000, 0 meczów, last_delta null). rating nie jest wspólny między ligami.
- [ ] Implementuj append: once, transakcja, league FOR UPDATE, uczestnicy FOR SHARE w stałym porządku, walidacja liczności/przynależności/soft delete. Nadanie czasu przez bazę po uzyskaniu blokady:
~~~sql
UPDATE leagues
SET last_result_recorded_at = GREATEST(
      clock_timestamp(),
      COALESCE(last_result_recorded_at + interval '1 millisecond',
               clock_timestamp())
    ),
    input_revision = input_revision + 1
WHERE id = ?
RETURNING last_result_recorded_at, input_revision, elo_k;
~~~
Nie używaj now() z początku transakcji. Milisekunda zachowuje kolejność także w JS Date. Pole nie cofa się po usunięciu spotkania ani korekcie. Odczyt clock_timestamp w testach zastąp kontrolowanym zegarem przez parametr serwisu testowego, bez publicznego przyjmowania czasu.
- [ ] Zapisz mecz, strony, sety, MatchRevision v1 i snapshot K. Jeśli wcześniejsze input/published były zgodne i state CURRENT, użyj calculateElo, zbuduj nową publikację, podmień wskazanie ligi i published_revision. Jeśli nie: pozostaw poprzednią publikację, ustaw RECALCULATING i enqueueLatest w tej samej transakcji. Potwierdź zapis od razu.
- [ ] joinEloLeague blokuje ligę i gracza, sprawdza UNIQUE członkostwa. Zwiększa input_revision. Przy CURRENT publikuje kopię rankingu plus nowy gracz na 1000 bez replay historii; podczas przeliczenia członek jest dostępny w formularzu, ale nie dopisuj go do starego snapshotu rankingu. enqueueLatest bierze nową rewizję.
- [ ] Zmiana K blokuje tę samą ligę, sprawdza version i dozwolony zakres, nie podbija rewizji wejścia ani nie tworzy joba (wcześniejsze mecze mają K). Następny nowy mecz pobiera nową wartość; korekta zachowuje stary snapshot.
- [ ] Testuj: token duplikatu i nowy token tych samych stron, dwa ratingi atomowo i cztery w deblu, równoległą zmianę K, dodanie członka przy CURRENT/RECALCULATING/FAILED, rollback po zapisaniu części publikacji, usunięcie gracza równocześnie z dodaniem meczu, usunięcie ligi równocześnie z mutacją.
- [ ] UI dodawania Elo korzysta ze wspólnego ScoreForm i wyboru 2 lub 4 różnych aktywnych członków. W ustawieniach dodawanie członka i K. Testy Elo append, typecheck, lint; commit: feat: append Elo matches atomically.

**Odbiór:** Nowe mecze aktualizują bieżący ranking tylko kiedy można to zrobić poprawnie; nie blokują użytkownika podczas replay.

## Task 9: Korekty, kolejka i odporny worker

**Files:** Utwórz src/workers/elo/claim.ts, snapshot.ts, publish.ts, run-once.ts, main.ts, health.ts, tsconfig.worker.json; tests/integration/elo-worker.test.ts, elo-races.test.ts; rozszerz matches/commands.ts, elo/queue.ts i job.entity.ts.
**Interfaces:** correctEloMatch(em, Versioned & {leagueId,sides,score}); deleteEloMatch(em, Versioned & {leagueId}); claimJob(em): Promise<Claim|null>; readSnapshot(em,Claim): Promise<Snapshot|null>; publishReplay(em,Claim,Snapshot,ReplayOutput): Promise<'PUBLISHED'|'OBSOLETE'|'LOST'|'DELETED'>; runOnce(): Promise<boolean>.
Claim = {jobId,leagueId,claimToken,requestedRevision:string}. Snapshot = {leagueId,revision:string,memberIds, matches:ReplayMatch[]}. Lease musi być ponownie sprawdzony przy każdej mutacji joba.

- [ ] Zdefiniuj w tests/support/barrier.ts funkcję barrier(): { reached:Promise<void>, release():void, wait():Promise<void> }. wait sygnalizuje reached i czeka na release. Punkty zatrzymania przy snapshot/publikacji dostępne wyłącznie w konstrukcji workera testowego; nie w publicznym HTTP.
- [ ] Dodaj test nieaktualnego obliczenia:
~~~ts
test('worker nie publikuje snapshotu sprzed nowego członka', async () => {
  await withTestDb(async em => {
    const { leagueId } = await makeEloLeague(em);
    await enqueueLatest(em, leagueId, '0');
    const claim = (await claimJob(em))!;
    const snapshot = (await readSnapshot(em, claim))!;
    const p = await createPlayer(em, {token:crypto.randomUUID(),
      data:{firstName:'Ewa',lastName:'Nowak',nickname:'ewa'}});
    await joinEloLeague(em, {token:crypto.randomUUID(),
      data:{leagueId,playerId:p.id}});
    const computed = replayElo(snapshot.memberIds, snapshot.matches);
    expect(await publishReplay(em,claim,snapshot,computed)).toBe('OBSOLETE');
    expect((await getEloRanking(em,leagueId)).publishedRevision)
      .not.toBe((await getEloRanking(em,leagueId)).inputRevision);
  });
});
~~~
enqueueLatest jako publicznie niewidoczny helper tego testu musi ustawić RECALCULATING zgodnie ze swym kontraktem. Alternatywnie uruchom przypadek przez korektę zapisanego meczu, aby objąć cały przepływ.
- [ ] Potwierdź czerwony test. Job: id, league_id, requested_revision BIGINT, status PENDING/RUNNING/DONE/FAILED/CANCELLED, attempts, claim_token UUID, lease_until, available_at, started_at, finished_at, last_error_code, timestamps. Częściowy UNIQUE(league_id) WHERE status IN ('PENDING','RUNNING').
- [ ] enqueueLatest pod blokadą ligi tworzy PENDING albo aktualizuje requested_revision istniejącego joba, nie unieważniając trwającego lease. Nowa rewizja zeruje budżet błędów dla nowego wejścia; odrzucenie nieaktualnego snapshotu nie jest błędem zużywającym retry. FAILED pozostaje śladem, nowa mutacja tworzy nowy aktywny job.
- [ ] Korekta blokuje ligę, dotychczasowy i nowy zestaw graczy po id, mecz. Dozwolone: nowe aktywne osoby z bieżących członków, również dołączone później; dotychczasowy usunięty gracz może pozostać. Niedozwolone: nowo wskazany usunięty gracz. Porównuj zbiory po id, nie indeks pola formularza. Zachowaj czas/K, zwiększ wersję, dopisz pełną MatchRevision, input_revision i job w tej samej transakcji.
- [ ] Soft delete Elo tworzy rewizję z deletedAt i job. Powtórzone usunięcie nie zwiększa rewizji ani nie zleca ponownie. Serwer odrzuca analogiczną operację dla CLASSIC; nie ma publicznego endpointu restore.
- [ ] claimJob w krótkiej transakcji wybiera PENDING gotowy czasowo albo RUNNING z wygasłym lease:
~~~sql
SELECT id
FROM elo_recalculation_jobs
WHERE (status = 'PENDING' AND available_at <= clock_timestamp())
   OR (status = 'RUNNING' AND lease_until < clock_timestamp())
ORDER BY available_at, id
FOR UPDATE SKIP LOCKED
LIMIT 1;
~~~
Ustaw nowy claim_token, status RUNNING, lease_until = clock_timestamp()+30 s i attempts+1. Transakcja claim nie blokuje ligi; kończy się przed snapshotem. Heartbeat ma warunek token+status+lease jeszcze ważny; utraconego lease nie wolno wskrzesić.
- [ ] readSnapshot używa krótkiej transakcji REPEATABLE READ: widoczna liga, rewizja, wszystkie członkostwa bez filtrowania gracza, bieżące wersje ukończonych nieusuniętych meczów uporządkowane po resultRecordedAt,id. Skopiuj DTO i zakończ transakcję przed liczeniem. Jeśli liga usunięta, job kończy CANCELLED.
- [ ] Oblicz replayElo poza blokadą. Publikacja blokuje ligę, potem job, sprawdza claim_token, lease, status, deleted_at oraz zgodność input_revision. Przy zmianie wejścia nie zapisuje rankingu, zwalnia job jako PENDING najnowszej rewizji. Przy zgodności INSERT nowej kompletnej publikacji + ratingi + zdarzenia, podmiana pointera i published_revision oraz DONE są jedną transakcją.
- [ ] Błąd: rollback publikacji; warunkowo po tokenie i lease aktualizuj attempts/available_at/error. Po 5 próbach FAILED i elo_state FAILED z pozostawieniem poprzedniej publikacji. Jeżeli w międzyczasie changed requested_revision, nie oznaczaj nowego wejścia błędem starego; ustaw ponowne PENDING. Techniczne retry w zadaniu 12 używa tej samej koordynacji.
- [ ] Dodaj main: pętla z graceful shutdown SIGTERM/SIGINT, odnowienie lease, logi JSON (jobId, leagueId, revision, claimToken skrócony, attempts, durationMs, code), health świeżości heartbeat procesu w pliku /tmp/elo-worker-health. Długi replay porcjuj i oddawaj event loop, żeby heartbeat miał czas działać.
- [ ] Testuj deterministycznie przez bariery: nowy mecz/członek/korekta/usunięcie podczas obliczeń; dwóch workerów claim; wygasły lease i powrót starego wykonawcy; awaria po wstawieniu połowy ratingów; rollback; 5 błędów; retry; usunięta liga; korekta uczestnika dołączonego później; niezmienna historia MatchRevision po replay; wyniki po równoległym append zgodne z pełnym replay.
- [ ] Uruchom elo-worker/elo-races, typecheck, build z osobnym tsconfig.worker.json (emit Node ESM do dist/, rootDir '.', output dist/src/ i dist/scripts/, module/moduleResolution NodeNext, package.json type=module, jawne importy .js w kodzie runtime, bez aliasów nierozwiązywanych przez Node; include src/db, src/modules, src/shared, src/workers oraz scripts/recover.ts, exclude app/components/tests). Commit: feat: replay Elo with recoverable jobs.

**Odbiór:** Awaria ani nowa mutacja nie ujawniają częściowej lub przestarzałej publikacji jako aktualnej.

## Task 10: Ranking i czytelny stan obliczeń

**Files:** Utwórz src/app/leagues/[leagueId]/ranking/page.tsx, src/app/api/leagues/[leagueId]/elo-status/route.ts, src/components/EloStatus.tsx; rozszerz Classification.tsx, mecze/queries.ts, elo/queries.ts, strony meczu, listy lig i formularz korekty; tests/integration/elo-queries.test.ts, tests/e2e/elo.spec.ts.
**Interfaces:** GET elo-status → {inputRevision,publishedRevision,state}, Cache-Control: no-store; getEloRanking zwraca jeden kompletny snapshot; getMatch zawiera calculationStatus CURRENT/STALE/PENDING, calculationMatchVersion i zdarzenia odniesione do użytej wersji.

- [ ] Dodaj test niezgodności wyniku i zdarzenia:
~~~ts
test('zmiana składu oznacza poprzednie Elo jako nieaktualne', async () => {
  await withTestDb(async em => {
    const { leagueId, playerIds:[a,b,c] } = await makeEloLeague(em,'SINGLES',3);
    const score: TennisScore = {
      openingSetFormat:'FAST4',decidingSetFormat:null,
      sets:[{order:1,kind:'GAME_SET',sideA:4,sideB:1},
            {order:2,kind:'GAME_SET',sideA:4,sideB:2}]
    };
    const m = await createEloMatch(em,{token:crypto.randomUUID(),
      data:{leagueId,sides:[[a],[b]],score}});
    await correctEloMatch(em,{id:m.id,expectedVersion:m.version,
      leagueId,sides:[[a],[c]],score});
    const dto = await getMatch(em,leagueId,m.id);
    expect(dto.calculationStatus).toBe('STALE');
    expect(dto.calculationMatchVersion).toBe(m.version);
  });
});
~~~
- [ ] Uruchom czerwony test; queries w REPEATABLE READ pobierają pointer publikacji, ratingi i zdarzenia tej samej publikacji. Aktualność wymaga CURRENT i równych rewizji; stary event jest STALE także gdy jego wersja meczu pasuje, ale wcześniejszy mecz zmienił wejście. Brak eventów dla nowego meczu = PENDING.
- [ ] Ranking pokazuje miejsce, pseudonim, rating, played i lastDelta z publikacji; nazwę i znacznik usunięcia z bieżącego gracza. Remisy 1,1,3; porządek pseudonim i id. Nowy członek dołącza do rankingu po publikacji, wcześniej jest w selektorze.
- [ ] EloStatus odczytuje endpoint okresowo, tylko w widocznej karcie; po zmianie publishedRevision/state wywołuje router.refresh(). Obsłuż AbortController, cleanup, błędy sieci i brak nakładających się żądań. Odświeżenie musi działać po pracy workera bez żadnej Server Action użytkownika.
~~~tsx
<p role="status" aria-live="polite">
  {state === 'CURRENT' ? 'Ranking aktualny' :
   state === 'FAILED' ? 'Nie udało się przeliczyć rankingu. Pokazujemy ostatni kompletny ranking.' :
   'Trwa przeliczanie. Pokazujemy ostatni kompletny ranking.'}
</p>
~~~
- [ ] Korekta pokazuje stare/nowe strony, format i sety przed zatwierdzeniem, oraz komunikat o przeliczeniu. Gdy event dotyczy starego składu, ukryj liczby przy nowym składzie; pokaż informację, której wersji dotyczy poprzednie obliczenie. Wynik bieżący widoczny od razu.
- [ ] E2E: singiel i debel Elo, korekta najstarszego meczu, oczekiwanie na worker, FAILED i zapis w FAILED, odzyskanie, usunięcie meczu po potwierdzeniu. Test polling oparty na zmianie DOM i kontrolowanym workerze, bez stałego sleep.
- [ ] Uruchom elo-queries/elo.spec, typecheck, lint. Commit: feat: show consistent Elo rankings and status.

**Odbiór:** UI rozróżnia dane meczu i stan obliczeń, nie miesza rewizji i nie wymaga ręcznego przeładowania po workerze.


## Task 11: Profile, statystyki i pełna nawigacja

**Files:** Utwórz src/modules/statistics/player.ts, league.ts, queries.ts, src/components/Pagination.tsx; rozbuduj src/app/page.tsx, players/[playerId]/page.tsx, leagues/[leagueId]/page.tsx, listy graczy/lig/meczów, globals.css, error.tsx, not-found.tsx; tests/unit/statistics.test.ts, tests/integration/visibility.test.ts, tests/e2e/navigation.spec.ts.
**Interfaces:** playerStatistics(playerId:Id,matches: {sides:Sides,projection:TennisProjection}[]): PlayerStats; getPlayerStatistics(em,{playerId,mode,leagueId?}); getLeagueOverview(em,leagueId); listLeagueMatches(em,{leagueId,cursor?,status?,round?}). PlayerStats = {played,won,lost,winPercentage:number|null,setsFor,setsAgainst,setsDiff,gamesFor,gamesAgainst,gamesDiff,superTieBreaksPlayed,superTieBreaksWon,superTieBreaksLost,superTieBreaksDiff}.

- [ ] Dodaj test pełnego wyniku strony dla obu partnerów.
~~~ts
test('każdy partner dostaje cały wynik strony', () => {
  const match = {sides:[['a','b'],['c','d']] as Sides, projection:{
    winner:'A' as const,setsA:2,setsB:1,gamesA:10,gamesB:10,
    superTieBreaksA:1,superTieBreaksB:0
  }};
  expect(playerStatistics('a',[match])).toEqual(playerStatistics('b',[match]));
  expect(playerStatistics('a',[match])).toMatchObject({
    played:1,won:1,setsFor:2,gamesFor:10,superTieBreaksWon:1
  });
  expect(playerStatistics('e',[]).winPercentage).toBeNull();
});
~~~
- [ ] Uruchom czerwony test. Agreguj per mecz i strona, nie per wiersz join set × gracz. W widoku ligi licz COUNT(DISTINCT match.id), a gemy/sety przez projekcję meczu. Nie sumuj ratingów między ligami.
- [ ] Każdy odczyt historii i statystyk wymaga league.deleted_at IS NULL; dodatkowo mecz ukończony i nieusunięty. Historyczne joiny players nie filtrują deleted_at. Profil usuniętego gracza pod bezpośrednim adresem pokazuje oznaczenie i zachowaną historię; globalna lista go ukrywa.
- [ ] Profile mają osobne zakładki Singiel/Debel, filtr ligi, historię, statystyki i osobne ratingi poszczególnych lig. Puste dane pokazują „Brak rozegranych meczów”, procent jako „—”, nie 0%.
- [ ] Strona główna: aktywne ligi, ostatnie wyniki, linki do graczy i lig, przyciski dodania gracza/ligi. Szczegóły ligi: właściwy typ klasyfikacji, liczby spotkań, zakończone/pozostałe i procent dla klasycznej. Bez pustej zakładki rankingu/tabeli niewłaściwego rodzaju.
- [ ] Dodaj stronicowanie stabilnym kursorem (czas,id), filtry rodzaju/statusu ligi i kolejki/statusu meczu; wyszukiwanie graczy po pseudonimie i nazwisku. Zapytania mają jawne indeksy; nie pobieraj osobno meczu dla każdego gracza.
- [ ] Sprawdź usunięcie ligi w każdym punkcie: home, players list counts, profil i filtr lig, historia, statystyki, direct URL ligi/meczu, ranking/status endpoint i stary formularz. Awatar globalnego gracza nie zależy od ligi. Dla usuniętych zasobów ligi zwracaj jednolity NOT_FOUND.
- [ ] Dostępność: semantyczne nagłówki/tabele, widoczny focus, label i aria-describedby dla błędów, przyciski klawiaturą, dialog z przywróceniem focus, tabele jako karty na małym ekranie. Daty przez Intl.DateTimeFormat('pl-PL',{timeZone:'Europe/Warsaw',dateStyle:'short',timeStyle:'short'}).
- [ ] Uruchom statistics/visibility/navigation, typecheck, lint. Commit: feat: add player statistics and application navigation.

**Odbiór etapu B:** Wszystkie ekrany z mapy projektu działają dla obu rodzajów lig i trybów gry.

## Task 12: Kontenery i techniczne odzyskiwanie

**Files:** Utwórz Dockerfile, .dockerignore, compose.yaml, compose.external.yaml, scripts/recover.ts, docs/operations.md; rozszerz .env.example, package.json; tests/integration/recovery.test.ts; dodaj scripts/container-smoke.mjs.
**Interfaces:** Obraz uruchamia node_modules/.bin/next start, node dist/src/workers/elo/main.js i node dist/src/db/migrate.js. CLI recovery przyjmuje jawny tryb, identyfikator i expectedVersion; bez publicznego HTTP. Wszystkie pliki runtime kompilowane do dist z jednej konfiguracji worker/tools.

- [ ] Dodaj test przywrócenia meczu Elo i nowej rewizji obliczeń, test korekty według starej MatchRevision oraz przywrócenia ligi bez regeneracji terminarza. recovery używa istniejących serwisów, nie edytuje ratingów ręcznie.
~~~ts
test('przywrócenie Elo zleca nowe obliczenie', async () => {
  await withTestDb(async em => {
    const {leagueId,playerIds:[a,b]} = await makeEloLeague(em);
    const score: TennisScore = {openingSetFormat:'FAST4',decidingSetFormat:null,
      sets:[{order:1,kind:'GAME_SET',sideA:4,sideB:0},
            {order:2,kind:'GAME_SET',sideA:4,sideB:0}]};
    const m = await createEloMatch(em,{token:crypto.randomUUID(),
      data:{leagueId,sides:[[a],[b]],score}});
    const deleted = await deleteEloMatch(em,{id:m.id,leagueId,expectedVersion:m.version});
    await restoreMatch(em,{id:m.id,expectedVersion:deleted.version});
    expect((await getEloRanking(em,leagueId)).state).toBe('RECALCULATING');
  });
});
~~~
restoreMatch(em,Versioned), restoreLeague(em,Versioned), restorePlayer(em,Versioned), restoreMatchRevision(em,{id,expectedVersion,sourceVersion}) definiuje scripts/recover.ts jako funkcje importowalne bez uruchamiania CLI. Każda zwraca {id,version}; również deleteEloMatch zwraca taki wynik.
- [ ] Uruchom test czerwony; zaimplementuj restore z blokadami i optimistic concurrency. Nowa wersja meczu zachowuje pierwszy czas/K, odwzorowuje zatwierdzoną historyczną strukturę, nie zmienia niezmiennych stron klasycznych. Przywrócenie gracza zachowuje zarezerwowany nick. Liga Elo dostaje input_revision+1 oraz job; klasyczna zachowuje mecze, pary i status. Powtórzenie operacji nie ma dalszych efektów.
- [ ] Zbuduj wieloetapowy Dockerfile. Dokładny schemat obrazu:
~~~dockerfile
FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
~~~
Utwórz public/.gitkeep przy szkielecie lub usuń COPY jeśli public nie istnieje. Obraz przechowuje zwykły wynik next build z runtime node_modules; nie łączy standalone z inną metodą pakowania. Migrator i zależności wykonywalne CLI recovery pozostają production dependencies. Walidacja konfiguracji połączenia dopiero w runtime; sekretów nie podawać jako ARG do build.
- [ ] .dockerignore: .git, .next, dist, node_modules, .env i .env.*, z wyjątkiem .env.example, coverage, test-results, playwright-report, lokalne backupy. W .gitignore te same wrażliwe i generowane pliki, bez worktrees.
- [ ] Compose: db=postgres:18 z pg_isready i trwałym wolumenem montowanym zgodnie z obrazem PostgreSQL 18; bez ports dla bazy. app i worker mają ten sam image tag; migrate to jednorazowa usługa tego obrazu. depends_on: db service_healthy, migrate service_completed_successfully. app/worker restart unless-stopped; migrate restart no. APP_ORIGIN, DATABASE_URL i wspólna konfiguracja przez env; POSTGRES_PASSWORD wymagany w runtime, nie prawdziwa wartość w pliku.
~~~yaml
# Fragment app; pełny compose definiuje także db, migrate i worker.
app:
  image: low-on-legs:local
  build: .
  command: ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
  env_file: .env
  ports: ["127.0.0.1:3000:3000"]
  depends_on:
    db:
      condition: service_healthy
    migrate:
      condition: service_completed_successfully
  restart: unless-stopped
~~~
Przed produkcją zastąp local identycznym wersjonowanym tagiem wszystkich trzech usług. Health app używa fetch do /api/health; worker sprawdza świeżość /tmp/elo-worker-health, nie tylko istnienie procesu. Budżet bazy uwzględnia oba poole.
- [ ] compose.external.yaml jest samodzielnym alternatywnym plikiem z app, worker i migrate bez usługi db ani jej zależności. Wszystkie łączą się do tej samej zewnętrznej bazy z walidacją TLS zgodną z dostawcą; retry migracji przy chwilowej niedostępności nie może ukrywać błędu SQL. Test konfiguracji można wykonać z osobnym kontenerem PostgreSQL jako bazą „zewnętrzną”, bez zakupów hostingu.
- [ ] W docs/operations.md opisz dwie ścieżki: pełny Compose na serwerze i obraz jako osobne usługi platformy kontenerowej. Instrukcja zawiera wymagane env, generowanie sekretów, budowanie, uruchomienie migracji, health, logi, zatrzymanie app+worker przed aktualizacją schematu, migrację nowej wersji, start zgodnych wersji obu procesów i weryfikację zapisu/korekty. Bez automatycznego cofania migracji i bez migracji przy starcie każdego procesu.
~~~powershell
docker compose build
docker compose up -d db
docker compose run --rm migrate
docker compose up -d app worker
docker compose logs --tail 100 app worker
~~~
- [ ] Dodaj procedurę backup/restore wykonaną wewnątrz kontenera lub przez narzędzia dostawcy, z formatem pg_dump -Fc i pg_restore do osobnej pustej bazy. Na Windows nie przekierowuj binarnego pg_dump przez tekstowy pipeline PowerShell; zapisuj plik wewnątrz kontenera i kopiuj docker cp. Procedura wymaga zatrzymania mutacji na czas finalnego przełączenia i kontroli liczby graczy/lig/meczów/rewizji/awatarów, a następnie replay Elo.
- [ ] Opisz CLI dry-run → explicit apply dla konkretnego id i wersji, retry joba, korektę z rewizji, restore rekordu i całej bazy. To narzędzie operatora na serwerze, bez publicznego ekranu. Dodaj retencję i harmonogram jako decyzje środowiska produkcyjnego do wpisania przez operatora przed uruchomieniem; plan nie wymyśla dostawcy ani RPO/RTO.
- [ ] Test kontenerowy z czystego checkoutu: build, migrate, app health, gracz/liga/mecz, korekta i worker, restart/odtworzenie kontenerów z zachowaniem wolumenu, weryfikacja danych. Nie używać down -v na użytkowej bazie. Zweryfikuj compose config, brak sekretów w warstwach obrazu oraz smoke z bazą zewnętrzną.
- [ ] Uruchom recovery i container smoke. Commit: feat: package application and recovery tools.

**Odbiór:** Zestaw uruchamia się bez lokalnego Node.js. Produkcyjne domena/HTTPS, zaufany proxy, harmonogram/retencja backupów i docelowe RPO/RTO wymagają ustalenia środowiska przed faktycznym wdrożeniem, ale nie blokują wykonania planu aplikacji.

## Task 13: Odbiór MVP i pomiary

**Files:** Utwórz scripts/benchmark.ts, tests/e2e/acceptance.spec.ts, docs/acceptance.md; rozszerz istniejące testy tylko dla luk wykrytych poniższą macierzą. Nie dodawaj drugiego zestawu testów powtarzającego wszystkie unit tests.

- [ ] Przygotuj acceptance E2E na wydzielonej bazie _test: gracze → każda z 4 kombinacji rodzaju/trybu ligi → wynik → klasyfikacja → korekta → soft delete zgodny z rodzajem. Sprawdź przyszłą kolejkę, STB, zakończenie klasycznej i nowego członka Elo.
~~~ts
test('klasyczna liga działa na telefonie i bez wskazywania daty', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/leagues');
  await expect(page.getByRole('link',{name:'Utwórz ligę'})).toBeVisible();
  await page.getByRole('link',{name:'Liga odbiorowa',exact:true}).click();
  await page.getByRole('link',{name:'Wpisz wynik',exact:true}).first().click();
  await expect(page.locator('input[type="date"]')).toHaveCount(0);
  await expect(page.getByLabel('Set 1 — strona A')).toBeVisible();
});
~~~
W tests/support/fixtures.ts dodaj seedAcceptance(em): Promise<{classicLeagueId,eloLeagueId}> tworzący nazwane ligi i graczy przez commands. Setup E2E wykonuje go przed tym testem; nie zależy od danych innego testu.
- [ ] Uzupełnij testy interakcji: błędne dane pozostają w formularzu; oczekiwanie blokuje przycisk; drugi request ten sam token nie dubluje spotkania; konflikt wersji nie nadpisuje; usunięcie potwierdzane z liczbą powiązań; nawigacja klawiaturą i focus wraca z dialogu.
- [ ] Dodaj benchmark tworzący 30 graczy, terminarz z 870 spotkaniami oraz historię 500 meczów Elo przez deterministyczny seed. Sprawdź porównanie append/replay przed pomiarem. Raportuj osobno czas append razem z kopiowaniem publikacji, oczekiwanie joba, snapshot, calculate, publish i pełną latencję widoczną w UI.
~~~ts
const started = performance.now();
const replayed = replayElo(memberIds, matches);
const calculationMs = performance.now() - started;
process.stdout.write(JSON.stringify({
  memberCount: memberIds.length,
  matchCount: matches.length,
  eventCount: replayed.events.length,
  calculationMs
}) + '\n');
~~~
memberIds i matches pobiera readSnapshot z przygotowanej ligi testowej; resztę czasów bierz z logów joba i znacznika wysłania/potwierdzenia request. Powtórz 20 iteracji, podaj medianę i p95, parametry sprzętu/obrazu oraz liczbę zapytań. Wykonaj 20 równoległych zapisów i serię korekt podczas replay, potwierdzając zbieżność.
- [ ] Progi diagnostyczne do pierwszego pomiaru: p95 zwykłej mutacji <1 s, publikacja 500 meczów <10 s od zlecenia na lokalnym zestawie z 2 CPU/2 GiB dla app+worker. Są celami technicznymi, nie gwarancją hostingu; przekroczenie wymaga ustalenia przyczyny i korekty przed akceptacją wydajności. Nie ograniczaj sportowo liczby uczestników w celu ukrycia problemu.
- [ ] Wykonaj pg_dump/pg_restore na osobnej bazie testowej, porównaj liczby i kluczowe wyniki, następnie zapisz nowy mecz i przelicz korektę. Potwierdź awatary, MatchRevision i działanie workera po odtworzeniu. Zapisz dowód w docs/acceptance.md.
- [ ] Uruchom kompletny zestaw kontrolny raz po ostatnich poprawkach:
~~~powershell
npm ci
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
docker compose config --quiet
docker compose -f compose.external.yaml config --quiet
docker compose build
~~~
Testy wymagające bazy muszą korzystać z TEST_DATABASE_URL, E2E z E2E_BASE_URL oraz dedykowanego workera. Brak Docker/Node/przeglądarki zgłoś jako niewykonany check, nie jako PASS.
- [ ] Uzupełnij docs/acceptance.md: commit, środowisko, polecenia, wyniki testów, liczby testów, pomiary, wynik restore drill, znane ograniczenia. Przejrzyj diff i macierz wymagań. Commit: test: verify MVP acceptance and operations.
- [ ] Przekaż aplikację do przeglądu użytkownika z instrukcją uruchomienia. Implementacja kończy się na lokalnie sprawdzonym rezultacie; publikacja zewnętrzna jest osobną czynnością.

**Odbiór etapu C:** Spełnione wymagania MVP, sprawdzone uruchomienie kontenerowe i odtworzenie danych, jawnie opisane warunki wdrożenia produkcyjnego.

## Macierz pokrycia wymagań

| Źródło zatwierdzonego projektu | Zadania | Główny dowód |
|---|---|---|
| §3 zakres, brak kont i modułów poza MVP | 1, 11, 13 | przegląd routingu i E2E |
| §4.1 wymagane pola, pseudonim, awatar | 2, 4 | players.test, upload invalid/oversize |
| §4.2 historyczny usunięty gracz | 4, 6, 8–11 | classic-results, replay, visibility |
| §5.1 minima i niezmienność konfiguracji | 5, 8 | leagues.test, bezpośrednie commands |
| §5.2 terminarz, rewanże, dowolna kolejka | 5–6 | schedule.test, classic.spec |
| §5.2 zakaz delete/clear i automatyczny koniec | 6, 13 | classic-results, acceptance |
| §5.3 członkostwa Elo, snapshot K | 7–9 | elo-append, elo-races |
| §5.4 usunięta liga i worker | 5, 9, 11 | visibility, elo-races |
| §6.1 wszystkie legalne/nielegalne sety | 3, 6 | tennis.test, classic.spec |
| §6.2 korekta stron i późniejszy członek | 9–10 | elo-worker, elo-queries |
| §6.3 pełne wersje niezależne od obliczeń | 6, 9, 12 | MatchRevision + recovery.test |
| §7.1 punkty, bilanse i wspólne miejsca | 6 | standings.test |
| §7.2 ranking, deleted, stan starej publikacji | 8, 10 | elo-queries, elo.spec |
| §7.3 profile/statystyki singla i debla | 11 | statistics.test, navigation |
| §8 architektura, kontekst ORM, rewalidacja | 1, 2, 6, 9–10 | platform, build, polling E2E |
| §9 constraints, klucze złożone, transakcje | 2, 4–6, 8–9 | migrations i testy złych FK |
| §10.1 Elo, rounding, floor, debel | 7 | elo.test |
| §10.2 kolejność, synchronizacja K, append | 8 | równoczesny append = replay |
| §10.3 rewizje, snapshot i publikacja | 8–10 | bariery i atomowość |
| §10.4 lease/retry/idempotency/wersje | 2, 6, 9 | mutacje i utrata lease |
| §11 wszystkie ekrany, dostępność i błędy | 4–6, 10–11, 13 | E2E desktop/mobile/keyboard |
| §12 limity, origin, upload i logi | 2, 4, 9, 12 | limity z dwóch procesów, log review |
| §12 recovery i backup | 12–13 | restore drill |
| §12.1 Docker i zewnętrzna baza | 12–13 | container-smoke + compose.external |
| §13.1–13.4 testy i pomiary | 3–13 | docs/acceptance.md |

Starsza specyfikacja szczegółowa §§27–28 jest checklistą dodatkową, z korektami projektu §2: nie implementować usuwania klasycznych meczów, publikacji szkiców, opuszczania ligi Elo ani filtrowania usuniętych graczy z historycznych rankingów.

## Źródła techniczne sprawdzone podczas planowania

Zalecenia integracyjne dostosowano do wymagań projektu, zamiast przenosić całe przykłady z dokumentacji.

- [Next.js — instalacja App Router](https://nextjs.org/docs/app/getting-started/installation): baza doboru wspieranej wersji Next.js i konfiguracji TypeScript.
- [Node.js — cykl wydań](https://nodejs.org/en/about/previous-releases): Node 24 LTS jako wybrana linia uruchomieniowa.
- [MikroORM — integracja Next.js](https://mikro-orm.io/docs/usage-with-nextjs): jawne encje i nazwy tabel, jawna lista migracji oraz izolacja kontekstu. Przykładowego automatycznego uruchamiania migracji podczas inicjalizacji NIE przenosimy; projekt wymaga oddzielnej usługi migracji.
- [PostgreSQL — SELECT i blokady](https://www.postgresql.org/docs/current/sql-select.html): FOR UPDATE SKIP LOCKED do krótkiego przejmowania jobów.
- [Docker Compose — kolejność i gotowość usług](https://docs.docker.com/compose/how-tos/startup-order/): zależność od gotowej bazy i zakończonej migracji.

## Kontrola planu przed przekazaniem

- Wszystkie sekcje zatwierdzonego projektu mają zadania w macierzy.
- Kontrakty TennisScore, Sides, wersji i publikacji są wspólne dla producentów i konsumentów.
- Zakaz worktrees jest jawny i obowiązuje wykonawcę.
- Testy współbieżności są przy mutacjach i workerze; nie zostały odsunięte wyłącznie na koniec.
- Plan zawiera wartości początkowe limitów i procedurę ich pomiaru.
- Fragmenty SQL/TypeScript pokazują reguły i kontrakty implementacji; testy pozostają do wykonania w trakcie implementacji.
- Na etapie przygotowania planu nie ma wyników testów aplikacji, ponieważ aplikacja jeszcze nie istnieje.


## Doprecyzowania po przeglądzie spójności

### Baza, indeksy i wersje

W migracjach, obok jawnych FK z zadań, dodaj CHECK: sport code TENNIS w seed; league kind/mode/status z dozwolonych enumów; CLASSIC wymaga has_return_legs i elo_k NULL, ELO_INFINITE wymaga has_return_legs NULL i całkowitego elo_k 10–60; side_number IN (1,2); position IN (1,2); set_order BETWEEN 1 AND 3; wyniki całkowite ≥0; rating i rating_after ≥500; result_version ≥0. NOT NULL na wymaganych nazwach, kluczach, członkostwach i licznikach. PENDING ma result_recorded_at NULL, COMPLETED ma nie-NULL. elo_k_snapshot obowiązkowe dla ukończonego Elo, nieobecne dla klasycznej — serwis sprawdza regułę wymagającą odczytu ligi.

Klasyczny fixture startuje z result_version=0; pierwszy wynik tworzy MatchRevision 1. Nowy mecz Elo powstaje z result_version=1 i MatchRevision 1. Player/League startują z version=1. Aktualizacja stanu workera nie zmienia wersji edycji konfiguracji ligi. Commands zapisujące/edytujące/usuwające zwracają Promise<{id:Id,version:number}>. Powtórzone usunięcie zwraca zachowaną wersję.

Indeksy: aktywni players po nickname_key i nazwisku/id, aktywne leagues po kind/status/created_at/id, matches(league_id,status,round_number,id), matches(league_id,result_recorded_at,id) WHERE deleted_at IS NULL AND status='COMPLETED', match_side_players(player_id,match_id), match_revisions(match_id,version), elo_rating_events(publication_id,player_id,match_id), jobs(status,available_at,id), rate_limit_buckets(window_start). Indeksy wynikające z FK/UNIQUE nie zastępują wszystkich indeksów kierunku od gracza do historii.

Błędy SQL UNIQUE/FK mapuj na stabilne błędy domenowe. Zachowaj czasy i snapshot K także przed bezpośrednim payloadem próbującym je zmienić: strict schema odrzuca te pola. Testy constraints wykonują także surowy INSERT, żeby nie weryfikować wyłącznie poprawności serwisu.

### Origin i limity transportu

Server Actions korzystają z kontroli Origin/Host Next.js; konfiguracja allowedOrigins obejmuje tylko rzeczywisty APP_ORIGIN, bez wildcard. Route Handler upload wymaga zgodnego Origin dla mutacji przeglądarkowych i odrzuca cross-site. Reverse proxy egzekwuje limit body, aplikacja ponownie mierzy rozmiar; limit Server Actions jest skonfigurowany na 256 KiB, upload osobno do 6 MiB. Błędy z limitu mają polski komunikat i nie odczytują całego nadmiernego body. Limit wpisów terminarza sprawdź PRZED alokacją listy wszystkich fixtures.

Ponowienie poprawnej już zakończonej operacji z jej tokenem może zwrócić zapamiętany wynik po późniejszym usunięciu zasobu, ale nie przywraca go ani nie ujawnia usuniętej ligi. Kolejny odczyt zasobu nadal egzekwuje NOT_FOUND. Dane tokenów nie są publicznym endpointem odczytu.

### Doprecyzowanie testów i plików

Każdy blok testu jest treścią testu w podanym pliku. Dodaj na początku importy test/expect z vitest (albo test/expect z @playwright/test dla E2E) oraz funkcji modułów wymienionych w Interfaces. Support fixtures tworzy dane wyłącznie przez commands i nowy token dla każdego tworzenia. Helpery nie omijają limitów produkcyjnych przez flagę z żądania; testowy transport ma oddzielną konfigurację application_settings we własnej bazie.

Platforma ma SportSchema zdefiniowane jawnie w src/db/entities.ts; kolejne encje importowane do tego rejestru. Zarejestruj wszystkie sześć migracji w src/db/migrations.ts. Migracje nie importują komponentów ani kodu wymagającego Next.js. scripts/recover.ts ma osobno eksporty funkcji i warunkowy entrypoint CLI, aby import testowy nie uruchamiał operacji.

compose.test.yaml zawiera wyłącznie dedykowaną bazę low_on_legs_test, port hosta 127.0.0.1:55432, healthcheck, jawne lokalne hasło testowe opisane jako nieprodukcyjne; dane w odrębnym wolumenie. Playwright używa własnej bazy testowej, nie schematu równoczesnego Vitest. Każdy projekt przeglądarki ma izolowane dane albo wykonuje scenariusze sekwencyjnie z resetem własnej bazy. Nigdy nie resetuj DATABASE_URL produkcji.

### Publikacja i utrzymanie

Czyszczenie starych pochodnych publikacji wykonuje worker jako ograniczoną czynność utrzymaniową również gdy brak jobów, np. co 60 s; nie wymaga tworzenia sztucznych jobów replay po append. Zachowuje bieżącą i dwie ostatnie poprzednie publikacje, wszystkie MatchRevision i bieżące wyniki. Awaria cleanup nie cofa udanego zapisu meczu. Odzyskanie z pierwotnych danych pozostaje możliwe przez replay.

Przy migracji wdrożenia app i worker są zatrzymane, więc jedna usługa migrate działa przed nową wersją. Przy zwykłym pierwszym compose up jej zakończenie jest zależnością startu. Instrukcja aktualizacji musi jawnie odtworzyć jednorazową usługę migrate dla nowego obrazu, żeby stary kontener zakończony sukcesem nie zastąpił nowej migracji.
