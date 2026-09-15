# Low On Legs — projekt MVP po uzgodnieniach

**Data:** 2026-09-15

**Status:** sekcje projektu zatwierdzone w rozmowie; dokument oczekuje na przegląd użytkownika.

**Zakres:** projekt funkcjonalny i architektoniczny, bez implementacji i planu implementacji.

## 1. Źródła i pierwszeństwo wymagań

- [Specyfikacja bazowa](../../base-specification.md) określa cele produktu i zakres.
- [Specyfikacja szczegółowa](../../detailed-specification.md), wersja 0.2, określa wymagania i szczegóły implementacyjne.
- Niniejszy dokument zapisuje decyzje podjęte przez użytkownika po analizie obu specyfikacji. Jawne zmiany wymagań z rozmowy mają pierwszeństwo w obszarach wymienionych w sekcji 2. Pozostałe wymagania źródłowe nadal obowiązują.

Dokumenty źródłowe pozostają zapisem wejścia do analizy. Tabela poniżej wskazuje fragmenty, których nie należy implementować według wcześniejszego brzmienia. Zatwierdzenie niniejszego dokumentu nie oznacza rozpoczęcia implementacji.

## 2. Rozstrzygnięte sprzeczności i zmiany wymagań

| Obszar i wcześniejsze wymaganie | Obowiązujące rozstrzygnięcie |
|---|---|
| Bazowa §1; szczegółowa §§5, 8, 16, 28: ogólna możliwość usuwania meczów | Nie można usunąć meczu klasycznego ani wycofać jego wyniku. Soft delete meczu jest dostępny tylko w lidze Elo. Usunięcie całej ligi pozostaje dostępne. |
| Szczegółowa §§7.2, 8.4: szkic i publikacja ligi | Liga klasyczna powstaje razem z terminarzem w jednej transakcji, po zatwierdzeniu podsumowania formularza. Brak zapisywanych szkiców i osobnej publikacji. |
| Szczegółowa §§7.3, 10.3: blokady strukturalne dopiero po pierwszym wyniku | Rodzaj i tryb każdej ligi są niezmienne od utworzenia. Klasyczni uczestnicy, pary i rewanże są zablokowani od utworzenia terminarza. |
| Szczegółowa §§7.2, 30.2: zakończenie ligi | Liga klasyczna kończy się automatycznie po zapisaniu wszystkich wyników; poprawki nie otwierają jej ponownie. |
| Szczegółowa §§7.3, 21: możliwość nieaktywnego członkostwa i powrotu | MVP nie udostępnia wypisywania z ligi Elo ani ponownego dołączania. Globalne usunięcie gracza nie usuwa członkostwa. |
| Szczegółowa §§9.6, 22.3: każdy nowy mecz natychmiast aktualizuje ratingi | Aktualizacja jest synchroniczna tylko przy aktualnym rankingu. Podczas przeliczania lub błędu zapisujemy mecz bez oczekiwania na obliczenia i zlecamy uwzględnienie najnowszego stanu. |
| Szczegółowa §§6.3, 9.6, 24.2: historyczni gracze kontra odczyt wyłącznie aktywnych | Globalnie usunięty gracz pozostaje w tabeli/rankingu i w odtwarzaniu historii Elo. Można uzupełniać jego istniejące mecze klasyczne. |
| Szczegółowa §§9.3, 9.6, 28.3: identyczne zmiany partnerów | Identyczna jest wyliczona zmiana zespołowa. Faktycznie zastosowane straty mogą się różnić przez indywidualną granicę 500. |
| Bazowa §§4–5; szczegółowa §§9, 12, 21, 30: czas zapisu jako „data rozegrania” | Pole pozostaje nieedytowalnym czasem pierwszego zapisu. Interfejs używa etykiety „Wynik zapisano” i strefy Europe/Warsaw. |
| Szczegółowa §§13.3, 30.2: wspólne miejsca jednocześnie ustalone i otwarte | Wspólne miejsca z numeracją 1, 1, 3 w tabeli klasycznej i rankingu Elo. |
| Szczegółowa §14.1: trend w rankingu | Wykresy i trendy poza MVP. Podstawowe statystyki i historia pozostają w zakresie. |
| Szczegółowa §20.2: pięć ogólnych kontraktów sportowych | MVP zachowuje sport ligi, wspólny model meczu i oddzielne dane tenisowe. Uogólniona infrastruktura strategii czeka na drugą dyscyplinę. |
| Szczegółowa §29: współbieżność i zabezpieczenia jako końcowy etap | Ochrona zapisu i testy współbieżności powstają razem z odpowiednimi mutacjami. |

