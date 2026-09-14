# Low On Legs — szczegółowa specyfikacja biznesowa, funkcjonalna i techniczna

**Wersja dokumentu:** 0.1  
**Status:** wersja robocza do zatwierdzenia  
**Źródło nadrzędne:** [`docs/base-specification.md`](./base-specification.md)  
**Zakres produktu:** MVP dla tenisa ziemnego  
**Stos technologiczny:** Next.js + TypeScript + MikroORM + PostgreSQL

---

## 1. Cel dokumentu

Dokument rozwija wymagania z `base-specification.md` do poziomu pozwalającego zaprojektować interfejs, model danych, logikę domenową, testy i kolejność implementacji.

Obowiązują trzy zasady:

1. `base-specification.md` jest źródłem prawdy. W razie sprzeczności ma pierwszeństwo przed tym dokumentem.
2. Specyfikacja nie dodaje nowych modułów produktowych. Doprecyzowuje tylko zachowanie konieczne do realizacji istniejącego zakresu.
3. Niejednoznaczności, których nie da się rozstrzygnąć logicznie, są wymienione w sekcji „Otwarte decyzje”.

## 2. Streszczenie rozwiązania

Low On Legs (LOL) jest publicznie dostępną aplikacją do prowadzenia amatorskich lig tenisowych. MVP nie wymaga konta i nie ma systemu ról. Każda osoba odwiedzająca aplikację może:

- przeglądać graczy, ligi, mecze, tabele, rankingi i statystyki;
- dodawać oraz edytować graczy;
- tworzyć i edytować ligi;
- dodawać i edytować wyniki;
- wykonywać operacje usunięcia, które zawsze są miękkim usunięciem.

System obsługuje dwa rodzaje lig:

- **Liga klasyczna** — zamknięta pula spotkań każdy z każdym, opcjonalnie z rewanżami, tabela oparta na stałej punktacji;
- **Liga nieskończona Elo** — brak terminarza, mecze dodawane ad hoc, ranking oparty na Elo.

Każda liga działa jako singiel albo debel. Wszystkie mecze tenisowe są rozgrywane do dwóch wygranych setów. Pierwsze dwa sety mogą być krótkie albo normalne, a decydujący trzeci set może być pełnym setem albo super tie-breakiem.

## 3. Zakres MVP

### 3.1. W zakresie

- globalna baza graczy;
- tworzenie, edycja, przeglądanie i miękkie usuwanie graczy;
- opcjonalny awatar gracza;
- globalna lista lig;
- tworzenie, edycja, przeglądanie i miękkie usuwanie lig;
- tenis ziemny jako jedyny aktywny sport;
- tryb singlowy i deblowy;
- liga klasyczna każdy z każdym;
- opcjonalne mecze rewanżowe w lidze klasycznej;
- automatyczne generowanie meczów i sugerowanych kolejek;
- możliwość wpisania wyniku niezależnie od numeru aktualnej kolejki;
- liga nieskończona z meczami dodawanymi ad hoc;
- wynik best of 3 z krótkimi albo normalnymi setami;
- pełny set albo super tie-break jako trzeci set;
- automatyczna tabela ligi klasycznej;
- ranking Elo ligi nieskończonej;
- asynchroniczne przeliczanie historii Elo po edycji lub usunięciu wcześniejszego meczu;
- historia meczów i statystyki wynikające ze strukturalnego zapisu setów;
- soft delete gracza, ligi i meczu;
- techniczna gotowość na dodanie kolejnych sportów bez migracji zmieniającej historyczne wyniki tenisowe.

### 3.2. Poza zakresem

- logowanie, rejestracja, sesje i konta użytkowników;
- role, uprawnienia i administratorzy;
- prywatne grupy i ograniczanie widoczności;
- turnieje oraz drabinki turniejowe;
- mecze poza ligą;
- system bukmacherski, typowanie i wirtualne waluty;
- płatności;
- rezerwowanie kortów;
- automatyczne uzgadnianie terminów;
- powiadomienia e-mail, push i SMS;
- czat, komentarze i multimedia meczowe;
- integracje z federacjami albo zewnętrznymi systemami rankingowymi;
- specjalny model walkoweru, kreczu albo meczu niedokończonego;
- aplikacje natywne na iOS i Android.

### 3.3. Świadome ograniczenie bezpieczeństwa

Brak logowania jest wymaganiem MVP, nie przeoczeniem. Wszystkie mutacje są publiczne. System ogranicza skutki błędów przez walidację, potwierdzenia w interfejsie, transakcje i soft delete, ale nie jest w stanie przypisać zmiany do konkretnej osoby ani powstrzymać celowej edycji przez odwiedzającego.

## 4. Zasady domenowe i słownik

### 4.1. Najważniejsze pojęcia

| Pojęcie | Definicja |
|---|---|
| Sport | Dyscyplina określająca reguły wyniku, statystyk i rankingu. W MVP: tenis ziemny. |
| Gracz | Globalny rekord osoby mogącej uczestniczyć w wielu ligach. Nie jest kontem użytkownika. |
| Liga | Kontener rozgrywek jednego sportu, jednego trybu gry i jednego systemu klasyfikacji. |
| Liga klasyczna | Liga z wygenerowaną pulą spotkań i tabelą punktową. |
| Liga nieskończona | Liga bez wygenerowanego terminarza, z rankingiem Elo. |
| Uczestnik ligi | Gracz przypisany do ligi; w klasycznym deblu uczestnikiem klasyfikacji może być stała para. |
| Mecz | Spotkanie dwóch stron należące dokładnie do jednej ligi. |
| Strona meczu | Jeden gracz w singlu albo dwóch graczy w deblu. |
| Kolejka | Sugerowane pogrupowanie meczów ligi klasycznej. Nie jest blokadą kolejności. |
| Set gemowy | Set zapisany liczbą gemów obu stron. |
| Super tie-break | Set decydujący zapisany małymi punktami, a nie gemami. |
| Tabela | Klasyfikacja ligi klasycznej według punktów, bilansu setów i gemów. |
| Rating Elo | Liczba określająca pozycję gracza w konkretnej lidze nieskończonej. |
| Soft delete | Ustawienie daty usunięcia i ukrycie rekordu bez fizycznego kasowania danych. |

### 4.2. Niezmienniki systemu

1. Każdy mecz należy do dokładnie jednej ligi.
2. Sport meczu zawsze wynika ze sportu ligi.
3. Tryb meczu zawsze odpowiada trybowi ligi.
4. Mecz ma dokładnie dwie strony.
5. Strona singlowa ma dokładnie jednego gracza, a deblowa dokładnie dwóch.
6. Ten sam gracz nie może wystąpić po obu stronach ani dwukrotnie po tej samej stronie.
7. Każdy uczestnik meczu musi należeć do jego ligi.
8. Zwycięzca meczu tenisowego musi wygrać dokładnie dwa sety.
9. Super tie-break nie zwiększa bilansu gemów.
10. Usunięcie nie wykonuje fizycznego `DELETE` dla gracza, ligi ani meczu.
11. Rating Elo jest lokalny dla jednej ligi nieskończonej.
12. Zmiana historycznego wyniku nie może pozostawić późniejszych ratingów wyliczonych ze starego stanu.
13. Numer kolejki nie ogranicza możliwości zapisania wyniku.
14. Historyczny mecz przechowuje reguły punktacji obowiązujące przy jego zapisie.

