# Checkpoint do wznowienia na innym komputerze

Ten katalog jest zwykle ignorowany przez Git. Ten checkpoint celowo zawiera
wyłącznie tekstowe materiały potrzebne do dalszej pracy: postęp, briefy,
wymagania, raporty i notatki środowiskowe.

## Stan kodu

- Gałąź: `feat/low-on-legs-mvp`.
- Zadania 1–3 są ukończone i przeszły niezależny przegląd.
- Zadanie 4, gracze i awatary, jest **niedokończone**. Kod oraz testy są
  zapisane w commicie checkpointu, ale nie należy oznaczać zadania jako
  ukończonego bez uruchomienia kontroli końcowych i przeglądu.
- Najważniejszy zapis ciągłości: `progress.md`.

## Co przeczytać przed wznowieniem

1. `progress.md`
2. `task-4-brief.md`
3. `task-4-environment-notes.md`
4. `shared-requirements.md`
5. `task-2-report.md` — opisuje kolejność limitów, tokenów i transakcji
6. `task-3-report.md` — opisuje wspólny walidator wyniku tenisowego

## Środowisko na nowym komputerze

- Zainstaluj Node.js zgodny z `.nvmrc`, Git, Docker Desktop i zależności przez
  `npm ci`.
- Uruchom testową bazę z `compose.test.yaml`. Domyślnie używa ona lokalnego
  portu 55432; jeśli jest zajęty, stwórz lokalne nadpisanie portu, nie zmieniaj
  wersjonowanego pliku Compose.
- Ustaw `TEST_DATABASE_URL` na dedykowaną bazę kończącą się na `_test`.
- Dla testów E2E utwórz osobną bazę `_test`, ustaw `E2E_DATABASE_URL`, a potem
  wykonaj `npx playwright install chromium`, jeśli przeglądarka nie jest
  zainstalowana.

Nie przenoś ani nie commituj lokalnych katalogów `pgsql`, `pgdata`, `browsers`,
pobranych archiwów, logów ani plików z hasłami. Są odtwarzalnym środowiskiem,
nie źródłem projektu.