## 3. Produkt i granice MVP

Aplikacja służy małej społeczności do prowadzenia amatorskich lig tenisa ziemnego. Oczekiwana skala to około 30 graczy w lidze i kilkaset meczów rocznie. Jest to założenie do projektowania i pomiarów, a nie zatwierdzony sztywny limit uczestników.

MVP obejmuje globalnych graczy z awatarami, ligi klasyczne i nieskończone Elo, singiel i debel, strukturalne wyniki, tabele, rankingi, historię meczów, podstawowe statystyki oraz techniczne odzyskiwanie danych. Nie ma kont, logowania, ról ani prywatnych grup. Każdy odwiedzający może wykonywać dozwolone operacje.

Poza MVP pozostają turnieje, mecze poza ligami i pozostałe moduły wyłączone w szczegółowej specyfikacji §3.2. Dodatkowo odkładamy zapisane szkice lig, ręczne publikowanie, wypisywanie i ponowne dołączanie do Elo, wykresy, trendy, publiczny kosz, ekran przywracania danych oraz ogólną infrastrukturę wielu sportów. Brak specjalnego modelu kreczu i walkoweru: wpisywany wynik musi być zwykłym poprawnym wynikiem końcowym.

## 4. Gracze, awatary i członkostwa

### 4.1. Dane i identyfikacja

- Imię, nazwisko i pseudonim są wymagane; pola po usunięciu skrajnych spacji nie mogą być puste.
- Pseudonim jest globalnie unikalny po usunięciu skrajnych spacji i bez rozróżniania wielkości liter. Ta sama normalizacja obowiązuje przy tworzeniu, edycji i kontroli unikalności w bazie.
- Usunięcie gracza nie zwalnia jego pseudonimu.
- Tożsamość wynika ze stałego identyfikatora, nie z nazwiska ani pseudonimu. Edycja danych gracza nie zmienia przypisania dawnych meczów.
- Awatar jest opcjonalny. Obsługiwane wejście: JPEG, PNG i WebP do 5 MB. Obraz po przetworzeniu mieści się w 256 × 256 px z zachowaniem proporcji.
- Serwer sprawdza rzeczywistą zawartość obrazu, ogranicza zasoby dekodowania i zapisuje ponownie przetworzony obraz. Nie serwuje oryginalnego pliku tylko na podstawie podanego typu MIME.

### 4.2. Soft delete gracza

Gracz znika z globalnej listy i wyboru do nowych lig i meczów. Nadal występuje w istniejących terminarzach, historycznych spotkaniach, tabelach i rankingach, z oznaczeniem „gracz usunięty”. Zachowuje miejsce i rating.

Można zapisać i poprawić wynik jego wcześniej zaplanowanego meczu klasycznego. Można poprawić wynik istniejącego meczu Elo bez usuwania z niego dotychczasowego gracza. Usuniętego gracza nie można wskazać jako nowego uczestnika przy tworzeniu lub korekcie innego składu.

Usunięcie nie usuwa członkostw, stron meczów, setów ani historii. Przeliczenia historyczne jawnie obejmują graczy globalnie usuniętych.

## 5. Ligi i terminarz

### 5.1. Konfiguracja i minimum uczestników

Każda liga ma nazwę, sport TENNIS, rodzaj CLASSIC/ELO_INFINITE i tryb SINGLES/DOUBLES. Rodzaj, tryb i sport są niezmienne od utworzenia. Nazwę można poprawić.

| Rodzaj | Minimum i zasady |
|---|---|
| Singiel klasyczny lub Elo | Co najmniej 2 różnych graczy. |
| Debel klasyczny | Co najmniej 2 pełne pary; każdy wybrany gracz należy do dokładnie jednej pary w tej lidze. |
| Debel Elo | Co najmniej 4 różnych graczy; nieparzysta liczba członków ligi jest dozwolona. |

### 5.2. Liga klasyczna