## 5. Dostęp i aktorzy

### 5.1. Aktor MVP

System rozpoznaje jeden rodzaj aktora: **anonimowego odwiedzającego**. Każdy odwiedzający ma ten sam zestaw możliwości.

### 5.2. Macierz dostępu

| Operacja | Dostęp w MVP |
|---|---:|
| Lista i szczegóły graczy | publiczny |
| Dodanie i edycja gracza | publiczny |
| Miękkie usunięcie gracza | publiczny, po potwierdzeniu |
| Lista i szczegóły lig | publiczny |
| Utworzenie i edycja ligi | publiczny |
| Miękkie usunięcie ligi | publiczny, po potwierdzeniu |
| Dodanie i edycja wyniku | publiczny |
| Miękkie usunięcie meczu | publiczny, po potwierdzeniu |
| Tabela, ranking i statystyki | publiczny |
| Fizyczne usunięcie danych | niedostępne w aplikacji |

## 6. Baza graczy

### 6.1. Dane gracza

Rekord gracza zawiera:

- identyfikator systemowy;
- imię;
- nazwisko;
- pseudonim;
- opcjonalny awatar;
- datę utworzenia;
- datę ostatniej modyfikacji;
- opcjonalną datę miękkiego usunięcia.

### 6.2. Widoki graczy

Lista graczy pokazuje co najmniej:

- awatar albo zastępczy inicjał;
- imię i nazwisko;
- pseudonim;
- liczbę aktywnych lig;
- odnośnik do profilu.

Profil gracza pokazuje:

- dane podstawowe;
- listę lig;
- historię meczów;
- zagregowane statystyki tenisowe.

### 6.3. Reguły funkcjonalne

**PLY-01.** Gracz istnieje globalnie i może należeć do wielu lig.  
**PLY-02.** Dodanie gracza nie przypisuje go automatycznie do żadnej ligi.  
**PLY-03.** Edycja danych gracza nie zmienia tożsamości referencji w historycznych meczach.  
**PLY-04.** Miękko usunięty gracz nie pojawia się na zwykłej liście ani w selektorze nowych lig i meczów.  
**PLY-05.** Miękko usunięty gracz nadal jest widoczny w historycznym meczu i wcześniejszej tabeli/rankingu, aby nie uszkodzić historii.  
**PLY-06.** Usunięcie gracza nie usuwa jego członkostw, meczów, setów ani zdarzeń Elo.  
**PLY-07.** Przed usunięciem interfejs pokazuje liczbę lig i meczów powiązanych z graczem.  
**PLY-08.** Awatar jest opcjonalny; brak awatara nie blokuje żadnego procesu.

## 7. Liga

### 7.1. Konfiguracja wspólna

Każda liga zawiera:

- nazwę;
- sport — w MVP zawsze tenis ziemny;
- rodzaj: `CLASSIC` albo `ELO_INFINITE`;
- tryb gry: `SINGLES` albo `DOUBLES`;
- wybranych uczestników;
- datę utworzenia i modyfikacji;
- opcjonalną datę miękkiego usunięcia.

Konfiguracja zależna od rodzaju:

| Parametr | Liga klasyczna | Liga Elo |
|---|---:|---:|
| Rewanże | wymagany wybór tak/nie | nie dotyczy |
| Sugerowane kolejki | generowane | brak |
| Parametr K | nie dotyczy | wymagany |
| Startowy rating 1000 | nie dotyczy | automatyczny |
| Tabela punktowa | tak | nie |
| Ranking Elo | nie | tak |

### 7.2. Cykl życia

- **Szkic** — konfiguracja jest uzupełniana; terminarz nie został opublikowany.
- **Aktywna** — można wpisywać i edytować wyniki.
- **Zakończona** — pozostaje widoczna i edytowalna w otwartym modelu MVP, ale jest oznaczona jako zakończona.
- **Usunięta** — ukryta przez soft delete.

Stan „zakończona” służy prezentacji i filtrowaniu. Nie wprowadza uprawnień ani nie blokuje edycji, ponieważ takich ograniczeń nie przewiduje specyfikacja bazowa.

### 7.3. Reguły funkcjonalne

**LGE-01.** Utworzenie ligi wymaga nazwy, rodzaju, trybu i uczestników.  
**LGE-02.** Jedna liga nie może mieszać singla i debla.  
**LGE-03.** Jedna liga nie może mieszać klasycznej tabeli i Elo.  
**LGE-04.** Na zwykłych listach nie pokazuje się usuniętych lig.  
**LGE-05.** Miękkie usunięcie ligi nie usuwa jej uczestników, meczów i wyników.  
**LGE-06.** Zmiana nazwy pozostaje dozwolona w dowolnym momencie.  
**LGE-07.** Zmiana rodzaju albo trybu po zapisaniu pierwszego wyniku jest blokowana, ponieważ unieważniłaby model tabeli, stron i ratingu.  
**LGE-08.** Każda zmiana uczestników musi zachować historyczne mecze graczy, którzy przestali być aktywnymi uczestnikami.  
**LGE-09.** Wartości konfiguracyjne użyte do obliczeń są wersjonowane lub zapisywane przy meczu, aby późniejsza edycja ustawień nie zmieniała po cichu historii.

## 8. Liga klasyczna

### 8.1. Generowanie puli meczów

Dla `n` uczestników/stron:

- bez rewanżów system tworzy `n × (n − 1) / 2` spotkań;
- z rewanżami system tworzy `n × (n − 1)` spotkań;
- przy nieparzystej liczbie uczestników jedna strona pauzuje w każdej kolejce;
- żadna strona nie występuje więcej niż raz w tej samej sugerowanej kolejce;
- rewanże trafiają do drugiej części harmonogramu i mają odwrócone oznaczenie stron.

W singlu uczestnikiem terminarza jest gracz. Dla klasycznego debla specyfikacja przyjmuje roboczo stałe pary jako uczestników round-robin; to założenie wymaga zatwierdzenia.

### 8.2. Znaczenie kolejki

Kolejka jest wyłącznie sugestią organizacyjną:

- system może wyróżnić najbliższą nieukończoną kolejkę;
- wynik dowolnego wygenerowanego meczu można wpisać w każdym momencie;
- zaległy mecz nie blokuje kolejnej kolejki;
- postęp ligi wynika z liczby zakończonych spotkań, nie z sekwencyjnego zamykania kolejek.

### 8.3. Dodawanie wyniku

W lidze klasycznej użytkownik wybiera istniejący, niezakończony mecz z wygenerowanej puli. System nie tworzy dodatkowego spotkania poza pulą i nie pozwala dwukrotnie zakończyć tego samego meczu.

### 8.4. Reguły funkcjonalne

