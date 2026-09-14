# Specyfikacja Biznesowa i Funkcjonalna Aplikacji Sportowej "Low On Legs" (LOL)

## Wprowadzenie i Cel Aplikacji
**Low On Legs (LOL)** to wszechstronna aplikacja stworzona do zarządzania amatorskimi i towarzyskimi rozgrywkami sportowymi. Jej głównym założeniem jest modułowość – docelowo system ma stanowić platformę dla wielu różnych dyscyplin sportowych. Każda z obsługiwanych dyscyplin będzie posiadać własne, specyficzne zasady punktacji, elastyczne formaty meczów oraz dedykowane systemy rankingowe.

**Obecna faza projektu (MVP):** 
Na obecnym etapie aplikacja skupia się w 100% na kompleksowej obsłudze **Tenisa Ziemnego**. Architektura bazy danych i logiki biznesowej jest jednak celowo "otwarta" – została zaprojektowana tak, aby w przyszłości bezboleśnie rozszerzyć system o kolejne sporty (np. tenis stołowy czy padel) bez modyfikowania i psucia historycznych danych.

---

## 1. Założenia ogólne i Baza graczy
* **Otwarty dostęp (Brak systemu uprawnień):** Wersja MVP aplikacji nie posiada systemu ról (brak podziału na administratorów i zwykłych użytkowników) ani konieczności logowania. Każda osoba, która wejdzie na stronę, ma pełen dostęp do wszystkich funkcji: może dowolnie przeglądać statystyki, dodawać nowych graczy, tworzyć ligi, a także wprowadzać i edytować wyniki meczów. Ze względu na ten otwarty model, wszelkie akcje usuwania (gracza, ligi, meczu) muszą być realizowane w bazie danych jako tzw. Soft Delete (ukrycie rekordu, bez fizycznego kasowania), aby zapobiec przypadkowej lub złośliwej utracie danych.
* **Gotowość na nowe sporty (Future-Proofing):** System od początku musi wiedzieć, jakiego sportu dotyczy dany mecz/liga, aby prawidłowo dobrać formularz wyników i algorytmy przeliczania tabel.
* **Jedna wspólna baza graczy:** Gracze dodawani są do systemu globalnie (Imię, nazwisko, pseudonim oraz możliwość wgrania awatara). Raz dodany gracz staje się częścią globalnego rejestru i może być przypisywany do wielu różnych lig w dowolnych dyscyplinach. 

## 2. Zarządzanie ligami i tryby gry

Aby utworzyć nową ligę, użytkownik musi zdefiniować następujące parametry:

* **Tryb gry:** Singiel lub Debel.
* **Uczestnicy:** Wybór graczy z globalnej listy.
* **Model par deblowych:**
    * W Lidze Klasycznej pary są stałe. Zespoły tworzy się przy zakładaniu ligi i jako takie figurują w tabeli oraz harmonogramie.
    * W Lidze Nieskończonej nie ma stałych par. Przy każdym meczu dowolnych czterech uczestników ligi można zestawić w dwie pary, a ranking pozostaje indywidualny.
* **Format rozgrywek (dwa warianty do wyboru):**
    1. **Liga Klasyczna (Round-Robin):** Gra "każdy z każdym". Przy tworzeniu zaznaczamy, czy liga ma być z rewanżami (każdy gra z każdym dwa razy). System od razu generuje pełną pulę meczów do rozegrania i układa je w **proponowany harmonogram (kolejki)**. Harmonogram ten ma pomóc w równomiernym rozgrywaniu ligi przez wszystkich uczestników. Jest on jednak wyłącznie sugestią – **system nie wymusza i nie blokuje** wprowadzania wyników z "przyszłych" kolejek. Dzięki temu, jeśli ktoś wyjedzie na urlop lub złapie kontuzję, pozostali gracze mogą bez przeszkód grać swoje mecze, nie wstrzymując działania całej ligi. Po wygenerowaniu terminarza nie można dodać do ligi nowego gracza ani zmienić składu stałej pary.
    2. **Liga Nieskończona (Ranking ELO):** Brak z góry wygenerowanych meczów. Liga działa ad-hoc – gracze umawiają się na mecz, grają i wpisują wynik do systemu. Nowi gracze mogą dołączać w dowolnym momencie i rozpoczynają z ratingiem 1000.

## 3. Logika punktacji i wprowadzanie wyników (Tenis Ziemny)

Mecze zawsze gramy do 2 wygranych setów (Best of 3). (Przypadki niedokończenia meczu z powodu kontuzji lub walkowera nie wymagają specjalnej logiki – wprowadzamy je do systemu jako normalnie zakończone wyniki). Formularz wprowadzania wyników musi być elastyczny i pozwalać na różne ustalenia na korcie:

* **Długość standardowego seta (do wyboru przed meczem):**
    * **Sety krótkie (Fast4):** Gramy do 4 gemów (wygrana np. 4:1, 4:2, a przy stanie 3:3 jest tie-break). W systemie zapisujemy wyłącznie końcowy wynik w gemach, np. 4:3; nie zapisujemy małych punktów tego tie-breaka.
    * **Sety normalne:** Gramy do 6 gemów z klasyczną przewagą dwóch gemów, dlatego poprawny jest wynik 7:5. Przy 6:6 zawsze rozgrywany jest tie-break, a wynik seta zapisujemy jako 7:6; nie zapisujemy jego małych punktów.