Przepływ: konfiguracja, podsumowanie, zatwierdzenie. Jedna transakcja tworzy ligę, członkostwa, stałe pary i kompletny terminarz. Podsumowanie uprzedza o niezmienności uczestników, par i rewanżów. Nie ma utrwalonego szkicu.

Dla n stron generator tworzy n × (n − 1) / 2 meczów bez rewanżów albo n × (n − 1) z rewanżami. Podział na kolejki jest deterministyczny. Przy nieparzystej liczbie stron występuje pauza. Żadna strona nie gra dwa razy w jednej kolejce; stały skład par zapewnia tę samą własność dla graczy. Rewanże są w drugiej części terminarza z odwróconymi stronami.

Wynik można wpisać do dowolnego spotkania niezależnie od zaległości. Użytkownik wybiera konkretny mecz terminarza; numer kolejki i oznaczenie rewanżu odróżniają dwa spotkania tych samych stron.

Nie można dodawać spotkań poza pulą, usuwać pojedynczych spotkań ani czyścić wyników. Zapisany wynik można poprawić wyłącznie na inny poprawny wynik końcowy, zachowując strony spotkania. Procent realizacji wynika z liczby zakończonych spotkań wobec całego terminarza. Po zapisaniu wszystkich wyników liga automatycznie jest zakończona; dalsze korekty pozostają dostępne.

### 5.3. Liga Elo

Liga powstaje bez meczów. Nowych graczy można dodawać w dowolnym momencie, z ratingiem 1000. MVP nie ma wypisywania z ligi. Pary dobiera się osobno przy każdym meczu; ranking jest indywidualny.

K jest całkowite, domyślnie 32, w zakresie 10–60. Można je zmieniać dla przyszłych zapisów. Zmiana K nie uruchamia przeliczania wcześniejszych meczów. Liga nieskończona nie ma automatycznego końca ani osobnego ręcznego zamykania w MVP.

### 5.4. Usunięcie ligi

Soft delete ukrywa ligę, jej widoki i mecze, także w profilach graczy, ostatnich wynikach i statystykach globalnych. Dane powiązane pozostają w bazie. Bezpośredni adres ani wcześniejszy formularz nie pozwala wykonać mutacji usuniętej ligi. Worker nie publikuje aktualizacji usuniętej ligi.

## 6. Wynik i korekty

### 6.1. Reguły tenisowe

- Mecz kończy się po dwóch wygranych setach: dokładnie dwa sety przy 2:0 albo trzy przy 2:1. Nie wolno dopisać seta po rozstrzygnięciu spotkania.
- Pierwsze dwa sety mają jeden wspólny format.
- Fast4: wyniki zwycięzcy 4:0, 4:1, 4:2, 4:3.
- Normalny set: 6:0–6:4, 7:5 lub 7:6.
- Trzeci set przy 1:1: Fast4, normalny lub super tie-break, niezależnie od formatu otwierającego.
- Super tie-break: 10:0–10:8 albo, gdy zwycięzca ma więcej niż 10 punktów, przewaga dokładnie dwóch. 11:9 i 12:10 są poprawne, 10:9 i 12:8 nie są poprawne. Obowiązują także wyniki odwrócone.
- Wyniki są nieujemnymi liczbami całkowitymi. Zwycięzcę seta i meczu wylicza serwer.
- Małe punkty przechowujemy wyłącznie dla super tie-breaka w trzecim secie. Nie przechowujemy małych punktów zwykłych tie-breaków ani przebiegu punkt po punkcie.
- Super tie-break wpływa na sety, ale dodaje zero gemów.

Format i wynik są osobnymi danymi strukturalnymi. Walidator jest wspólny dla tworzenia i edycji oraz wykonywany na serwerze; walidacja klienta służy wygodzie.

### 6.2. Edycja meczu Elo

Można zmienić uczestników, zestawienie par, format i wynik. Nowo wskazana osoba musi być obecnym, globalnie nieusuniętym członkiem ligi. Może dołączyć do ligi już po pierwszym zapisie poprawianego meczu. Przy odtwarzaniu historii zaczyna od 1000 przed swoim pierwszym przypisanym meczem według kolejności Elo; joinedAt nie wyklucza takiej korekty.

Korekta oraz soft delete meczu Elo uruchamiają asynchroniczne przeliczenie. resultRecordedAt i eloKSnapshot nie zmieniają się. Usunięty mecz nie jest odtwarzany i nie wpływa na bieżące statystyki.

