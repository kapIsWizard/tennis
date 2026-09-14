# Specyfikacja Biznesowa i Funkcjonalna Aplikacji Sportowej "Low On Legs" (LOL)

## Wprowadzenie i Cel Aplikacji
**Low On Legs (LOL)** to wszechstronna aplikacja stworzona do zarządzania amatorskimi i towarzyskimi rozgrywkami sportowymi. Jej głównym założeniem jest modułowość – docelowo system ma stanowić platformę dla wielu różnych dyscyplin sportowych. Każda z obsługiwanych dyscyplin będzie posiadać własne, specyficzne zasady punktacji, elastyczne formaty meczów oraz dedykowane systemy rankingowe.

**Obecna faza projektu (MVP):** 
Na obecnym etapie aplikacja skupia się w 100% na kompleksowej obsłudze **Tenisa Ziemnego**. Architektura bazy danych i logiki biznesowej jest jednak celowo "otwarta" – została zaprojektowana tak, aby w przyszłości bezboleśnie rozszerzyć system o kolejne sporty (np. tenis stołowy czy padel) bez modyfikowania i psucia historycznych danych.

---

## 1. Założenia ogólne i Baza graczy
* **Otwarty dostęp (Brak systemu uprawnień):** Wersja MVP aplikacji nie posiada systemu ról (brak podziału na administratorów i zwykłych użytkowników) ani konieczności logowania. Każda osoba, która wejdzie na stronę, ma pełen dostęp do wszystkich funkcji: może dowolnie przeglądać statystyki, dodawać nowych graczy, tworzyć ligi, a także wprowadzać i edytować wyniki meczów.
* **Gotowość na nowe sporty (Future-Proofing):** System od początku musi wiedzieć, jakiego sportu dotyczy dany mecz/liga, aby prawidłowo dobrać formularz wyników i algorytmy przeliczania tabel.
* **Jedna wspólna baza graczy:** Gracze dodawani są do systemu globalnie (Imię, nazwisko, pseudonim oraz możliwość wgrania awatara). Raz dodany gracz staje się częścią globalnego rejestru i może być przypisywany do wielu różnych lig w dowolnych dyscyplinach. 

## 2. Zarządzanie ligami i tryby gry

Aby utworzyć nową ligę, użytkownik musi zdefiniować następujące parametry:

* **Tryb gry:** Singiel lub Debel.
* **Uczestnicy:** Wybór graczy z globalnej listy.
* **Format rozgrywek (dwa warianty do wyboru):**
    1. **Liga Klasyczna (Round-Robin):** Gra "każdy z każdym". Przy tworzeniu zaznaczamy, czy liga ma być z rewanżami (każdy gra z każdym dwa razy). System od razu generuje pełną pulę meczów do rozegrania i układa je w **proponowany harmonogram (kolejki)**. Harmonogram ten ma pomóc w równomiernym rozgrywaniu ligi przez wszystkich uczestników. Jest on jednak wyłącznie sugestią – **system nie wymusza i nie blokuje** wprowadzania wyników z "przyszłych" kolejek. Dzięki temu, jeśli ktoś wyjedzie na urlop lub złapie kontuzję, pozostali gracze mogą bez przeszkód grać swoje mecze, nie wstrzymując działania całej ligi.
    2. **Liga Nieskończona (Ranking ELO):** Brak z góry wygenerowanych meczów. Liga działa ad-hoc – gracze umawiają się na mecz, grają i wpisują wynik do systemu.

## 3. Logika punktacji i wprowadzanie wyników (Tenis Ziemny)

Mecze zawsze gramy do 2 wygranych setów (Best of 3). Formularz wprowadzania wyników musi być elastyczny i pozwalać na różne ustalenia na korcie:

* **Długość standardowego seta (do wyboru przed meczem):**
    * **Sety krótkie (Fast4):** Gramy do 4 gemów (wygrana np. 4:1, 4:2, a przy stanie 3:3 jest tie-break).
    * **Sety normalne:** Gramy do 6 gemów (przy 6:6 tie-break do 7).
* **Format 3. seta (decydującego przy stanie 1:1 w setach):**
    * Może to być **Super Tie-Break** (wprowadzamy małe punkty, np. 10:8).
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
  * *Zasada remisów:* W przypadku takiej samej liczby punktów o miejscu w tabeli decyduje bilans gemów.

* **W Lidze Nieskończonej (Ranking ELO):**
  * **Start:** Poziom bazowy (startowy) dla każdego gracza w nowej lidze wynosi **1000 punktów**.
  * **Konfigurowalny parametr K:** Osoba zakładająca ligę posiada w ustawieniach możliwość zmiany mnożnika `K`. Odpowiada on za to, jak duże będą wahania punktowe po pojedynczym meczu.
  * **Specyfika Debla:** W przypadku meczu deblowego system najpierw wylicza średnią punktów ELO dla obu graczy w Parze A oraz średnią dla Pary B. Na tej podstawie określa faworyta i wylicza ostateczną zmianę punktową. Wyliczona wartość (np. +15 punktów) jest następnie dopisywana lub odejmowana indywidualnie każdemu z 4 graczy biorących udział w meczu.

## 5. Interfejs wprowadzania wyników (Formularz meczowy)

Po wejściu w widok szczegółów konkretnej ligi, użytkownik musi mieć dostęp do intuicyjnego formularza dodawania rozegranego meczu:

* **Wybór zawodników:** W pierwszej kolejności należy wskazać z listy rozwijanej (lub wyszukiwarki) graczy/pary, którzy rozegrali spotkanie.
* **Wprowadzanie setów:** Formularz musi posiadać osobne pola numeryczne dla wyniku każdego seta (Gospodarz vs Gość).
* **Przełącznik formatu decydującego seta:** Ze względu na specyfikę opisaną w punkcie 3, formularz musi pozwalać użytkownikowi na zdefiniowanie, w jakim formacie rozegrano trzeciego seta (np. poprzez przełącznik/checkbox: "Super Tie-break" / "Zwykły set"). 
* **Ochrona statystyk:** Rozróżnienie to jest kluczowe dla logiki systemowej. Aplikacja musi wiedzieć, że wartości np. "10:8" z Super Tie-breaka to małe punkty, a nie pełne gemy. Dzięki temu statystyki w Tabeli Klasycznej (bilans gemów) nie zostaną sztucznie zawyżone i sfałszowane. 
* **Spójność danych:** W przypadku Ligi Nieskończonej (Ranking ELO) szczegółowy bilans gemów ma drugorzędne znaczenie dla algorytmu, jednak aplikacja powinna zbierać te dane w identyczny sposób (dla zachowania czytelnej historii meczów i jednolitości interfejsu).

## 6. TODO
- System bukmacherski

## 7. Out of scope
- Tworzenie turniejów