**CLS-01.** Publikacja ligi generuje kompletną pulę spotkań.  
**CLS-02.** Każda para stron gra dokładnie raz albo dwa razy zależnie od ustawienia rewanżów.  
**CLS-03.** Generator tworzy deterministyczny, równomierny podział na kolejki.  
**CLS-04.** Numer kolejki nie jest sprawdzany jako warunek dodania wyniku.  
**CLS-05.** Mecz bez wyniku ma stan „do rozegrania”.  
**CLS-06.** Zapis poprawnego wyniku zmienia jego stan na „zakończony” i natychmiast wpływa na tabelę.  
**CLS-07.** Edycja wyniku natychmiast przelicza tabelę z aktualnych, nieusuniętych meczów.  
**CLS-08.** Miękkie usunięcie meczu wyklucza go z tabeli, ale zachowuje dane wyniku.  
**CLS-09.** System pokazuje liczbę wszystkich, rozegranych i pozostałych spotkań.

## 9. Liga nieskończona Elo

### 9.1. Charakter ligi

Liga nie ma wygenerowanych meczów ani końcowej liczby spotkań. Użytkownik po rozegraniu meczu:

1. otwiera ligę;
2. wybiera uczestników obu stron;
3. wprowadza format oraz wynik;
4. zapisuje mecz;
5. system aktualizuje ranking Elo.

Te same strony mogą grać ze sobą dowolną liczbę razy.

### 9.2. Rating startowy

Każdy gracz po dołączeniu do ligi otrzymuje `1000` punktów. Rating nie jest pobierany z profilu globalnego ani z innej ligi.

### 9.3. Obliczenie Elo

Dla singla:

```text
E_A = 1 / (1 + 10 ^ ((R_B - R_A) / 400))
delta_A = K × (S_A - E_A)
```

gdzie:

- `R_A`, `R_B` — ratingi przed meczem;
- `E_A` — oczekiwane prawdopodobieństwo wyniku strony A;
- `S_A` — `1` dla zwycięstwa i `0` dla porażki;
- `K` — parametr ligi;
- zmiana strony B ma przeciwny znak.

Wynik 2:0 i 2:1 ma taki sam wpływ na Elo; liczy się wyłącznie zwycięzca meczu.

Dla debla:

```text
R_A = (R_A1 + R_A2) / 2
R_B = (R_B1 + R_B2) / 2
```

Następnie stosuje się ten sam wzór. Każdy z dwóch graczy zwycięskiej strony otrzymuje taką samą dodatnią zmianę, a każdy z dwóch przegranych taką samą zmianę ujemną.

### 9.4. Historia i kolejność

- każdy mecz zapisuje rating przed, zmianę i rating po dla każdego gracza;
- kolejność obliczeń wynika z czasu rozegrania, a przy identycznym czasie z kolejności utworzenia rekordu;
- parametr K użyty przy obliczeniu jest zapisywany przy meczu/zdarzeniu ratingowym;
- bieżący ranking jest wynikiem wszystkich zakończonych, nieusuniętych meczów w kolejności chronologicznej.

### 9.5. Edycja historycznego meczu

Edycja wyniku, uczestników, czasu rozegrania albo usunięcie meczu może zmienić ratingi wszystkich późniejszych spotkań. Operacja:

1. zapisuje poprawiony mecz w transakcji;
2. zwiększa numer rewizji Elo ligi;
3. tworzy lub aktualizuje zadanie przeliczenia;
4. oznacza ranking jako „przeliczany”;
5. worker resetuje ratingi do 1000 i odtwarza wszystkie aktywne mecze ligi chronologicznie;
6. kompletne nowe ratingi i historia stają się widoczne atomowo;
7. liga wraca do stanu „aktualny” albo pokazuje błąd przeliczenia.

### 9.6. Reguły funkcjonalne

**ELO-01.** Liga nieskończona nie generuje terminarza.  
**ELO-02.** Mecz można utworzyć wyłącznie z aktywnych uczestników ligi.  
**ELO-03.** Każdy nowy uczestnik zaczyna od 1000.  
**ELO-04.** Parametr K jest wymagany i dodatni.  
**ELO-05.** Zapis pierwszego meczu aktualizuje wszystkie cztery lub dwa ratingi w jednej transakcji.  
**ELO-06.** Dla debla siłą strony jest średnia ratingów jej dwóch graczy.  
**ELO-07.** Każdy gracz strony otrzymuje tę samą wartość zmiany zespołowej.  
**ELO-08.** Ranking sortuje aktywnych uczestników malejąco według bieżącego ratingu.  
**ELO-09.** Edycja historyczna uruchamia asynchroniczne przeliczenie.  
**ELO-10.** W czasie przeliczenia interfejs pokazuje jednoznaczny stan i nie udaje, że ranking jest aktualny.  
**ELO-11.** Powtórzenie zadania nie może podwoić zmian ratingu.  
**ELO-12.** Awaria zadania nie publikuje częściowo przeliczonego rankingu.

## 10. Singiel i debel

### 10.1. Singiel

- każda strona ma jednego gracza;
- gracz nie może zagrać sam ze sobą;
- w klasycznej lidze każdy gracz jest stroną terminarza;
- w lidze Elo graczy wybiera się przy dodawaniu meczu.

### 10.2. Debel

- każda strona ma dokładnie dwóch różnych graczy;
- mecz zawiera czterech różnych graczy;
- Elo liczone jest indywidualnie na podstawie średniej strony;
- wszyscy czterej gracze otrzymują wpis historii ratingu;
- formularz pokazuje dwie wyraźnie oddzielone pary.

### 10.3. Robocze założenie dla klasycznego debla

Round-robin wymaga stabilnej definicji uczestnika. Do czasu decyzji biznesowej przyjmuje się:

- podczas tworzenia klasycznej ligi deblowej użytkownik buduje stałe pary z wybranych graczy;
- generator traktuje parę jak uczestnika tabeli i terminarza;
- jeden gracz może należeć do jednej aktywnej pary w danej lidze;
- tabela klasyfikuje pary;
- zmiana składu pary po zapisaniu wyniku jest blokowana.

Liga nieskończona deblowa nie wymaga stałych par: dowolnych czterech aktywnych uczestników można zestawić przy każdym meczu.

## 11. Reguły wyniku tenisowego

### 11.1. Reguła nadrzędna

Każdy mecz jest rozgrywany do dwóch wygranych setów:

- wynik meczu może wynosić wyłącznie `2:0` albo `2:1`;
- przy `2:0` mecz zawiera dokładnie dwa sety;
- przy stanie `1:1` wymagany jest trzeci set;
- po osiągnięciu dwóch wygranych setów nie można dodać kolejnego seta.

### 11.2. Pierwsze dwa sety

Przed meczem wybierany jest jeden wspólny format pierwszych dwóch setów.

#### Fast4