### 6.3. Historia zmian

Każdy pierwszy zapis tworzy wersję meczu, a korekta zachowuje poprzednią wersję i zapisuje nową. Wersja obejmuje uczestników i strony, formaty, sety, status usunięcia oraz czas zmiany. Soft delete Elo także tworzy ślad zmiany. Zapis bieżącego stanu, historii i ewentualnego zlecenia przeliczenia jest transakcyjny.

Historia zmian meczu jest niezależna od zdarzeń obliczeniowych Elo. Worker nie nadpisuje historii korekt. Zdarzenie Elo identyfikuje wersję wyniku używaną w obliczeniu, aby odróżnić stare obliczenie od aktualnie poprawionego meczu.

Bez kont historia nie przypisuje zmiany do zweryfikowanej osoby. MVP nie dodaje historii każdej edycji profilu lub awatara; takie nadpisania zależą od kopii zapasowych. Nie obiecujemy zamrożonych dawnych nazw graczy na ekranach historycznych.

## 7. Tabele i statystyki

### 7.1. Liga klasyczna

Wygrana 2:0 daje 5 punktów zwycięzcy i 0 przegranemu. Wygrana 2:1 daje 4 i 2 punkty. Tabela uwzględnia wyłącznie zakończone spotkania widocznej ligi.

Sortowanie: punkty, różnica wygranych i przegranych setów, różnica wygranych i przegranych gemów. Pełny remis oznacza wspólne miejsce z numeracją 1, 1, 3. Porządek nazw wewnątrz wspólnego miejsca nie stanowi dodatkowego kryterium sportowego. W singlu klasyfikujemy graczy, w deblu stałe pary.

### 7.2. Ranking Elo

Sortowanie malejąco według ratingu. Równy rating daje wspólne miejsce 1, 1, 3; w obrębie remisu sortujemy według pseudonimu. Wyświetlamy rating, liczbę meczów i ostatnią zastosowaną zmianę odpowiadające opublikowanej wersji obliczeń. Globalnie usunięci członkowie nadal zajmują miejsca w rankingu.

Podczas przeliczania lub błędu pozostaje ostatni kompletny ranking ze statusem. Wyniki meczów są widoczne od razu. Ich stare zmiany Elo są jednoznacznie oznaczone jako nieaktualne, a nowe mecze bez zdarzeń jako oczekujące. Nie zestawiamy nowego składu z dawnym zdarzeniem Elo bez wskazania, że dotyczy poprzedniej wersji meczu.

### 7.3. Profil gracza

Osobne widoki Singiel i Debel mają filtr ligi oraz historię i statystyki: mecze, wygrane, przegrane, procent zwycięstw, sety wygrane i przegrane, bilans setów, gemy wygrane i przegrane, bilans gemów, liczba i bilans super tie-breaków. Przy braku meczów procent zwycięstw pokazujemy jako brak danych.

W deblu każdy gracz otrzymuje pełny wynik swojej strony, w tym bilans setów i gemów. W statystykach ligi mecz liczymy tylko raz, a nie raz na zawodnika. Nie agregujemy Elo między ligami. Mecze nieukończone, usunięte mecze Elo i wszystkie mecze usuniętych lig nie wchodzą do statystyk.

## 8. Architektura i odpowiedzialności

Wybrano wariant 1: synchroniczne dopisanie Elo przy aktualnym rankingu oraz asynchroniczne pełne odtwarzanie po korektach. Odrzucono kierowanie wszystkich nowych meczów do workera oraz pełne synchroniczne odtwarzanie przy każdym zapisie.

Stos pozostaje zgodny ze specyfikacją szczegółową: Next.js App Router, TypeScript strict, MikroORM i PostgreSQL. Jedna aplikacja i jeden osobny proces workera współdzielą logikę domenową. Nie ma mikroserwisów ani zewnętrznego brokera.