* **Zasady kortowe:** Aplikacja jest notatnikiem końcowych wyników i nie rejestruje zasad punkt po punkcie, takich jak No-Ad albo zachowanie piłki po lecie serwisowym.
* **Format 3. seta (decydującego przy stanie 1:1 w setach):**
    * Może to być **Super Tie-Break** (wprowadzamy małe punkty, np. 10:8). Małe punkty można zapisać wyłącznie wtedy, gdy trzeci set został jawnie oznaczony jako Super Tie-Break.
    * Może to być **pełen set** (do 4 lub do 6 gemów).
* **Wymagania dla zapisu wyników:** System nie może traktować wyniku jako prostej zmiennej tekstowej (np. "6:4, 4:6, 10:8"). Wyniki muszą być logicznie rozbite na poszczególne sety, gemy i informację, czy dany set był zwykłym setem czy super tie-breakiem. Jest to niezbędne do poprawnego wyliczania zaawansowanych statystyk.

## 4. Tabele, Statystyki i System ELO

* **W Lidze Klasycznej (Round-Robin):** 
  Tabela generuje się automatycznie na podstawie rozegranych meczów. Punktacja za poszczególne mecze jest stała i wynosi:
  * **Wygrana 2:0** – zwycięzca otrzymuje **5 pkt**, przegrany **0 pkt**.
  * **Wygrana 2:1** – zwycięzca otrzymuje **4 pkt**, przegrany **2 pkt**.
  
  Tabela musi dodatkowo uwzględniać statystyki pomocnicze:
  * Liczbę rozegranych meczów
  * Bilans wygranych do przegranych setów
  * Bilans wygranych do przegranych gemów
  * *Zasada remisów:* W przypadku takiej samej liczby punktów o miejscu w tabeli decyduje w pierwszej kolejności bilans setów, a później bilans gemów.

* **W Lidze Nieskończonej (Ranking ELO):**
  * **Start:** Poziom bazowy (startowy) dla każdego gracza w nowej lidze wynosi **1000 punktów**.
  * **Konfigurowalny parametr K:** Domyślna wartość wynosi `K = 32`, a dozwolony zakres ustawienia ligi to od `10` do `60`. Zmiana K działa wyłącznie dla meczów wprowadzonych po zmianie. Każdy mecz zachowuje snapshot użytej wartości K; historia nie jest przeliczana z powodu samej zmiany K.
  * **Zaokrąglanie i dolna granica:** Zmianę punktów zaokrągla się matematycznie do pełnej liczby, a połówki od zera (np. `+15,5 → +16`, `−15,5 → −16`). Rating gracza nigdy nie może spaść poniżej **500**.
  * **Specyfika Debla:** W przypadku meczu deblowego system najpierw wylicza średnią punktów ELO dla obu graczy w Parze A oraz średnią dla Pary B. Na tej podstawie określa faworyta i wylicza ostateczną zmianę punktową. Wyliczona wartość (np. +15 punktów) jest następnie dopisywana lub odejmowana indywidualnie każdemu z 4 graczy biorących udział w meczu.
  * **Kolejność meczów:** Użytkownik nie podaje daty rozegrania. System przy pierwszym zapisaniu wyniku nadaje nieedytowalny czas `resultRecordedAt`, który jest prezentowany jako data rozegrania i wyznacza kolejność meczu. Jest to istotne zwłaszcza dla meczów Ligi Klasycznej, których rekordy powstają wcześniej podczas generowania terminarza.
  * **Edycja wyników (Przeliczanie historii):** Ponieważ każdy może edytować wynik meczu, zmiana danych w meczu historycznym musi automatycznie i asynchronicznie wymusić przeliczenie rankingu ELO od nowa dla wszystkich późniejszych spotkań w danej lidze, zgodnie z systemową kolejnością pierwszego zapisu wyników i snapshotem K każdego meczu.

## 5. Interfejs wprowadzania wyników (Formularz meczowy)

Po wejściu w widok szczegółów konkretnej ligi, użytkownik musi mieć dostęp do intuicyjnego formularza dodawania rozegranego meczu:

* **Wybór zawodników:** W pierwszej kolejności należy wskazać z listy rozwijanej (lub wyszukiwarki) graczy/pary, którzy rozegrali spotkanie.
* **Wprowadzanie setów:** Formularz musi posiadać osobne pola numeryczne dla wyniku każdego seta (Gospodarz vs Gość).
* **Przełącznik formatu decydującego seta:** Ze względu na specyfikę opisaną w punkcie 3, formularz musi pozwalać użytkownikowi na zdefiniowanie, w jakim formacie rozegrano trzeciego seta (np. poprzez przełącznik/checkbox: "Super Tie-break" / "Zwykły set"). 
* **Brak ręcznej daty meczu:** Formularz nie zawiera pola daty. Czas pierwszego zapisania wyniku jest automatycznie zapisywany przez system jako `resultRecordedAt` i używany jako data rozegrania; późniejsza edycja wyniku nie zmienia tej wartości.
* **Ochrona statystyk:** Rozróżnienie to jest kluczowe dla logiki systemowej. Aplikacja musi wiedzieć, że wartości np. "10:8" z Super Tie-breaka to małe punkty, a nie pełne gemy. Dzięki temu statystyki w Tabeli Klasycznej (bilans gemów) nie zostaną sztucznie zawyżone i sfałszowane. 
* **Spójność danych:** W przypadku Ligi Nieskończonej (Ranking ELO) szczegółowy bilans gemów ma drugorzędne znaczenie dla algorytmu, jednak aplikacja powinna zbierać te dane w identyczny sposób (dla zachowania czytelnej historii meczów i jednolitości interfejsu).

## 6. TODO

## 7. Out of scope
- Tworzenie turniejów