- set rozgrywany do 4 gemów;
- prawidłowe wyniki bez tie-breaka: `4:0`, `4:1`, `4:2` i odwrotne;
- przy `3:3` rozgrywany jest tie-break;
- końcowy wynik gemowy seta tie-breakowego to `4:3` albo `3:4`;
- małe punkty tie-breaka mogą być zapisane oddzielnie, jeśli formularz je zbiera;
- specyfikacja bazowa nie definiuje No-Ad ani zachowania letów serwisowych, więc MVP nie waliduje punktów wewnątrz gema.

#### Set normalny

- set rozgrywany do 6 gemów z przewagą dwóch;
- prawidłowe wyniki obejmują `6:0`–`6:4`, `7:5` oraz `7:6`;
- przy `6:6` rozgrywany jest tie-break do 7 punktów;
- małe punkty tie-breaka mogą być zapisane oddzielnie;
- wynik `6:5` nie kończy seta.

### 11.3. Trzeci set

Przy stanie 1:1 użytkownik wybiera:

1. **Super tie-break** — zapis małych punktów; zwycięzca osiąga co najmniej 10 punktów i przewagę dwóch, np. `10:8`, `12:10`;
2. **Pełny set Fast4** — walidacja jak w krótkim secie;
3. **Pełny set normalny** — walidacja jak w secie do sześciu gemów.

### 11.4. Struktura wyniku

Wynik nie jest zapisywany jako jeden tekst. Każdy set ma:

- numer porządkowy `1`, `2` lub `3`;
- rodzaj `GAME_SET` albo `SUPER_TIE_BREAK`;
- wariant `FAST4` albo `NORMAL` dla seta gemowego;
- wynik strony A;
- wynik strony B;
- opcjonalne małe punkty tie-breaka dla wyniku `4:3` lub `7:6`;
- wyliczonego zwycięzcę seta.

Przykład danych wejściowych:

```json
{
  "openingSetFormat": "NORMAL",
  "decidingSetFormat": "SUPER_TIE_BREAK",
  "sets": [
    { "order": 1, "kind": "GAME_SET", "sideA": 6, "sideB": 4 },
    { "order": 2, "kind": "GAME_SET", "sideA": 4, "sideB": 6 },
    { "order": 3, "kind": "SUPER_TIE_BREAK", "sideA": 10, "sideB": 8 }
  ]
}
```

### 11.5. Kontuzja i walkower

Zgodnie ze specyfikacją bazową system nie ma specjalnego stanu ani algorytmu dla kreczu, walkoweru lub przerwania. Użytkownik zapisuje spotkanie jako normalnie zakończony, matematycznie poprawny wynik. MVP nie przechowuje powodu ani znacznika takiego zdarzenia.

### 11.6. Reguły walidacji

**TEN-01.** Wynik jest walidowany po stronie klienta dla wygody i ponownie po stronie serwera jako źródło prawdy.  
**TEN-02.** Remis w secie jest niedozwolony.  
**TEN-03.** Pierwsze dwa sety muszą używać wybranego formatu otwierającego.  
**TEN-04.** Trzeci set jest dozwolony tylko przy stanie 1:1.  
**TEN-05.** Super tie-break jest dozwolony tylko jako set decydujący.  
**TEN-06.** Wartości wyniku są nieujemnymi liczbami całkowitymi.  
**TEN-07.** Zwycięzca meczu jest wyliczany z setów i nie jest wybierany ręcznie.  
**TEN-08.** Super tie-break liczy się jako wygrany/przegrany set, ale zero gemów.  
**TEN-09.** Błędny wynik nie jest częściowo zapisywany.  
**TEN-10.** Edycja korzysta z dokładnie tego samego walidatora co tworzenie.

## 12. Formularz meczowy

### 12.1. Pola wspólne

- liga — wynika z bieżącego widoku;
- data i czas rozegrania, domyślnie bieżące;
- strona A;
- strona B;
- format pierwszych dwóch setów: Fast4/normalny;
- pola wyniku pierwszego i drugiego seta;
- trzeci set dodawany warunkowo;
- format trzeciego seta: super tie-break/Fast4/normalny;
- pola wyniku trzeciego seta;
- zapis lub anulowanie.

### 12.2. Zachowanie w lidze klasycznej

- wybór stron wskazuje istniejący mecz do rozegrania;
- interfejs może filtrować listę po kolejce, ale pokazuje wszystkie niezakończone mecze;
- spotkanie z przyszłej kolejki jest dostępne bez ostrzeżenia blokującego;
- po zapisie użytkownik wraca do ligi z odświeżoną tabelą.

### 12.3. Zachowanie w lidze Elo

- użytkownik wybiera graczy/pary z aktywnej listy ligi;
- zapis tworzy nowy mecz;
- po zapisie ranking i historia są aktualizowane;
- powtórny mecz tych samych stron jest dozwolony.

### 12.4. Edycja

Formularz edycji wczytuje wszystkie zapisane dane. Przed zapisem pokazuje podsumowanie zmiany. W lidze Elo zmiana wpływająca na rating informuje, że ranking zostanie przeliczony asynchronicznie.

## 13. Tabela ligi klasycznej

### 13.1. Punktacja meczu

| Wynik | Punkty zwycięzcy | Punkty przegranego |
|---|---:|---:|
| 2:0 | 5 | 0 |
| 2:1 | 4 | 2 |

Punktacja jest stała i w MVP nie podlega konfiguracji.

### 13.2. Kolumny tabeli

- miejsce;
- gracz albo para;
- mecze rozegrane;
- zwycięstwa;
- porażki;
- punkty tabeli;
- sety wygrane;
- sety przegrane;
- bilans setów (`wygrane − przegrane`);
- gemy wygrane;
- gemy przegrane;
- bilans gemów (`wygrane − przegrane`).

### 13.3. Kolejność

1. większa liczba punktów tabeli;
2. większy bilans setów;
3. większy bilans gemów;
4. jeśli wszystkie wartości są równe, uczestnicy zajmują miejsce ex aequo; kolejność wyświetlania może być alfabetyczna, ale nie zmienia numeru miejsca.

Bezpośredni mecz nie jest kryterium, ponieważ nie występuje w aktualnej specyfikacji bazowej.

### 13.4. Zliczanie statystyk

- każdy set, w tym super tie-break, zwiększa licznik setów zwycięzcy i przegranego;
- tylko sety gemowe zwiększają liczniki gemów;
- super tie-break `10:8` nie dodaje dziesięciu i ośmiu gemów;
- wynik tie-breakowego seta Fast4 liczy się jako `4:3` w gemach;
- wynik tie-breakowego normalnego seta liczy się jako `7:6` w gemach;
- miękko usunięte mecze są pomijane;
- niezakończone mecze są pomijane.

Tabela jest read modelem wyliczanym z aktualnych meczów, a nie ręcznie edytowanym zbiorem wartości.

## 14. Ranking i historia Elo

### 14.1. Widok rankingu

Ranking pokazuje:

- miejsce;
- gracza;
- bieżący rating;
- liczbę meczów;
- zmianę po ostatnim meczu;
- trend z ostatnich spotkań;
- stan aktualności rankingu: aktualny/przeliczany/błąd.

### 14.2. Historia gracza w lidze

Każdy wpis zawiera:

- mecz;
- rating przed;
- oczekiwany wynik;
- wynik rzeczywisty;
- zastosowane K;
- zmianę;
- rating po;
- numer rewizji obliczeń.

### 14.3. Zaokrąglenie

W bazie rating oraz zmiana są przechowywane jako liczby całkowite. Wynik wzoru jest zaokrąglany deterministycznie do najbliższej liczby całkowitej. Dokładna reguła dla wartości `.5` wymaga zatwierdzenia i testu kontraktowego.

## 15. Statystyki

### 15.1. Statystyki gracza

Na podstawie wszystkich aktywnych meczów użytkownik widzi:

- liczbę rozegranych meczów;
- zwycięstwa i porażki;
- procent zwycięstw;
- sety wygrane i przegrane;
- bilans setów;
- gemy wygrane i przegrane;
- bilans gemów;
- liczbę rozegranych super tie-breaków i ich bilans;
- historię meczów;
- podział według ligi i trybu singiel/debel.

Rating Elo nie jest agregowany między ligami. Na profilu można pokazać osobną pozycję i rating dla każdej ligi Elo.

### 15.2. Statystyki ligi

- liczba uczestników;
- liczba wszystkich meczów;
- liczba zakończonych i pozostałych meczów w lidze klasycznej;
- procent realizacji ligi klasycznej;
- tabela albo ranking zależnie od rodzaju;
- lista ostatnich wyników.

### 15.3. Statystyki meczu

- strony i gracze;
- wynik setowy;
- wynik każdego seta;
- rodzaj każdego seta;
- suma gemów bez punktów super tie-breaka;
- zmiany Elo, jeśli jest to liga nieskończona;
- sugerowana kolejka, jeśli jest to liga klasyczna.

## 16. Soft delete

### 16.1. Reguła ogólna

Encje `Player`, `League` i `Match` mają pole `deletedAt`. Operacja usunięcia ustawia to pole w transakcji. Publiczna aplikacja nie udostępnia fizycznego kasowania.

### 16.2. Zachowanie zapytań

- zwykłe listy filtrują `deletedAt IS NULL`;
- selektory uczestników filtrują usuniętych graczy;
- tabela i ranking filtrują usunięte mecze;
- historyczne relacje nadal mogą odczytać usuniętego gracza;
- usunięcie ligi ukrywa ją z listy razem z jej widokami, ale dane pozostają w bazie;
- wewnętrzne przeliczenie Elo korzysta tylko z nieusuniętych meczów.

### 16.3. MikroORM

Domyślny filtr soft delete jest stosowany do zapytań głównych. Nie może zostać bezrefleksyjnie zastosowany do relacji historycznych, ponieważ odfiltrowanie usuniętego gracza nie może ukryć całego meczu. Repozytoria historyczne jawnie kontrolują filtry relacji.

## 17. Mapa ekranów

```text
/
├── /players
│   ├── /new
│   └── /[playerId]
│       └── /edit
└── /leagues
    ├── /new
    └── /[leagueId]
        ├── overview
        ├── matches
        ├── table          (liga klasyczna)
        ├── ranking        (liga Elo)
        ├── add-result
        ├── settings
        └── /matches/[matchId]/edit
```

### 17.1. Strona główna

- skróty do graczy i lig;
- aktywne ligi;
- ostatnie wyniki;
- przyciski „Dodaj gracza” i „Utwórz ligę”.

### 17.2. Szczegóły ligi

Nagłówek pokazuje nazwę, tenis, singiel/debel i klasyczna/Elo. Widoczne sekcje zależą od rodzaju ligi. Nie pokazuje się pustej zakładki tabeli w lidze Elo ani rankingu Elo w lidze klasycznej.

### 17.3. Wymagania UX

- interfejs responsywny od szerokości telefonu;
- pola wyniku przystosowane do klawiatury numerycznej;
- komunikaty błędu wskazują konkretny set i regułę;
- przycisk zapisu jest zablokowany podczas wysyłania;
- ponowienie żądania nie tworzy podwójnego meczu;
- operacje usunięcia wymagają potwierdzenia i wyjaśniają soft delete;
- stan przeliczania Elo jest widoczny na liście i w szczegółach ligi.

## 18. Architektura techniczna

### 18.1. Styl architektury

Rekomendowany jest **modularny monolit**:

- jedna aplikacja Next.js;
- jeden model domenowy;
- jedna baza PostgreSQL;
- jeden osobny proces workera Elo korzystający z tego samego kodu domenowego;
- brak mikroserwisów i zewnętrznego brokera wiadomości w MVP.

### 18.2. Next.js

- App Router;
- TypeScript w trybie strict;
- Server Components jako domyślne komponenty stron i odczytów;
- Client Components tylko dla interaktywnego formularza wyniku, uploadu i lokalnego stanu UI;
- Server Actions do mutacji wykonywanych z formularzy;
- Route Handler do uploadu/odczytu awatara oraz opcjonalnego health checku;
- runtime Node.js, nie Edge, ze względu na sterownik PostgreSQL i MikroORM;
- brak static export, ponieważ aplikacja wymaga zapisu do bazy;
- po mutacji kontrolowana rewalidacja ścieżek ligi, gracza i list.

Strony serwerowe korzystają bezpośrednio z warstwy aplikacyjnej. Nie wykonują zapytań HTTP do własnych Route Handlerów, co usuwa zbędny round-trip.

### 18.3. MikroORM

- sterownik PostgreSQL;
- pojedyncza inicjalizacja ORM na proces;
- osobny `EntityManager`/request context dla każdego żądania, Server Action i zadania workera;
- encje oddzielone od komponentów Next.js;
- jawne transakcje dla zapisu meczu, ratingu i zadań przeliczenia;
- migracje schematu utrzymywane w repozytorium;
- uruchamianie migracji jako osobny krok wdrożenia, nie przypadkowo z każdego procesu aplikacji;
- domyślne filtry soft delete kontrolowane przez repozytoria.

### 18.4. PostgreSQL

- klucze główne UUID;
- `timestamptz` dla wszystkich znaczników czasu;
- klucze obce dla integralności relacji;
- `NOT NULL`, `CHECK` i `UNIQUE` tam, gdzie reguła jest lokalna dla wiersza;
- transakcje dla operacji wieloetapowych;
- indeksy częściowe dla aktywnych rekordów z `deleted_at IS NULL`;
- kolejka przeliczeń Elo w tabeli PostgreSQL;
- blokada jednego aktywnego przeliczenia na ligę.

### 18.5. Uzasadnienie technologiczne

Next.js App Router udostępnia Server Components, Server Functions i Route Handlery. MikroORM dokumentuje integrację z Next.js przez singleton połączenia oraz izolowany request context. Jego migracje SQL są domyślnie wykonywane transakcyjnie, a filtry mogą obsłużyć soft delete. PostgreSQL zapewnia transakcje all-or-nothing i constraints wymuszające integralność. Źródła:

- [Next.js — App Router](https://nextjs.org/docs/app)
- [Next.js — Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Next.js — mutacje danych](https://nextjs.org/docs/app/getting-started/mutating-data)
- [MikroORM — Next.js](https://mikro-orm.io/docs/usage-with-nextjs)
- [MikroORM — Request Context](https://mikro-orm.io/docs/identity-map)
- [MikroORM — migracje](https://mikro-orm.io/docs/migrations)
- [MikroORM — filtry](https://mikro-orm.io/docs/filters)
- [PostgreSQL — transakcje](https://www.postgresql.org/docs/18/tutorial-transactions.html)
- [PostgreSQL — constraints](https://www.postgresql.org/docs/18/ddl-constraints.html)

## 19. Moduły aplikacji

```text
src/
├── app/                    # routing, strony, layouty, actions
├── modules/
│   ├── players/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── leagues/
│   ├── matches/
│   ├── tennis/
│   ├── standings/
│   └── elo/
├── db/                     # konfiguracja ORM, migracje, fabryka contextu
├── shared/                 # błędy, identyfikatory, walidacja, czas
└── workers/elo/            # proces asynchronicznego przeliczania
```

Zależności:

- `players` nie zależy od lig;
- `leagues` odwołuje się do graczy i sportu;
- `matches` przechowuje wspólny model stron;
- `tennis` waliduje i interpretuje wynik tenisowy;
- `standings` liczy tabelę tylko dla ligi klasycznej;
- `elo` liczy rating tylko dla ligi nieskończonej;
- warstwa domenowa nie importuje Next.js ani komponentów React.

## 20. Model rozszerzalności sportów

### 20.1. Rdzeń wspólny

Wspólne pozostają:

- `Sport`;
- `Player`;
- `League`;
- `LeagueParticipant`;
- `Match`;
- `MatchSide`;
- `MatchSidePlayer`;
- soft delete i znaczniki czasu.

### 20.2. Moduł sportu

Każdy sport dostarcza implementacje kontraktów:

```text
ScoreValidator
MatchWinnerResolver
StatisticsProjector
StandingsStrategy
RatingStrategy
```

MVP rejestruje wyłącznie moduł `TENNIS`. Nie implementuje dynamicznego systemu pluginów. Dodanie sportu w przyszłości polega na dodaniu modułu i sportowych tabel wyniku, bez zmiany istniejących rekordów tenisowych.

### 20.3. Dane sportowe

Rdzeń meczu nie otrzymuje kolumn `set1`, `set2` ani `superTieBreak`. Dane tenisowe są w osobnych encjach `TennisMatchRules` i `TennisSet`. Kolejny sport może dostać własne encje segmentów zamiast wciskać dane do tenisowych pól albo niezweryfikowanego tekstu.

## 21. Model danych PostgreSQL

### 21.1. Tabele

| Tabela | Najważniejsze pola | Uwagi |
|---|---|---|
| `sports` | `id`, `code`, `name` | seed `TENNIS`; kod unikalny |
| `players` | `id`, `first_name`, `last_name`, `nickname`, `created_at`, `updated_at`, `deleted_at` | globalny gracz |
| `player_avatars` | `player_id`, `mime_type`, `bytes`, `updated_at` | opcjonalny rekord 1:1 |
| `leagues` | `id`, `sport_id`, `name`, `kind`, `game_mode`, `has_return_legs`, `elo_k`, `status`, `elo_revision`, `elo_state`, znaczniki czasu | constraints zależne od rodzaju |
| `league_players` | `id`, `league_id`, `player_id`, `current_elo`, `joined_at`, `deleted_at` | unikalne aktywne członkostwo |
| `league_teams` | `id`, `league_id`, `display_name`, `deleted_at` | tylko klasyczny debel |
| `league_team_players` | `team_id`, `player_id`, `position` | dokładnie dwie osoby |
| `matches` | `id`, `league_id`, `status`, `round_number`, `leg_number`, `played_at`, `fixture_key`, `result_version`, `created_at`, `updated_at`, `deleted_at` | rekord wspólny |
| `match_sides` | `id`, `match_id`, `side_number` | dokładnie strony 1 i 2 |
| `match_side_players` | `side_id`, `player_id`, `position` | 1 albo 2 osoby zależnie od ligi |
| `tennis_match_rules` | `match_id`, `opening_set_format`, `deciding_set_format` | snapshot formatu meczu |
| `tennis_sets` | `id`, `match_id`, `set_order`, `kind`, `format`, `side_1_score`, `side_2_score`, opcjonalne punkty tie-breaka | wynik strukturalny |
| `elo_rating_events` | `id`, `league_id`, `match_id`, `player_id`, `rating_before`, `expected_score`, `actual_score`, `k_factor`, `delta`, `rating_after`, `revision` | historia obliczeń |
| `elo_recalculation_jobs` | `id`, `league_id`, `requested_revision`, `status`, `attempts`, `error`, `created_at`, `started_at`, `finished_at` | kolejka PostgreSQL |

### 21.2. Kluczowe constraints

- `sports.code` unikalne;
- unikalne aktywne członkostwo `(league_id, player_id)`;
- `match_sides`: unikalne `(match_id, side_number)` i `side_number IN (1,2)`;
- `match_side_players`: gracz unikalny w obrębie meczu;
- `tennis_sets`: unikalne `(match_id, set_order)` i `set_order BETWEEN 1 AND 3`;
- wynik seta nieujemny;
- `elo_k > 0` dla ligi Elo;
- `current_elo` obecne tylko dla aktywnego uczestnika ligi Elo;
- klasyczna liga wymaga `has_return_legs`, a liga Elo wymaga `elo_k`;
- `round_number` wymagany dla wygenerowanego meczu klasycznego i pusty dla ligi Elo;
- częściowy unikalny indeks `fixture_key` w aktywnych meczach klasycznych zapobiega duplikatom.

Reguły wymagające odczytu wielu tabel — np. liczba graczy strony zgodna z trybem ligi — są dodatkowo sprawdzane w serwisie domenowym w tej samej transakcji.

### 21.3. Indeksy

- aktywni gracze po pseudonimie i nazwisku;
- aktywne ligi po rodzaju i dacie utworzenia;
- mecze po `league_id`, `status`, `round_number`;
- zakończone mecze Elo po `league_id`, `played_at`, `created_at`;
- historia Elo po `(league_id, player_id, match_id)`;
- jedno aktywne zadanie przeliczenia na ligę przez częściowy indeks dla statusów `PENDING/RUNNING`;
- wszystkie główne listy z warunkiem `deleted_at IS NULL`.

## 22. Warstwa aplikacyjna

### 22.1. Komendy

```text
CreatePlayer
UpdatePlayer
SoftDeletePlayer
SetPlayerAvatar

CreateLeague
UpdateLeague
SetLeagueParticipants
GenerateClassicSchedule
SoftDeleteLeague

RecordClassicMatchResult
CreateInfiniteLeagueMatch
UpdateMatchResult
SoftDeleteMatch

RecalculateLeagueElo
```

### 22.2. Zapytania

```text
ListPlayers
GetPlayerProfile
ListLeagues
GetLeagueOverview
ListLeagueMatches
GetClassicStandings
GetEloRanking
GetPlayerStatistics
GetMatchDetails
```

### 22.3. Transakcje

W jednej transakcji wykonywane są co najmniej:

- utworzenie ligi, uczestników/par oraz harmonogramu;
- zapis meczu z dwiema stronami, uczestnikami, regułami i setami;
- bezpośrednia aktualizacja Elo po dodaniu najnowszego meczu;
- edycja meczu oraz utworzenie zadania przeliczenia;
- soft delete meczu oraz utworzenie zadania przeliczenia;
- publikacja kompletnej nowej rewizji rankingu.

## 23. Server Actions i Route Handlery

### 23.1. Server Actions

Server Actions obsługują formularze gracza, ligi i meczu. Każda akcja:

1. przyjmuje dane wejściowe;
2. waliduje schemat transportowy;
3. tworzy izolowany kontekst MikroORM;
4. wywołuje komendę warstwy aplikacyjnej;
5. mapuje błąd domenowy na komunikat formularza;
6. rewaliduje właściwe ścieżki;
7. zwraca wynik bez ujawniania stosu lub danych bazy.

Brak logowania nie zwalnia z walidacji — Server Actions są osiągalne przez żądania sieciowe.

### 23.2. Route Handlery

Minimalny zestaw:

- `POST /api/players/:id/avatar` — walidacja typu, rozmiaru i zapis awatara;
- `GET /api/players/:id/avatar` — zwrot obrazu z właściwym `Content-Type` i cache headers;
- `GET /api/health` — opcjonalna kontrola procesu i połączenia z bazą.

Nie tworzy się równoległego REST API dla operacji używanych wyłącznie przez serwerowe strony i formularze MVP.

## 24. Worker przeliczenia Elo

### 24.1. Proces

Worker działa jako osobny proces Node.js z tego samego repozytorium. Cyklicznie pobiera oczekujące zadanie, blokując je przez mechanizm PostgreSQL pozwalający uniknąć równoległego wykonania tego samego przeliczenia.

### 24.2. Algorytm

1. Pobierz zadanie `PENDING` i oznacz `RUNNING`.
2. Zablokuj logicznie ligę na czas publikacji rewizji.
3. Pobierz aktywnych uczestników i ustaw roboczo 1000.
4. Pobierz wszystkie zakończone, nieusunięte mecze chronologicznie.
5. Przelicz każde spotkanie oraz robocze zdarzenia ratingowe.
6. Jeżeli rewizja ligi zmieniła się podczas pracy, odrzuć wynik i ponów dla najnowszej rewizji.
7. W transakcji zastąp aktywną historię i bieżące ratingi.
8. Oznacz zadanie `DONE` i ligę `CURRENT`.
9. Przy błędzie wycofaj transakcję, zapisz błąd oraz pozostaw poprzednią kompletną rewizję.

### 24.3. Własności

- idempotentność;
- tylko jeden aktywny worker na ligę;
- możliwość ponowienia po awarii;
- brak częściowo opublikowanych wyników;
- koalescencja wielu szybkich edycji do najnowszej rewizji;
- widoczny status w interfejsie.

## 25. Obsługa błędów i współbieżność

### 25.1. Błędy domenowe

Przykładowe stabilne kody:

```text
PLAYER_NOT_FOUND
LEAGUE_NOT_FOUND
MATCH_NOT_FOUND
PLAYER_DELETED
PLAYER_NOT_IN_LEAGUE
INVALID_SIDE_SIZE
DUPLICATE_MATCH_PLAYER
INVALID_TENNIS_SCORE
MATCH_ALREADY_COMPLETED
STRUCTURAL_LEAGUE_CHANGE_FORBIDDEN
ELO_RECALCULATION_FAILED
```

### 25.2. Optymistyczna współbieżność

Gracz, liga i mecz mają wersję lub `updatedAt`. Formularz edycji wysyła odczytaną wersję. Jeżeli inna osoba zmieniła rekord wcześniej, system odrzuca nadpisanie i prosi o odświeżenie. Jest to szczególnie ważne przy otwartym dostępie.

### 25.3. Idempotentność

- dwukrotne kliknięcie zapisu nie tworzy dwóch meczów;
- ponowione przeliczenie tej samej rewizji daje ten sam ranking;
- ponowiony soft delete pozostawia rekord usunięty bez efektów ubocznych;
- generator terminarza nie tworzy drugiej puli dla tej samej opublikowanej konfiguracji.

## 26. Wymagania niefunkcjonalne

### 26.1. Integralność

- cała logika sportowa działa po stronie serwera;
- obliczonego zwycięzcy, tabeli i ratingu nie przyjmuje się bezpośrednio z klienta;
- constraints bazy stanowią drugą linię ochrony;
- migracje są wersjonowane;
- kopia bazy umożliwia odzyskanie danych ukrytych przez soft delete.

### 26.2. Wydajność

- listy są stronicowane po przekroczeniu rozsądnej liczby rekordów;
- zapytania tabeli i rankingu nie wykonują zapytania osobno dla każdego uczestnika;
- historia meczów jest indeksowana i stronicowana;
- przeliczenie Elo nie blokuje odpowiedzi HTTP;
- status przeliczenia może być odświeżany okresowo bez WebSocketów.

### 26.3. Dostępność interfejsu

- semantyczne formularze i etykiety;
- pełna obsługa klawiaturą;
- widoczny fokus;
- komunikaty błędów powiązane z polami;
- kontrast i responsywność kluczowych ekranów;
- tabele posiadają nagłówki i alternatywny widok kart na małych ekranach.

### 26.4. Obserwowalność

- strukturalne logi błędów Server Actions i workera;
- identyfikator żądania i zadania;
- metryki liczby oraz czasu zadań Elo;
- alert/log dla zadania w stanie `FAILED`;
- brak danych binarnych awatara i pełnych payloadów formularzy w logach.

## 27. Strategia testów

### 27.1. Testy jednostkowe domeny

Najwyższy priorytet:

- walidator Fast4;
- walidator normalnego seta;
- walidator super tie-breaka;
- rozstrzygnięcie meczu 2:0 i 2:1;
- wykluczenie punktów super tie-breaka z gemów;
- punktacja tabeli 5/0 i 4/2;
- sortowanie po punktach, setach i gemach;
- generator round-robin dla parzystej i nieparzystej liczby uczestników;
- generator rewanżów;
- Elo singlowe;
- Elo deblowe ze średnią stron;
- deterministyczne odtworzenie historii po edycji.

### 27.2. Testy integracyjne z PostgreSQL

- constraints i relacje;
- transakcyjny zapis pełnego meczu;
- soft delete i filtry historycznych relacji;
- częściowe indeksy unikalne;
- migracje od pustej bazy;
- pobieranie i blokowanie zadań workera;
- rollback nieudanego przeliczenia;
- konkurencyjna edycja tego samego meczu.

### 27.3. Testy end-to-end

1. Dodanie graczy → utworzenie ligi klasycznej → harmonogram → wynik → tabela.
2. Wpisanie wyniku z przyszłej kolejki mimo zaległego meczu.
3. Liga Elo → dwa mecze → edycja pierwszego → stan „przeliczany” → poprawny ranking.
4. Debel Elo → czterech graczy → identyczna zmiana dla członków jednej strony.
5. Wynik z super tie-breakiem nie zawyża gemów.
6. Soft delete meczu usuwa go z tabeli/rankingu, ale zachowuje rekord.
7. Dwie równoległe próby zapisu nie tworzą duplikatu.

## 28. Kryteria akceptacji MVP

### 28.1. Gracze

- można dodać gracza z danymi bazowymi i bez awatara;
- tego samego gracza można przypisać do wielu lig;
- miękkie usunięcie ukrywa go z nowych selektorów;
- wcześniejsze mecze nadal pokazują jego dane.

### 28.2. Liga klasyczna

- dla 6 singlistów bez rewanżów powstaje 15 meczów;
- dla 6 singlistów z rewanżami powstaje 30 meczów;
- żaden gracz nie występuje dwukrotnie w jednej sugerowanej kolejce;
- można zapisać wynik meczu z dowolnej kolejki;
- wynik 2:0 przyznaje 5 i 0 punktów;
- wynik 2:1 przyznaje 4 i 2 punkty;
- remis punktowy jest rozstrzygany kolejno bilansem setów i gemów;
- super tie-break zmienia bilans setów, lecz nie gemów.

### 28.3. Liga Elo

- liga startuje bez meczów;
- każdy uczestnik zaczyna z ratingiem 1000;
- przy równych ratingach i `K=32` zwycięzca singla otrzymuje około `+16`, a przegrany `−16`, zgodnie z regułą zaokrąglenia;
- w równym deblu każdy zwycięzca otrzymuje tę samą dodatnią zmianę, a każdy przegrany tę samą ujemną;
- drugi mecz korzysta z ratingów po pierwszym;
- edycja pierwszego meczu przelicza wszystkie późniejsze zdarzenia;
- podczas przeliczenia UI nie pokazuje rankingu jako aktualnego;
- awaria nie publikuje częściowych ratingów.

### 28.4. Wynik

- poprawny mecz 2:0 i 2:1 można zapisać;
- nie można zapisać 1:1 ani 3:0;
- Fast4 akceptuje `4:3`, ale odrzuca `3:3` jako wynik końcowy;
- normalny set akceptuje `7:6`, ale odrzuca `6:6` jako wynik końcowy;
- super tie-break `10:8` jest akceptowany i nie zwiększa gemów;
- super tie-break `10:9` jest odrzucany;
- zwycięzca wynika z setów;
- wynik jest zapisany strukturalnie i może zostać ponownie otwarty do edycji.

### 28.5. Usuwanie

- usunięcie gracza, ligi i meczu ustawia `deletedAt`;
- żaden publiczny przepływ MVP nie wykonuje fizycznego usunięcia;
- usunięty mecz jest pomijany w tabeli i rankingu;
- usunięcie historycznego meczu Elo uruchamia przeliczenie.

## 29. Kolejność implementacji

1. Fundament Next.js, MikroORM, PostgreSQL, migracje i seed sportu `TENNIS`.
2. Globalni gracze, awatar i soft delete.
3. Tworzenie lig oraz członkostwa.
4. Model wspólnego meczu i tenisowy model setów.
5. Walidator oraz formularz wyniku.
6. Liga klasyczna, generator i tabela.
7. Liga nieskończona i synchroniczne dodanie najnowszego meczu Elo.
8. Kolejka PostgreSQL, worker i historyczne przeliczenie Elo.
9. Profile, statystyki i historia.
10. Testy end-to-end, obsługa współbieżności i hardening otwartych mutacji.

## 30. Otwarte decyzje przed implementacją

### P0 — wpływają na model danych lub algorytm

1. **Klasyczny debel:** czy uczestnikami ligi są stałe pary? Dokument przyjmuje ten wariant roboczo, bo bez niego „każdy z każdym” nie ma jednoznacznej definicji.
2. **Fast4:** czy zbieramy małe punkty tie-breaka przy 3:3? Czy obowiązuje No-Ad i granie serwisu po lecie? Specyfikacja bazowa tego nie określa.
3. **Normalny set:** czy set zawsze dopuszcza `7:5`, czy przy 6:6 zawsze kończy go standardowy tie-break do 7? Dokument zakłada obie klasyczne reguły.
4. **K dla Elo:** jaka jest wartość domyślna i dozwolony zakres? Dokument wymaga tylko wartości dodatniej.
5. **Zaokrąglenie Elo:** jak traktujemy dokładnie `.5` i czy dopuszczamy rating ujemny?
6. **Zmiana K:** czy zmiana działa tylko dla nowych meczów, czy przelicza całą historię? Dokument rekomenduje snapshot K per mecz i brak retroakcji.
7. **Kolejność Elo:** czy data rozegrania jest obowiązkowa? Dokument domyślnie używa daty rozegrania, a następnie kolejności utworzenia.
8. **Zmiana uczestników ligi klasycznej:** czy jest dozwolona po wygenerowaniu terminarza lub pierwszym wyniku?

### P1 — wpływają głównie na interfejs

9. Czy imię, nazwisko i pseudonim są wszystkie obowiązkowe?
10. Czy pseudonim musi być unikalny globalnie?
11. Jakie formaty i maksymalny rozmiar awatara akceptujemy?
12. Czy zakończenie ligi klasycznej następuje automatycznie po wpisaniu wszystkich wyników?
13. Czy potrzebny jest ekran pokazujący miękko usunięte rekordy, czy odzyskanie odbywa się wyłącznie w bazie?
14. Czy tabela ex aequo ma pokazywać ten sam numer miejsca?

## 31. Śledzenie zgodności ze specyfikacją bazową

| Wymaganie bazowe | Pokrycie |
|---|---|
| Otwarty dostęp bez logowania i ról | sekcje 3, 5, 23, 25 |
| Soft delete | sekcje 6, 7, 16, 21, 28 |
| Gotowość na wiele sportów | sekcje 4, 18–21 |
| Globalna baza graczy | sekcje 6 i 21 |
| Singiel/debel | sekcje 7 i 10 |
| Liga klasyczna z rewanżami i kolejkami | sekcja 8 |
| Kolejki nie blokują wyników | sekcje 8 i 12 |
| Liga nieskończona | sekcja 9 |
| Best of 3 i dwa formaty setów | sekcja 11 |
| Super tie-break lub pełny trzeci set | sekcja 11.3 |
| Strukturalny wynik | sekcje 11.4 i 21 |
| Punktacja 5/0 oraz 4/2 | sekcja 13 |
| Tie-break tabeli: sety, potem gemy | sekcja 13.3 |
| Start Elo 1000 i konfigurowalne K | sekcja 9 |
| Średnia Elo pary deblowej | sekcje 9.3 i 10 |
| Asynchroniczne przeliczenie po edycji | sekcje 9.5 i 24 |
| Jednolity formularz wyniku | sekcja 12 |
| Turnieje poza zakresem | sekcja 3.2 |