| Część | Odpowiedzialność i zależności |
|---|---|
| Gracze | Dane globalne, pseudonimy, awatary, soft delete; nie oblicza lig. |
| Ligi | Konfiguracja, członkostwa, stałe pary, generowanie terminarza; korzysta z graczy i sportu. |
| Mecze | Strony, wersje, zapis i korekty; korzysta z reguł ligi i walidatora tenisa. |
| Tenis | Walidacja setów, zwycięzca, projekcja statystyk; bez zależności od Next.js. |
| Tabela klasyczna | Wyliczenie klasyfikacji z zakończonych meczów i stałych reguł punktowych. |
| Elo | Wspólny kalkulator pojedynczego meczu, odtwarzanie historii, publikacja ratingów. |
| Worker | Pobieranie zadań, retry i uruchamianie przeliczeń; używa tej samej logiki Elo. |

Server Components odczytują warstwę aplikacyjną bez wywoływania własnego HTTP API. Formularze używają Server Actions; awatary Route Handlerów. Runtime to Node.js. Każde żądanie i zadanie ma izolowany kontekst MikroORM. Mutacje kontrolują rewalidację widoków. Status i opublikowana rewizja Elo są odczytywane okresowo; publikacja przez worker musi stać się widoczna także bez Server Action od użytkownika.

Kod sportowy i dane tenisowe pozostają oddzielone od wspólnego modelu ligi i meczu. Kolejny sport może dodać własne tabele wyników bez zmieniania historycznych setów tenisowych. Nie tworzymy z góry pięciu generycznych strategii ani obowiązkowych pustych warstw każdego modułu.

## 9. Model danych i ograniczenia

Punktem wyjścia są tabele szczegółowej specyfikacji §21, z poniższymi uzupełnieniami wynikającymi z uzgodnień:

- players zawiera klucz znormalizowanego pseudonimu unikalny również dla usuniętych rekordów.
- league_players ma jedno członkostwo dla pary liga–gracz; usunięcie globalne nie usuwa ratingu. Nie udostępniamy cyklu wypisania i powrotu.
- league_team_players egzekwuje jeden udział gracza w stałej parze danej ligi. Strona klasycznego meczu deblowego odwołuje się jawnie do identyfikatora tej pary.
- match_side_players pozwala wymusić unikalność gracza w całym meczu, a nie tylko w jednej stronie. Ewentualny powtórzony matchId/leagueId musi być związany kluczami złożonymi ze stroną i ligą, aby nie tworzyć sprzecznych powiązań.
- fixtureKey jest unikalny w obrębie ligi i rozróżnia rewanż. Ponowienie tworzenia nie generuje drugiej puli.
- Format zapisany przy regułach meczu i setach musi być zgodny. Nie przechowujemy dwóch niezależnie edytowalnych źródeł reguł.
- MatchRevision przechowuje pełne strukturalne wersje meczu z unikalnym numerem wersji. EloRatingEvent odnosi się do użytej wersji meczu; calculatedDelta i appliedDelta są oddzielne.
- Liga Elo rozróżnia rewizję danych wejściowych i opublikowaną rewizję obliczeń. Stan aktualny wymaga ich zgodności. Zadanie zawiera żądaną rewizję, stan, próby oraz dane potrzebne do odzyskania przerwanej pracy.
- Gracz, liga i mecz mają wersję dla kontroli edycji. Token żądania tworzącego oraz odcisk danych pozwalają rozpoznać ponowienie.

Klucze obce, NOT NULL, CHECK i UNIQUE chronią reguły możliwe do wyrażenia w bazie. Liczbę graczy stron, zgodność ligi, dozwolone przejścia i pełną strukturę wyniku sprawdza również serwis domenowy w tej samej transakcji. Kontrola stanu usunięcia uczestniczy w koordynacji z równoczesnym zapisem, a nie tylko we wcześniejszym odczycie formularza.

Domyślne filtry soft delete stosujemy do głównych list. Historyczne odczyty świadomie zachowują usuniętych graczy; odczyty publiczne konsekwentnie wykluczają usunięte ligi. Pochodne ratingi można odbudować; pierwotnych wyników i wersji korekt nie traktujemy jako danych tymczasowych.

## 10. Przepływ i spójność Elo

### 10.1. Obliczenia

Dla singla E_A = 1 / (1 + 10^((R_B − R_A) / 400)), a delta_A = K × (S_A − E_A), gdzie S_A wynosi 1 dla wygranej i 0 dla przegranej. Zmiana drugiej strony ma przeciwny znak. Wynik 2:0 i 2:1 ma ten sam wpływ.

W deblu rating strony jest średnią dwóch ratingów przed meczem. Każdy partner otrzymuje tę samą wyliczoną zmianę. Zaokrąglamy do całości z połówkami od zera, a następnie stosujemy indywidualne minimum 500. Przykładowo wyliczone −15 przy ratingu 505 daje zastosowane −5. System przy dolnej granicy nie musi zachowywać sumy punktów.

### 10.2. Nowy mecz

1. Serwer rozpoznaje ponowienie żądania i waliduje dane.
2. W transakcji krótko blokuje zapisy wpływające na Elo tej ligi i ponownie sprawdza aktualność, uczestników oraz dostępność ligi.
3. Nadaje czas pierwszego zapisu i snapshot aktualnego K. Kolejność dopisania musi odpowiadać sortowaniu resultRecordedAt, id przy odtwarzaniu. Czas musi być nadawany po uzyskaniu blokady i ściśle rosnąć w lidze także przy równoczesnych żądaniach; nie można polegać na losowym porządku UUID przy równych czasach. Techniczne pole ostatnio nadanego czasu nie cofa się po soft delete meczu.
4. Zapisuje mecz i jego wersję oraz zwiększa rewizję wejścia.
5. Jeśli wcześniejszy ranking był aktualny, wspólny kalkulator dopisuje zdarzenia i ratingi w tej samej transakcji. Opublikowany stan odpowiada nowej rewizji.
6. Jeśli ranking był przeliczany lub w błędzie, pozostawia opublikowane wartości i tworzy lub aktualizuje zlecenie najnowszej rewizji. Użytkownik otrzymuje potwierdzenie zapisu meczu.

Zmiana K korzysta z tej samej koordynacji, aby snapshot miał jednoznaczną wartość. Dodanie członka zwiększa wspólną rewizję wejścia, więc worker nie może utracić nowego członkostwa przy publikacji. Przy aktualnym rankingu samo dodanie członka publikuje jego 1000 bez ponownego przeliczania wcześniejszych meczów. Podczas przeliczania nowy członek jest od razu dostępny w formularzu; do ostatniego kompletnego rankingu dołącza przy następnej publikacji.

### 10.3. Korekta i worker

Korekta lub soft delete zapisuje dane, historię, zwiększenie rewizji i zlecenie w jednej transakcji. Tylko jeden aktywny job jest przeznaczony dla ligi; szybkie zmiany aktualizują żądaną rewizję zamiast tworzyć nieograniczoną kolejkę.

Worker pobiera spójny zestaw wejścia dla danej rewizji i liczy poza blokadą zapisu. Obejmuje wszystkie członkostwa, także graczy globalnie usuniętych, inicjalizując ratingi na 1000. Odtwarza zakończone nieusunięte mecze według resultRecordedAt, id z K przypisanym do każdego meczu. Uczestnik bez przypisanych meczów pozostaje na 1000.

Przed publikacją worker w krótkiej transakcji blokuje ligę i porównuje rewizję wejścia. Jeżeli nastąpiła zmiana, nie publikuje wyniku, lecz ponawia obliczenia najnowszego stanu. Jeżeli stan się zgadza, publikuje komplet ratingów i historii obliczeń, oznacza ranking jako aktualny i zamyka zadanie atomowo. Odczyt rankingu i historii także musi odnosić się do jednej opublikowanej rewizji.

### 10.4. Ponowienia i błędy

Zadanie ma identyfikator przejęcia i ograniczony czas ważności przejęcia, odnawiany podczas pracy. Po awarii inny worker może odzyskać zadanie; stary wykonawca nie może opublikować wyniku po utracie przejęcia. Próby są ograniczone, rozdzielone opóźnieniem i rejestrowane. Po wyczerpaniu prób liga pokazuje błąd, zachowując ostatnią kompletną publikację. Możliwe jest techniczne ponowienie; nowa mutacja również zleca najnowszy stan bez nadpisywania rankingu wyliczeniem ze starych danych.

Token ponawianego utworzenia jest trwały przez ponowienie po błędzie sieciowym. Ten sam token i te same dane zwracają wynik pierwotnej operacji; zmienione dane pod tym samym tokenem są odrzucane. Nowy formularz ma nowy token, więc te same osoby mogą rozegrać kolejne spotkanie. Ponowiony soft delete nie tworzy kolejnych efektów ani przeliczeń. Konflikt wersji edycji wymaga odświeżenia i nie nadpisuje zmian innej osoby.

## 11. Interfejs i błędy

Interfejs jest polski, responsywny, z obsługą klawiatury, etykietami, widocznym fokusem i komunikatami powiązanymi z polami. Wprowadzanie setów używa pól numerycznych; trzeci set pojawia się tylko przy 1:1. Nieudany zapis zachowuje dane formularza. Podczas wysyłania przycisk jest zablokowany, ale rzeczywistą ochronę przed duplikacją zapewnia serwer.

Główne widoki pozostają zgodne z mapą szczegółowej specyfikacji §17: gracze, profil, ligi, szczegóły ligi, terminarz/historia, tabela/ranking, zapis i edycja wyniku, ustawienia. Nie ma przycisku usunięcia klasycznego meczu ani wycofania jego wyniku. Niedozwolone operacje są również odrzucane przez serwer.

Czas jest przechowywany jako timestamptz i wyświetlany w Europe/Warsaw z etykietą „Wynik zapisano”. Formularz nie przyjmuje ręcznej daty. Przy korekcie pokazujemy podsumowanie zmian i informację o przeliczeniu Elo.

Stany: poprawny zapis, błąd walidacji, konflikt edycji, rekord usunięty, przekroczony limit, ranking w trakcie aktualizacji i błąd przeliczenia. Komunikaty nie ujawniają stosu wywołań ani szczegółów bazy. Usunięcia gracza, ligi i meczu Elo wymagają potwierdzenia z opisem wpływu na widoczność danych.

## 12. Zabezpieczenia i eksploatacja

Otwarty dostęp jest świadomym wymaganiem. Walidacja, limity, transakcje, historia zmian i kopie zapasowe ograniczają skutki błędów, lecz nie zapewniają kontroli uprawnień ani identyfikacji autora zmiany.

Wymagane są limity długości pól, rozmiaru żądań, liczby generowanych spotkań i częstotliwości mutacji, ze szczególną ochroną tworzenia lig, uploadu i korekt Elo. Konfiguracja limitów musi być wspólna dla działających procesów; blokada przycisku ani pamięć pojedynczego procesu nie stanowią jedynej ochrony. Odrzucenie żądania nie pozostawia częściowych danych. Teksty użytkownika są renderowane jako tekst, a upload nie może służyć do podania aktywnej treści pod typem obrazu. Mutacje sprawdzają pochodzenie żądania odpowiednio do użytego transportu.

Szczegóły liczbowe limitów technicznych, rozmiar stron list i interwały retry/pollingu są parametrami implementacji wymagającymi walidacji na zakładanej skali. Nie zmieniają uzgodnionych zasad produktu i nie oznaczają domyślnego limitu 30 członków. Ich dobór jest częścią późniejszego planu technicznego, nie dodatkową funkcją MVP.

Wdrożenie musi obsługiwać aplikację Node.js, osobny nadzorowany proces workera i PostgreSQL. Migracje są wersjonowane i wykonywane jako kontrolowany krok wdrożenia. Logi obejmują identyfikator żądania/zadania, błąd, liczbę prób oraz czas pracy; nie zapisują binariów awatara ani pełnych formularzy. Monitorujemy również zadania utknięte oraz stan FAILED.

Automatyczne kopie zapasowe i sprawdzony proces odzyskania są wymaganiem uruchomienia produkcyjnego. Dostawca hostingu, harmonogram i retencja kopii oraz docelowe parametry odzyskania należą do osobnego ustalenia środowiska wdrożeniowego. Projekt nie zakłada konkretnego dostawcy ani nie obiecuje czasu odzyskania bez tych ustaleń.

Procedura odzyskania powinna rozróżniać przywrócenie usuniętego rekordu, korektę według historycznej wersji meczu i odzyskanie całej bazy. Przywrócenie danych wpływających na Elo zwiększa rewizję i uruchamia pełne przeliczenie; nie kopiuje starych ratingów jako aktualnych. Przywrócenie ligi zachowuje terminarz i członkostwa. Operacje techniczne respektują unikalność pseudonimu, zależności i historię zmian. Nie powstaje publiczny ekran przywracania.

## 13. Weryfikacja i kryteria akceptacji

Testy powstają przy odpowiednich funkcjach. Obowiązują testy szczegółowej specyfikacji §27 i kryteria §28 z korektami opisanymi w sekcji 2 oraz poniższymi przypadkami.

### 13.1. Reguły sportowe

- Fast4, normalny set, super tie-break i ich odwrócone wyniki; odrzucenie 12:8 w super tie-breaku.
- Poprawny mecz 2:0 i 2:1, odrzucenie dodatkowego seta po rozstrzygnięciu.
- Punkty 5/0 i 4/2, bilanse oraz wyłączenie małych punktów z gemów.
- Terminarz parzysty i nieparzysty, rewanże, stałe pary i brak podwójnego występu w kolejce.
- Elo singla i debla, K, połówki od zera, minimum 500 i różne appliedDelta partnerów przy podłodze.
- Wspólne miejsca 1, 1, 3 i deterministyczny porządek wyświetlania.
- Pełne statystyki strony dla obu partnerów przy jednokrotnym liczeniu spotkania w lidze; oddzielne statystyki singla i debla.

### 13.2. Integralność i awarie

- Atomowe utworzenie ligi i terminarza; brak częściowych danych przy błędzie.
- Zakaz usuwania spotkania klasycznego, czyszczenia wyniku i zmiany struktury ligi, także bezpośrednim żądaniem.
- Uzupełnienie klasycznego wyniku usuniętego gracza i zachowanie jego miejsca w tabeli/rankingu.
- Podmiana uczestnika historycznego meczu Elo na osobę dodaną później, z poprawnym odtworzeniem od 1000.
- Niezmienność czasu pierwszego zapisu i K przy edycji; zachowanie historii wersji po przeliczeniu.
- Dwa równoczesne nowe mecze dają taki sam ranking jak późniejsze pełne odtworzenie, również przy identycznym odczycie zegara.
- Nowy mecz, nowy członek, korekta lub usunięcie podczas pracy workera nie zostają utracone ani przykryte starą publikacją.
- Awaria w trakcie obliczeń i publikacji nie ujawnia częściowych ratingów. Odzyskanie zadania blokuje publikację dawnego wykonawcy.
- Retry żądania nie dubluje meczu, a nowy formularz tych samych stron może utworzyć kolejne spotkanie.
- Konflikt równoczesnej edycji jest zgłaszany; historia i obecny wynik pozostają spójne.
- Usunięcie ligi jest respektowane w listach, profilach, bezpośrednich adresach, statystykach i równoległych mutacjach.
- Nickname jest unikalny po normalizacji i po soft delete. Avatar przekraczający limit lub o niezgodnej treści jest odrzucany.

### 13.3. Ścieżki użytkownika i pomiary

Pełne scenariusze obejmują stworzenie graczy i każdej kombinacji ligi/trybu, wpisanie wyniku z przyszłej kolejki, poprawkę wyniku, automatyczne zakończenie ligi klasycznej, aktualizację Elo, zapis podczas przeliczania i błąd workera. Weryfikujemy mobilny formularz, klawiaturę, komunikaty i zachowanie danych po błędzie.

Pomiar obejmuje pełną historię kilkuset spotkań, kolejkę oczekujących zadań i równoległe zapisy. Oddzielnie mierzymy czas obliczeń, oczekiwania na worker i publikacji; nie deklarujemy czasu końcowego na podstawie samej złożoności wzoru Elo. Dla terminarza weryfikujemy między innymi 30 singlistów z rewanżami, czyli 870 spotkań. Procedura kopii zapasowej wymaga próby odzyskania przed uruchomieniem produkcyjnym.

## 14. Stan procesu projektowego

Użytkownik zatwierdził kolejno decyzje funkcjonalne oraz sekcje architektury, spójności Elo, modelu danych, interfejsu i zabezpieczeń/testów. Ten dokument zbiera te ustalenia oraz techniczne doprecyzowania potrzebne do zachowania ich spójności. Nie jest planem zadań implementacyjnych.

Następny krok to przegląd całego zapisu przez użytkownika. Dopiero po jego akceptacji można przygotować plan implementacji. Rozpoczęcie pisania kodu pozostaje osobnym krokiem zgodnym z pierwotnym poleceniem, aby na tym etapie nie implementować aplikacji.
