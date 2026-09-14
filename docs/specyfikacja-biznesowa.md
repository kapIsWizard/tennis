# Specyfikacja biznesowa platformy rozgrywek sportowych

**Wersja:** 0.3 — decyzje po drugim warsztacie  
**Data:** 14 września 2026  
**Status:** wymagania bazowe z częściowo zamkniętymi decyzjami produktowymi  
**Nazwa robocza produktu:** Low On Legs

---

## 1. Streszczenie produktu

Produkt ma być prywatnym, mobilnym centrum organizacji sportu dla grup znajomych. Pierwszą obsługiwaną dyscypliną jest tenis, ale model biznesowy ma pozwalać na dodanie tenisa stołowego, squasha, badmintona i kolejnych sportów bez przebudowy lig, statystyk, uprawnień ani typowania. Turnieje pozostają przyszłym typem rozgrywek, lecz nie należą do obecnego zakresu produktu.

System rozwiązuje pięć problemów:

1. utrzymuje jedną wiarygodną listę graczy i rozegranych meczów;
2. organizuje ligi i mecze niezależne;
3. automatycznie tworzy terminarze, także dla różnych modeli debla;
4. liczy tabele, rating umiejętności i statystyki;
5. pozwala znajomym typować wyniki za wirtualną gotówkę, z kursami opartymi na sile graczy i ekspozycji rynku.

Wirtualna gotówka jest wyłącznie wewnętrzną jednostką rozliczeniową: produkt nie obsługuje jej zakupu, wypłaty, transferu na zewnątrz ani wymiany na nagrody pieniężne lub rzeczowe. Moduł powinien być nazywany w interfejsie **Typowanie**, a nie **Bukmacher**, dopóki pozostaje zabawą społecznościową.

## 2. Problem, cel i mierniki sukcesu

### 2.1. Problem użytkownika

Grupy znajomych organizują mecze w komunikatorach i arkuszach. W efekcie:

- nie wiadomo, która tabela jest aktualna;
- umawianie terminów wymaga wielu wiadomości;
- wyniki bywają niepełne lub sporne;
- zasady ligi żyją w głowie organizatora;
- deble rotacyjne wymagają ręcznego układania par;
- ranking nie odzwierciedla meczów poza ligą;
- historia i statystyki giną po zakończeniu sezonu.

### 2.2. Cel biznesowy

Po utworzeniu grupy jej organizator ma móc skonfigurować rozgrywki, zaprosić graczy i wygenerować poprawny terminarz bez arkusza. Gracz ma mieć jedno miejsce, w którym widzi najbliższe mecze, potwierdza termin, wpisuje wynik oraz śledzi formę i klasyfikację.

### 2.3. Główna obietnica

> Od pomysłu na ligę do gotowego terminarza w mniej niż 10 minut; od zakończenia meczu do zaktualizowanej tabeli, ratingu i rozliczonych typów bez ręcznych obliczeń.

### 2.4. Mierniki sukcesu

Mierniki początkowe:

- co najmniej 70% utworzonych lig ma pierwszy zatwierdzony wynik;
- co najmniej 80% rozegranych meczów ma wynik wpisany w ciągu 48 godzin;
- mniej niż 2% zatwierdzonych wyników wymaga interwencji organizatora;
- co najmniej 60% aktywnych graczy wraca w kolejnym miesiącu sezonu;
- co najmniej 90% terminarzy jest generowanych bez ręcznego usuwania konfliktów graczy;
- typy przedmeczowe pojawiają się dla co najmniej 30% kwalifikujących się meczów po uruchomieniu modułu.

## 3. Zasady projektowe wynikające z analizy pierwszego rzędu

### 3.1. Sport nie jest rozgrywką

Liga i mecz są pojęciami wspólnymi. Tenis, squash i tenis stołowy dostarczają reguły wyniku. Dodanie sportu nie może wymagać tworzenia osobnego rodzaju ligi. Przyszły turniej powinien korzystać z tego samego modelu meczu, ale nie jest obecnie implementowany.

### 3.2. Uczestnikiem meczu jest strona, nie gracz

Mecz ma dwie lub więcej **stron**. Strona zawiera jednego gracza w singlu albo kilku graczy w drużynie. Dzięki temu ten sam model obsługuje singiel, debel i sporty zespołowe. W pierwszych wersjach biznesowo dopuszczamy dokładnie dwie strony.

### 3.3. Zaplanowanie meczu nie oznacza rozegrania meczu

**Pozycja terminarza** określa, kto powinien zagrać. **Mecz** przechowuje faktyczny termin, skład i wynik. Jedna pozycja może być przekładana, anulowana albo zakończona walkowerem bez utraty historii.

### 3.4. Tabela, rating i statystyki to trzy różne produkty

- **Tabela rozgrywek** odpowiada: kto wygrywa ten sezon według jego regulaminu?
- **Rating** odpowiada: jak silny jest zawodnik względem innych?
- **Statystyki** odpowiadają: co i jak wydarzyło się w meczach?

Elo nie zastępuje punktów ligowych, a zwycięzca ligi nie musi mieć najwyższego Elo.

### 3.5. Reguły meczu muszą być zamrożone

Każdy mecz przechowuje wersję reguł obowiązującą w chwili jego utworzenia. Zmiana domyślnego formatu ligi nie może zmienić historycznych wyników ani sposobu ich walidacji.

### 3.6. Wynik jest zdarzeniem wymagającym zaufania

Wpisanie wyniku nie może natychmiast i nieodwracalnie zmieniać wszystkich zestawień. Wynik przechodzi przez zgłoszenie i potwierdzenie. Każda korekta pozostawia ślad audytowy, a rating, tabela i typy są przeliczane w kontrolowany sposób.

### 3.7. Rating ocenia umiejętność; kurs wycenia zdarzenie

Rating jest jednym z sygnałów dla kursu. Kurs zależy też od formatu, składu, niepewności modelu oraz już przyjętych typów. Kurs nie może nadpisywać ratingu ani wyniku sportowego.

### 3.8. „Wielosportowość” ma granice

Rdzeń obsługuje wspólne procesy, natomiast każdy sport potrzebuje własnego modułu reguł punktacji i walidacji wyniku. Próba opisania każdego możliwego sportu jednym zestawem pól prowadziłaby do nieczytelnej konfiguracji.

## 4. Zakres produktu

### 4.1. W zakresie docelowym

- prywatne grupy/kluby i członkostwo;
- konta i profile graczy; każdy uczestnik musi posiadać konto;
- wiele sportów i zestawów reguł;
- mecze niezależne i ligi;
- single i deble;
- terminarze automatyczne i ręczne;
- generowanie obowiązkowych par i kolejek; termin i miejsce można dopisać ręcznie;
- zgłoszenie, potwierdzenie i korekta wyniku;
- tabele i rozstrzyganie remisów;
- rating Elo oraz historia zmian;
- statystyki graczy, par i rozgrywek;
- powiadomienia i kalendarz;
- typowanie za wirtualną gotówkę bez wartości poza aplikacją;
- pełna historia zmian administracyjnych.

### 4.2. Poza zakresem pierwszych wersji

- płatności, depozyty, wypłaty i wymiana wirtualnej gotówki na jakiekolwiek korzyści;
- nagrody pieniężne lub rzeczowe zależne od typów;
- publiczna oferta zakładów;
- turnieje i drabinki turniejowe;
- zakłady na żywo;
- transmisje, automatyczne rozpoznawanie wyniku i integracje z urządzeniami na korcie;
- rezerwacja i opłacanie zewnętrznych obiektów;
- pełny system dla sportów zespołowych z dużymi składami;
- oficjalna certyfikacja rankingów federacyjnych.

## 5. Użytkownicy i role

### 5.1. Typy użytkowników

- **Właściciel platformy** — zarządza katalogiem sportów, bezpieczeństwem i globalną konfiguracją.
- **Właściciel grupy** — tworzy prywatną społeczność i wyznacza organizatorów.
- **Organizator** — zarządza zawodnikami, rozgrywkami, terminarzem, sporami i regulaminem.
- **Gracz** — uczestniczy w meczach, ustala terminy, zgłasza i potwierdza wyniki.
- **Obserwator/typer** — widzi udostępnione mecze, statystyki i typuje, jeśli regulamin grupy na to pozwala.

### 5.2. Najważniejsze uprawnienia

| Działanie | Właściciel grupy | Organizator | Gracz | Obserwator |
|---|---:|---:|---:|---:|
| Zmiana ustawień grupy i ról | tak | nie | nie | nie |
| Tworzenie rozgrywek | tak | tak | opcjonalnie | nie |
| Zarządzanie uczestnikami | tak | tak | nie | nie |
| Generowanie i zmiana terminarza | tak | tak | tylko propozycja terminu | nie |
| Zgłoszenie wyniku własnego meczu | tak | tak | tak | nie |
| Potwierdzenie wyniku | tak | tak | przeciwnik | nie |
| Administracyjna korekta wyniku | tak | tak | nie | nie |
| Typowanie | zgodnie z regulaminem | zgodnie z regulaminem | zgodnie z regulaminem | zgodnie z regulaminem |
| Wgląd w prywatną grupę | tak | tak | tak | tylko po zaproszeniu |

Uprawnienia są zawsze ograniczone do konkretnej grupy. Rola globalna nie może przypadkowo ujawniać prywatnych danych innej grupy.

## 6. Model pojęciowy

### 6.1. Hierarchia

```text
Grupa / klub
├── członkowie i profile graczy
├── sporty i dozwolone zestawy reguł
├── rozgrywki
│   ├── liga
│   │   ├── sezon i etapy
│   │   ├── uczestnicy
│   │   ├── pozycje terminarza
│   │   └── tabela
├── mecze niezależne
├── ratingi i statystyki
└── sezony typowania i portfele wirtualnej gotówki
```

### 6.2. Słownik domenowy

| Pojęcie | Znaczenie biznesowe |
|---|---|
| Sport | Dyscyplina, np. tenis, squash, tenis stołowy. |
| Zestaw reguł | Wersjonowana definicja punktacji i formatu, np. tenis klasyczny BO3 albo szybki mecz. |
| Rozgrywki | Kontener organizacyjny; obecnie liga, w przyszłości możliwe kolejne typy. |
| Sezon | Zamknięty okres rozgrywek z własnymi uczestnikami i regulaminem. |
| Etap | Część rozgrywek, np. grupa, sezon zasadniczy, play-off. |
| Uczestnik rozgrywek | Gracz, stała drużyna albo indywidualny gracz klasyfikowany w systemie rotacyjnym. |
| Pozycja terminarza | Planowany obowiązek rozegrania spotkania między stronami. |
| Mecz | Faktyczne zdarzenie sportowe z terminem, składem, regułami i wynikiem. |
| Strona meczu | Jeden gracz albo skład kilku graczy rywalizujących wspólnie. |
| Rating | Ocena umiejętności w konkretnym kontekście. |
| Tabela | Klasyfikacja w danych rozgrywkach według regulaminu. |
| Rynek typu | Zestaw możliwych wyników do typowania, np. zwycięzca meczu. |
| Kupon | Niezmienny zapis typu, stawki, kursu i czasu złożenia. |
| Portfel | Księga emisji, stawek, zwrotów i wygranych wirtualnej gotówki. |

## 7. Wymagania funkcjonalne

### 7.1. Grupy i członkostwo

**BR-GRP-01.** Użytkownik może utworzyć grupę, ustawić jej nazwę, strefę czasową, język, nazwę wirtualnej gotówki i widoczność.  
**BR-GRP-02.** Grupa jest domyślnie prywatna i dostępna przez zaproszenie.  
**BR-GRP-03.** Właściciel może zapraszać istniejących użytkowników albo wysyłać zaproszenie do rejestracji. Nie może utworzyć uczestnika bez konta.  
**BR-GRP-04.** Osoba zaproszona do rejestracji staje się dostępnym graczem dopiero po utworzeniu konta i przyjęciu zaproszenia.  
**BR-GRP-05.** Organizator może zawiesić członkostwo bez kasowania historycznych meczów.  
**BR-GRP-06.** Jedna osoba może należeć do wielu grup i mieć inne role w każdej z nich.  
**BR-GRP-07.** Scalenie duplikatów profilu jest operacją administracyjną z podglądem skutków i historią zmian.

### 7.2. Gracze

**BR-PLY-01.** Profil zawiera co najmniej nazwę wyświetlaną; zdjęcie, ręczność, rok urodzenia i dane kontaktowe są opcjonalne.  
**BR-PLY-02.** Gracz może określić domyślne sporty i poziom początkowy używany pomocniczo przy wejściu do nowej ligi.  
**BR-PLY-03.** Dane prywatne nie są widoczne poza grupą bez zgody użytkownika.  
**BR-PLY-04.** Usunięcie konta anonimizuje dane osobowe, ale nie usuwa faktu rozegrania historycznych meczów.  
**BR-PLY-05.** Kontuzja lub czasowa niedostępność blokuje nowe propozycje terminu, lecz nie zmienia zakończonych rozgrywek.

### 7.3. Sporty i zestawy reguł

**BR-SPT-01.** Sport definiuje dozwoloną liczebność strony, strukturę wyniku, słownictwo oraz moduł walidacji.  
**BR-SPT-02.** Zestaw reguł określa m.in. liczbę setów/gemów/punktów, warunek zwycięstwa, tie-break, przewagi, limity czasu i zasady krecz/walkower.  
**BR-SPT-03.** System dostarcza zatwierdzone presety, a organizator może tworzyć wariant grupowy przez skopiowanie presetu.  
**BR-SPT-04.** „Pełny mecz” i „Krótki set do 4 gemów” są nazwanymi zestawami reguł, a nie polem `fast=true`.  
**BR-SPT-05.** Zestaw użyty przez rozpoczęte rozgrywki jest wersjonowany. Zmiana tworzy nową wersję stosowaną tylko do nowych albo jawnie wybranych, nierozpoczętych meczów.  
**BR-SPT-06.** Pierwsza wersja obsługuje tenis; kolejne moduły mogą dodać tenis stołowy, squash i badminton bez zmiany modelu ligi.

#### Presety tenisowe

1. **Pełny mecz** — roboczo best of 3 setów tie-breakowych: set do 6 gemów z przewagą dwóch, tie-break przy 6:6. Decyzja, czy trzeci set jest pełnym setem, pozostaje do potwierdzenia.
2. **Krótki set do 4 gemów (Short Set 4)** — cały mecz składa się z jednego seta. Set wygrywa strona, która jako pierwsza osiągnie co najmniej 4 gemy z przewagą dwóch; przy 4:4 rozgrywany jest standardowy tie-break, roboczo do 7 punktów z przewagą dwóch. Nie powtarza się prawidłowego serwisu po dotknięciu siatki — piłka pozostaje w grze („No Service Lets”). Do czasu osobnej decyzji gemy zachowują klasyczną przewagę po 40:40, czyli bez No-Ad.

Wybrany format jest bliższy wariantowi **Short Set** niż FAST4. FAST4 ma tie-break już przy 3:3, krótki tie-break do 5 oraz No-Ad, dlatego tej nazwy nie używamy w interfejsie. Porównanie opiera się na aktualnych [Rules of Tennis](https://www.itftennis.com/en/about-us/governance/rules-and-regulations/) oraz [regułach FAST4 Tennis Australia](https://www.tennis.com.au/wa/files/2015/10/FAST4-TENNIS-RULES.pdf).

### 7.4. Mecz niezależny

**BR-MCH-01.** Uprawniona osoba może utworzyć mecz bez ligi.  
**BR-MCH-02.** Wymagane są sport, zestaw reguł, format stron i uczestnicy; termin i miejsce mogą być początkowo nieustalone.  
**BR-MCH-03.** Mecz niezależny nie wpływa na Elo, ponieważ rating jest własnością konkretnej ligi. Wpływa natomiast na statystyki ogólne i head-to-head graczy.  
**BR-MCH-04.** Organizator ustala widoczność meczu. Typowanie meczu niezależnego pozostaje wyłączone w MVP, ponieważ nie posiada on ligowego źródła Elo.  
**BR-MCH-05.** Mecz można później przypisać do ligi wyłącznie wtedy, gdy pasuje do jej uczestników, etapu, reguł i polityki duplikatów. Operacja wymaga potwierdzenia wpływu na tabelę i rating.  
**BR-MCH-06.** Ten sam faktyczny mecz nie może jednocześnie liczyć się wielokrotnie do tego samego ratingu lub tabeli.

### 7.5. Cykl życia meczu

```text
szkic → oczekuje na ustalenie → zaplanowany → trwa → wynik zgłoszony
                                                  ↓
                         anulowany / walkower ← potwierdzony → zakończony
                                                  ↓
                                                sporny
```

- **Szkic** — nie wszyscy uczestnicy są potwierdzeni.
- **Oczekuje na ustalenie** — strony są znane, ale brak wspólnego terminu lub miejsca.
- **Zaplanowany** — termin i uczestnicy są potwierdzeni.
- **Trwa** — opcjonalny stan informacyjny; nie uruchamia typowania na żywo.
- **Wynik zgłoszony** — wynik czeka na potwierdzenie przeciwnika albo organizatora.
- **Sporny** — jedna ze stron odrzuciła wynik lub zgłosiła niezgodność.
- **Zakończony** — wynik jest źródłem tabeli, ratingu, statystyk i rozliczeń.
- **Walkower** — wynik administracyjny ze wskazaniem strony i przyczyny.
- **Anulowany** — mecz nie ma zwycięzcy, a wszystkie typy są zwracane.

**BR-MCH-07.** Uczestnik nie może wystąpić po obu stronach tego samego meczu.  
**BR-MCH-08.** Zgłaszający wprowadza wynik w strukturze właściwej dla sportu, a system waliduje kompletność i możliwość matematyczną wyniku.  
**BR-MCH-09.** Przeciwnik otrzymuje prośbę o potwierdzenie. Brak reakcji może po konfigurowalnym czasie skutkować automatycznym zatwierdzeniem albo eskalacją do organizatora; rekomendacja: eskalacja, nie automatyczne zatwierdzenie w MVP.  
**BR-MCH-10.** Korekta zakończonego meczu wymaga powodu i tworzy nową wersję wyniku. System odwraca poprzednie skutki i wylicza je ponownie.  
**BR-MCH-11.** Walkower wpływa na tabelę zgodnie z regulaminem, ale domyślnie nie wpływa na Elo.  
**BR-MCH-12.** Krecz może wpływać na tabelę i statystyki; wpływ na Elo jest konfigurowalny, domyślnie ograniczony.  
**BR-MCH-13.** Zmiana składu po otwarciu typowania zamyka i unieważnia rynek, zwraca stawki oraz pozwala otworzyć nowy rynek dla poprawnego składu.

### 7.6. Liga

Liga ma co najmniej jeden sezon i jeden etap. Kreator ligi zbiera konfigurację w sześciu blokach:

#### A. Tożsamość

- nazwa, opis i grafika;
- grupa właścicielska;
- sport i zestaw reguł;
- data rozpoczęcia, planowana data zakończenia i strefa czasowa;
- widoczność i osoby zarządzające.

#### B. Uczestnictwo

- single albo drużyny wieloosobowe;
- lista zaproszonych, potwierdzonych, rezerwowych i wycofanych;
- minimalna/maksymalna liczba uczestników;
- zasada dołączania po rozpoczęciu;
- polityka zastępstw.

#### C. Format sezonu

- każdy z każdym jeden raz, mecz i rewanż albo N razy;
- fazy grupowe i opcjonalny play-off;
- liczba kolejek i spotkań w kolejce;
- podział wygenerowanych meczów na kolejki;
- polityka wolnego losu przy nieparzystej liczbie uczestników;
- termin graniczny kolejki i konsekwencje opóźnienia.

#### D. Punktacja tabeli

- punkty za zwycięstwo, porażkę, walkower i ewentualny remis;
- punkty bonusowe, jeśli sport/regulamin je przewiduje;
- kolejność tie-breakerów, np. bezpośrednie mecze, bilans setów, bilans gemów/punktów, liczba zwycięstw, dodatkowy mecz;
- sposób liczenia małej tabeli przy remisie więcej niż dwóch uczestników;
- zasady dla niepełnego sezonu i wycofanego gracza.

#### E. Rating

- rating włączony/wyłączony;
- rating należący wyłącznie do tej ligi, osobno dla singla/debla zgodnie z formatem ligi;
- współczynnik wpływu meczu i zasady debiutanta;
- wpływ kreczów i brak wpływu walkowerów;
- jawność zmian ratingu.

#### F. Organizacja

- automatyczne generowanie wszystkich par i kolejek albo tryb ręczny;
- terminy i miejsca ustalane poza generatorem oraz opcjonalnie dopisywane do meczu;
- przypomnienia i reguły przełożenia;
- zgłaszanie oraz potwierdzanie wyników;
- dopuszczenie typowania i czas zamknięcia rynku.

**BR-LGE-01.** Przed publikacją system pokazuje symulację: liczbę kolejek, liczbę meczów, liczbę meczów na gracza, konflikty i szacowany czas sezonu.  
**BR-LGE-02.** Publikacja zamraża kluczowe reguły. Późniejsza zmiana pokazuje wpływ na już zaplanowane mecze i wymaga potwierdzenia.  
**BR-LGE-03.** Po rozpoczęciu sezonu nie wolno bez operacji administracyjnej zmienić sportu, modelu uczestnictwa ani podstawowego formatu stron.  
**BR-LGE-04.** Organizator może dodać ręcznie spotkanie do ligi, jeśli walidator nie wykryje duplikatu lub naruszenia uczestnictwa.  
**BR-LGE-05.** System potrafi ponownie wygenerować tylko nierozpoczętą część terminarza, zachowując rozegrane i ręcznie zablokowane spotkania.  
**BR-LGE-06.** Wstrzymanie sezonu zatrzymuje przypomnienia i nowe rynki typowania, ale zachowuje stan.  
**BR-LGE-07.** Zamknięcie sezonu tworzy niezmienny końcowy snapshot tabeli; ponowne otwarcie jest audytowaną operacją administracyjną.  
**BR-LGE-08.** Ligi nie można opublikować, dopóki każdy uczestnik nie ma konta i nie przyjął zaproszenia.

### 7.7. Modele debla

„Debel” opisuje wielkość strony, ale nie sposób klasyfikowania ludzi. Liga musi jawnie wybrać jeden z modeli:

| Model | Tworzenie par | Klasyfikowany uczestnik | Obowiązek rozegrania |
|---|---|---|---|
| Stałe pary | para ustalona na sezon; każda para gra z każdą | para/drużyna | wszystkie opublikowane spotkania par |
| Pełna enumeracja | każda możliwa para gra z każdą rozłączną parą | gracz indywidualny | wszystkie matematycznie możliwe spotkania |
| Zbalansowany podzbiór | generator wybiera ograniczony zestaw spotkań, wyrównując partnerów, przeciwników i liczbę gier | gracz indywidualny | wszystkie spotkania w opublikowanym podzbiorze |
| Losowanie rund | pary i przeciwnicy są losowani dla zadanej liczby kolejek | gracz indywidualny | wszystkie spotkania w opublikowanych kolejkach |
| Pary wyrównane Elo | generator równoważy siłę stron według bieżącego Elo | gracz indywidualny | wszystkie spotkania w opublikowanych kolejkach |

Reguły:

**BR-DBL-01.** W stałych parach tabela dotyczy par, a zmiana partnera tworzy nową parę albo formalne zastępstwo.  
**BR-DBL-02.** W pełnej enumeracji, zbalansowanym podzbiorze, losowaniu i parach wyrównanych Elo tabela jest indywidualna. Punkty za wynik meczu przypisywane są każdemu graczowi strony zgodnie z regulaminem.  
**BR-DBL-03.** „Każdy z każdym na każdego z każdym” oznacza pełną enumerację: każda nieuporządkowana para graczy mierzy się z każdą parą, z którą nie dzieli zawodnika. Dla `n` graczy daje to `3 × C(n,4)` unikalnych meczów: 15 dla 5 graczy, 45 dla 6 i aż 210 dla 8. Kreator musi pokazać tę liczbę przed publikacją i poprosić o potwierdzenie.  
**BR-DBL-04.** Losowanie jest powtarzalne na podstawie zapisanego ziarna; ponowne losowanie wymaga podania przyczyny.  
**BR-DBL-05.** Po publikacji wszystkie mecze wygenerowane przez wybrany tryb są obowiązkowymi pozycjami ligi. Ponowne generowanie jest operacją administracyjną i nie może usuwać rozegranych spotkań.  
**BR-DBL-06.** Elo nie należy do pary. Jest osobne dla ligi i każdego gracza, a siła strony w danym meczu wynika z bieżącego Elo faktycznie występujących zawodników. Domyślnie jest to średnia ratingów dwóch graczy.  
**BR-DBL-07.** Zastępca otrzymuje statystyki za faktycznie rozegrany mecz. Wpływ na tabelę stałej pary zależy od regulaminu ligi.  
**BR-DBL-08.** Zbalansowany podzbiór jest osobnym trybem od pełnej enumeracji. Organizator podaje liczbę kolejek albo docelową liczbę meczów na gracza, a generator minimalizuje różnice w liczbie gier, wspólnych występów z partnerami, spotkań przeciwko rywalom i pauz. Raport ujawnia wszystkie pozostałe nierówności.  
**BR-DBL-09.** Pełna enumeracja pozostaje dostępna dla lig długoterminowych i nie jest automatycznie redukowana, nawet gdy liczba spotkań jest duża.

### 7.8. Generator terminarza

Generator MVP przyjmuje:

- listę uczestników i model rozgrywek;
- liczbę rund/rewanżów;
- model tworzenia par w deblu;
- liczbę kolejek albo docelową liczbę meczów na gracza dla podzbioru zbalansowanego, trybu losowego lub wyrównanego Elo;
- ziarno losowania;
- mecze już rozegrane, zablokowane lub ręcznie zaplanowane.

Generator zwraca:

- kompletną lub częściową propozycję;
- podział na kolejki bez przypisywania dat i kortów;
- wskaźniki kompletności lub sprawiedliwości: liczba gier, pauz, partnerów i przeciwników;
- ostrzeżenie, jeżeli ograniczeń nie da się spełnić jednocześnie.

**BR-SCH-01.** Wygenerowanie propozycji nie publikuje jej automatycznie.  
**BR-SCH-02.** Organizator może blokować ręcznie wybrane mecze i generować resztę.  
**BR-SCH-03.** Ta sama kolejka nie może wymagać od gracza równoczesnego udziału w dwóch meczach, chyba że kolejka jawnie oznacza mecze rozgrywane sekwencyjnie.  
**BR-SCH-04.** Wygenerowana pozycja ma stan „do rozegrania”; konkretna data i miejsce są opcjonalnymi danymi dopisywanymi ręcznie.  
**BR-SCH-05.** Zmiana ręcznie dopisanego terminu wymaga akceptacji przeciwnika, chyba że wykonuje ją organizator z podaniem przyczyny.  
**BR-SCH-06.** Każda publikacja terminarza ma numer wersji i listę różnic.

### 7.9. Przyszłe rozszerzenie: turnieje

Turnieje nie należą do aktualnego zakresu ani roadmapy pierwszych wersji. Wspólny model meczu i stron nie może jednak zamknąć drogi do dodania w przyszłości pojedynczej eliminacji albo faz grupowych. Szczegółowe reguły drabinek powstaną dopiero po osobnej decyzji produktowej; nie są wymaganiami tej wersji.

### 7.10. Tabela i klasyfikacja

Minimalny wiersz tabeli zawiera: miejsce, uczestnika, mecze rozegrane, zwycięstwa, porażki, walkowery, sety/gemy/punkty za i przeciw, bilans oraz punkty tabeli.

**BR-STD-01.** Każdy wynik pokazuje, które reguły tie-breakera zdecydowały o kolejności.  
**BR-STD-02.** Mała tabela jest liczona wyłącznie na podstawie meczów remisujących uczestników, jeżeli została wybrana w regulaminie.  
**BR-STD-03.** Organizator przed startem wybiera politykę wycofania: zachowanie wszystkich wyników, anulowanie wszystkich wyników albo zachowanie po przekroczeniu progu rozegranych meczów.  
**BR-STD-04.** Tabela na żywo może uwzględniać tylko potwierdzone wyniki; wyniki oczekujące są oznaczone, ale nie zmieniają kolejności.  
**BR-STD-05.** Końcowa tabela sezonu pozostaje dostępna niezależnie od późniejszych zmian ligowego Elo.

### 7.11. Rating Elo

#### Założenia biznesowe

- każda liga ma własny, odizolowany rating;
- jeśli liga dopuszcza różne formaty, rating singlowy i deblowy pozostają osobne;
- domyślny rating startowy oraz oznaczenie wysokiej niepewności debiutanta;
- rating nie przechodzi automatycznie do innej ligi, nawet w tej samej grupie i tym samym sporcie;
- mecz może być rankingowy tylko przed jego rozpoczęciem; nie wolno włączać wpływu na Elo po poznaniu wyniku poza audytowaną korektą organizatora.

#### Reguły

**BR-ELO-01.** Oczekiwane prawdopodobieństwo zwycięstwa wynika z różnicy bieżących ratingów zawodników w danej lidze, według jawnej, wersjonowanej konfiguracji.  
**BR-ELO-02.** Aktualizacja następuje dopiero po zatwierdzeniu wyniku.  
**BR-ELO-03.** System zapisuje rating przed, oczekiwany wynik, zmianę i rating po dla każdego uczestnika.  
**BR-ELO-04.** Współczynnik zmiany jest większy dla nowych graczy i stabilizuje się po ustalonej liczbie meczów.  
**BR-ELO-05.** W MVP liczy się zwycięstwo/porażka; uwzględnianie rozmiaru zwycięstwa jest wyłączone, aby ograniczyć motywację do „dobijania” słabszego rywala.  
**BR-ELO-06.** Dla debla przewidywana siła strony wynika z bieżących ratingów faktycznego składu, niezależnie od sposobu wygenerowania par. Każdy gracz otrzymuje zmianę w swoim ratingu tej ligi.  
**BR-ELO-07.** Walkower nie zmienia ratingu. Krecz zmienia go tylko, gdy regulamin na to pozwala i rozegrano minimalną część meczu.  
**BR-ELO-08.** Korekta starego wyniku uruchamia deterministyczne przeliczenie wszystkich późniejszych zmian Elo w tej samej lidze. Historia pokazuje powód przeliczenia.  
**BR-ELO-09.** Organizator nie może ręcznie edytować bieżącej liczby bez utworzenia jawnej korekty z powodem.  
**BR-ELO-10.** Rating dostarcza prawdopodobieństwo bazowe do typowania, lecz kurs używa wersji ratingu z chwili otwarcia rynku.

W przyszłości, po zebraniu danych, można zastąpić lub uzupełnić Elo systemem uwzględniającym niepewność (np. Glicko), zachowując pojęcie „dostawcy ratingu”. Nie jest to wymaganie MVP.

### 7.12. Statystyki

#### Gracz

- bilans meczów oraz procent zwycięstw;
- sety/gemy/punkty wygrane i stracone;
- forma z ostatnich N meczów i serie;
- historia ratingu;
- wyniki według sportu, singla/debla, zestawu reguł, ligi, źródła meczu, zakresu dat i przeciwnika;
- head-to-head;
- skuteczność tie-breaków i decydujących setów, jeżeli dane sportu to umożliwiają;
- aktywność i terminowość rozgrywania meczów.

#### Debel

- bilans z każdym partnerem;
- bilans przeciwko konkretnym graczom i parom;
- „synergia pary”: wynik rzeczywisty względem wyniku oczekiwanego z ratingów indywidualnych, pokazywana dopiero po minimalnej liczbie spotkań;
- równomierność liczby występów w ligach rotacyjnych.

#### Rozgrywki

- tabela i jej historia;
- postęp sezonu, mecze zaległe i średni czas opóźnienia;
- najbardziej wyrównane spotkania i zwroty wyniku, o ile dostępny jest przebieg setów;
- rozkład liczby meczów oraz obciążenie kortów;
- kompletność danych wynikowych.

#### Typowanie

- liczba typów, skuteczność, wirtualny zysk/strata i zwrot z wirtualnej gotówki;
- skuteczność według sportu i rynku;
- pozycja w sezonie typerów;
- kalibracja prognoz systemu: czy zdarzenia wyceniane na około 70% rzeczywiście zachodzą z podobną częstością;
- kurs zamknięcia względem kursu kuponu, jako opcjonalna statystyka zaawansowana.

**BR-STA-01.** Widok statystyk pozwala przełączyć zakres źródła: wszystkie mecze, wybrana liga albo wyłącznie mecze niezależne.  
**BR-STA-02.** Każdy zakres źródła można połączyć z zakresem czasu: all time, bieżący sezon albo własne daty od–do.  
**BR-STA-03.** Head-to-head używa tych samych filtrów i obejmuje zarówno mecze ligowe, jak i niezależne.  
**BR-STA-04.** Zagregowane statystyki all time nie tworzą wspólnego Elo. Historia Elo jest pokazywana dopiero po wybraniu konkretnej ligi.  
**BR-STA-05.** Statystyki nigdy nie mieszają walkowerów z rozegranymi meczami bez wyraźnego oznaczenia.  
**BR-STA-06.** Zakres all time nie omija widoczności grup. Odbiorca widzi wyłącznie agregaty z meczów, do których ma uprawnienia; ukryty mecz z innej grupy nie może zostać ujawniony przez head-to-head ani sumę statystyk.

### 7.13. Typowanie i kursy

#### Granica prawna i produktowa

W Polsce zakłady wzajemne o wygrane pieniężne lub rzeczowe są działalnością regulowaną i wymagają zezwolenia; oficjalne informacje Ministerstwa Finansów rozróżniają totalizator i bukmacherstwo. Dlatego zakres bazowy obejmuje wyłącznie zamkniętą zabawę za **wirtualną gotówkę**, której nie można kupić, sprzedać, przekazać, wypłacić ani wymienić na nagrodę. To ograniczenie produktowe nie zastępuje opinii prawnej. Przed dodaniem jakiejkolwiek korzyści majątkowej lub publicznej oferty konieczna jest osobna analiza prawna na podstawie aktualnych zasad: [Ministerstwo Finansów — system gier hazardowych](https://www.gov.pl/web/finanse/legalne-gry-hazardowe-przez-internet), [tekst jednolity ustawy ogłoszony w 2025 r.](https://eli.gov.pl/eli/DU/2025/595/ogl).

#### Model rekomendowany

- tylko rynek **zwycięzca meczu** w MVP;
- kurs dziesiętny;
- kurs z chwili zatwierdzenia kuponu jest zablokowany dla tego kuponu;
- kolejne kursy zmieniają się na podstawie prawdopodobieństwa z Elo i ekspozycji już zawartych typów;
- wirtualna gotówka ma zerową wartość poza aplikacją;
- każdy sezon typowania ma kontrolowaną emisję wirtualnej gotówki i osobną tabelę;
- system nie gwarantuje „zysku” operatora w realnej wartości, bo nie istnieje realna wartość ani wypłata.

#### Powstawanie kursu

1. **Prawdopodobieństwo sportowe.** System wyznacza bazową szansę każdej strony z aktualnego ratingu i składu. Jeśli brakuje wiarygodnych danych, zwiększa wpływ wartości domyślnej 50/50 i oznacza kurs jako mało pewny.
2. **Korekta kontekstu.** Osobny kontekst singla/debla i konkretny format meczu mogą korygować model dopiero po zebraniu wystarczającej liczby danych. Head-to-head nie powinien dominować przy małej próbce.
3. **Marża wirtualna.** Konfigurowalny overround zwiększa sumę prawdopodobieństw kursowych powyżej 100%; rekomendacja dla zabawy: 0–5%. Przy zerowej marży produkt pozostaje prostszy i bardziej przyjazny.
4. **Ekspozycja.** Po każdym kuponie system porównuje możliwą łączną wypłatę dla obu wyników. Obniża przyszły kurs wyniku powodującego większe zobowiązanie i podnosi kurs drugiego wyniku, w ustalonych granicach.
5. **Bezpieczniki.** Ruch kursu na jeden typ, minimalny/maksymalny kurs, maksymalna stawka i maksymalne zobowiązanie są ograniczone. Mała grupa nie może jednym kuponem całkowicie odwrócić oceny modelu.
6. **Wersjonowanie.** Każda wycena zapisuje dane wejściowe, konfigurację algorytmu i czas. Dzięki temu kurs można wyjaśnić i odtworzyć.

To przypomina bukmachera o stałych kursach: kurs kuponu jest znany w chwili zawarcia, a nowe kursy reagują na ryzyko. Alternatywą jest pula totalizatora, w której ostateczna wypłata zależy od całej puli i nie jest znana przy typowaniu. Tego modelu nie rekomenduje się jako domyślnego, bo daje inne doświadczenie użytkownika.

#### Reguły rynku i kuponu

**BR-BET-01.** Rynek otwiera się dopiero po ustaleniu stron, zestawu reguł i planowanego terminu.  
**BR-BET-02.** Rynek zamyka się automatycznie o godzinie rozpoczęcia albo wcześniej według regulaminu. Organizator może zamknąć go ręcznie z podaniem przyczyny.  
**BR-BET-03.** Kupon zawiera rynek, wybór, stawkę, zablokowany kurs, potencjalną wygraną, czas i wersję wyceny. Po zatwierdzeniu jest nieedytowalny.  
**BR-BET-04.** Wirtualna gotówka stawki jest rezerwowana atomowo; użytkownik nie może uzyskać ujemnego salda ani postawić tej samej kwoty dwukrotnie.  
**BR-BET-05.** Uczestnik nie może typować własnego meczu. Organizator nie może typować rynku, którego wynik może jednostronnie zatwierdzić.  
**BR-BET-06.** Minimalna i maksymalna stawka są ustawiane na sezon; limit może dodatkowo zależeć od zobowiązania rynku.  
**BR-BET-07.** Zwycięski kupon wypłaca `stawka × zablokowany kurs`; przegrany traci stawkę.  
**BR-BET-08.** Mecz anulowany, nierozstrzygnięty albo rynek unieważniony zwraca pełną stawkę.  
**BR-BET-09.** Walkower przed rozpoczęciem gry unieważnia rynek. Dla kreczu po rozpoczęciu domyślna polityka również unieważnia rynek w MVP, dopóki regulamin nie określi inaczej.  
**BR-BET-10.** Zmiana składu, przeciwnika lub istotnych reguł unieważnia istniejący rynek i zwraca stawki. Sama zmiana godziny może zawiesić rynek do potwierdzenia.  
**BR-BET-11.** Rozliczenie następuje dopiero po zatwierdzeniu wyniku.  
**BR-BET-12.** Korekta wyniku po rozliczeniu tworzy operacje odwracające w księdze wirtualnej gotówki i ponowne rozliczenie; nie wolno nadpisywać salda bez śladu.  
**BR-BET-13.** Użytkownik widzi, dlaczego kurs się zmienił w prostym podziale: ocena sportowa oraz presja typów, bez ujawniania prywatnych kuponów innych osób.  
**BR-BET-14.** Organizator nie może zmienić algorytmu, marży ani limitów dla już otwartego rynku. Zmiana obowiązuje przy nowym rynku.  
**BR-BET-15.** Podejrzane skoordynowane zachowanie, wielokrotne konta i typy tuż przed administracyjną zmianą wyniku są oznaczane do audytu.

#### Gospodarka wirtualną gotówką

Każdy ruch wirtualnej gotówki jest pozycją niezmiennej księgi: emisja startowa, bonus okresowy, rezerwacja stawki, wygrana, zwrot, odwrócenie i korekta administracyjna.

Rekomendowane zasady MVP:

- 1 000 jednostek wirtualnej gotówki na start sezonu;
- brak zakupu, transferu i wypłaty;
- limit pojedynczego typu: mniejsza z wartości 5% salda albo limitu rynku;
- brak salda ujemnego i brak kredytu;
- ranking typerów według zwrotu i końcowego salda, z minimalną liczbą typów;
- jawna data końca sezonu i zasada resetu; odznaki historyczne pozostają.

### 7.14. Powiadomienia i kalendarz

**BR-NTF-01.** Użytkownik wybiera kanały i częstotliwość powiadomień.  
**BR-NTF-02.** Zdarzenia minimalne: zaproszenie, nowy termin, prośba o potwierdzenie terminu, przypomnienie, zgłoszony wynik, spór, zmiana terminarza, otwarcie/zamknięcie rynku i rozliczenie typu.  
**BR-NTF-03.** Powiadomienia są grupowane, aby automatyczne generowanie wielu meczów nie wysyłało lawiny wiadomości.  
**BR-NTF-04.** Gracz może subskrybować osobisty kalendarz. Zmiana terminu aktualizuje istniejące wydarzenie, a nie tworzy duplikat.  
**BR-NTF-05.** Czas jest przechowywany jednoznacznie i prezentowany w strefie grupy/użytkownika.

### 7.15. Miejsca, korty i dostępność — po MVP

**BR-VEN-01.** Grupa może utrzymywać katalog obiektów i kortów wraz z typem nawierzchni oraz uwagami.  
**BR-VEN-02.** Mecz może wskazywać obiekt bez konkretnego kortu.  
**BR-VEN-03.** W przyszłym rozszerzeniu użytkownik ustawia cykliczną i jednorazową dostępność oraz preferencje, a nie twardą rezerwację obiektu. Dane te nie wpływają na generator kolejek MVP.  
**BR-VEN-04.** System wykrywa konflikty na tym samym korcie.  
**BR-VEN-05.** Koszt kortu i rozliczenie między graczami mogą zostać dodane później jako osobny moduł; nie należy mieszać ich z portfelem typowania.

## 8. Reguły przekrojowe i przypadki brzegowe

### 8.1. Wycofanie uczestnika

Organizator wybiera politykę przed startem ligi. System pokazuje symulację wpływu wycofania na tabelę, terminarz i typy. Nierozegrane mecze są anulowane albo oznaczone walkowerem zgodnie z regulaminem. Otwarte rynki są unieważniane.

### 8.2. Zastępstwo

Zastępca musi być znany przed rozpoczęciem meczu. Zmiana po przyjęciu typów wymusza unieważnienie rynku. Statystyki osobiste zawsze trafiają do faktycznego zawodnika; punkty tabeli trafiają zgodnie z modelem uczestnictwa ligi.

### 8.3. Duplikat meczu

Potencjalny duplikat to spotkanie tych samych stron w zbliżonym czasie i tym samym kontekście. System ostrzega, ale organizator może potwierdzić, że był to drugi faktyczny mecz. Jeden mecz nie może realizować dwóch pozycji tej samej ligi bez jawnej decyzji.

### 8.4. Spór o wynik

Spór blokuje zmianę tabeli, ratingu i rozliczenie typów. Organizator widzi obie wersje, komentarze i historię. Rozstrzygnięcie wymaga podania powodu. Osoba będąca stroną meczu nie powinna samodzielnie rozstrzygać własnego sporu, jeśli istnieje inny organizator.

### 8.5. Błąd po zakończeniu sezonu

Korekta może ponownie otworzyć końcową tabelę tylko za jawną zgodą organizatora. System zachowuje poprzedni snapshot, pokazuje różnicę i przelicza zależne ratingi oraz kupony.

### 8.6. Brak danych do kursu

Gdy gracz nie ma ratingu lub skład debla jest nowy, system korzysta z ratingu startowego i wysokiej niepewności, ogranicza maksymalną stawkę i pokazuje ostrzeżenie. Rynek można całkowicie wyłączyć do czasu rozegrania minimalnej liczby meczów.

## 9. Wymagania niefunkcjonalne o znaczeniu biznesowym

### 9.1. Bezpieczeństwo i prywatność

- prywatność grupy domyślnie włączona;
- minimalizacja danych osobowych i kontrola widoczności;
- silna autoryzacja wszystkich operacji administracyjnych;
- ochrona przed zgadywaniem identyfikatorów i dostępem między grupami;
- rejestr logowań oraz wrażliwych operacji;
- możliwość eksportu i usunięcia danych użytkownika przy zachowaniu zanonimizowanej integralności wyników;
- brak przechowywania danych płatniczych w zakresie bazowym.

### 9.2. Integralność

- zgłoszenie wyniku, przeliczenie tabeli, ratingu i rozliczenie typu muszą być odporne na ponowienie tej samej operacji;
- saldo wynika z księgi operacji, nie z ręcznie edytowanej liczby;
- wszystkie reguły oraz algorytmy mają wersję;
- administracyjne zmiany zapisują autora, czas, powód i wartości przed/po;
- regularne kopie zapasowe i test odtworzenia.

### 9.3. Dostępność i wydajność

- interfejs mobile-first, używalny jako responsywna aplikacja webowa;
- podstawowe ekrany powinny odpowiadać w typowych warunkach do 2 sekund;
- publikacja dużego terminarza może działać asynchronicznie, ale pokazuje postęp i wynik;
- standard WCAG 2.2 AA jako cel dla kluczowych ścieżek;
- daty, liczby i strefy czasowe muszą być lokalizowane;
- architektura początkowa powinna obsłużyć wiele odizolowanych grup, nawet jeśli pierwszym klientem jest jedna grupa znajomych.

### 9.4. Wyjaśnialność

Użytkownik musi móc odpowiedzieć na pytania:

- dlaczego jestem na tym miejscu w tabeli?
- dlaczego Elo zmieniło się o tę wartość?
- dlaczego kurs się zmienił?
- kto zmienił wynik lub terminarz?
- co stanie się po wycofaniu uczestnika?

## 10. Główne przepływy użytkownika

### 10.1. Start grupy i ligi

1. Założenie prywatnej grupy.
2. Wybór tenisa i presetów meczu.
3. Dodanie lub zaproszenie graczy.
4. Utworzenie ligi i wybór singla/debla.
5. Ustalenie tabeli, ratingu i modelu par.
6. Symulacja terminarza oraz konfliktów.
7. Publikacja regulaminu i zaproszeń.
8. Potwierdzenie udziału.
9. Publikacja terminarza.

### 10.2. Rozegranie meczu

1. Gracze uzgadniają termin i miejsce.
2. Przed terminem system przypomina o spotkaniu i zamyka typowanie.
3. Jedna strona wpisuje wynik set po secie.
4. Druga strona potwierdza albo zgłasza spór.
5. Po potwierdzeniu system aktualizuje tabelę, rating i statystyki.
6. System rozlicza rynek i powiadamia zainteresowanych.

### 10.3. Utworzenie meczu bez ligi

1. Wybór sportu, reguł i stron.
2. Określenie, czy mecz wpływa na rating.
3. Ustalenie terminu i widoczności.
4. Opcjonalne otwarcie typowania.
5. Standardowy proces wyniku i potwierdzenia.

### 10.4. Spór i korekta

1. Przeciwnik odrzuca zgłoszony wynik z komentarzem.
2. Skutki wyniku pozostają wstrzymane.
3. Strony poprawiają wynik albo organizator rozstrzyga spór.
4. System zapisuje decyzję i dopiero wtedy aktualizuje zależne moduły.
5. Późniejsza korekta zakończonego meczu odwraca i ponawia wszystkie obliczenia.

## 11. Zakres MVP i etapy

### Etap 0 — prototyp reguł

Cel: potwierdzić, że model odpowiada rzeczywistym rozgrywkom grupy.

- katalog graczy;
- tenis: singiel i debel, presety pełnego meczu oraz jednego krótkiego seta do 4 gemów;
- ręczne dodawanie meczu i walidacja wyniku;
- konfigurator przykładowej ligi;
- symulacja kolejek dla singla, stałych par, pełnej enumeracji oraz losowania.

### MVP — działający sezon tenisowy

Cel: całkowicie zastąpić arkusz i komunikator w jednej lidze.

- konta, wiele prywatnych grup i zaproszenia wymagające rejestracji;
- mecze niezależne;
- liga każdy z każdym, singiel i debel;
- stałe pary, pełna enumeracja, zbalansowany podzbiór, losowanie oraz pary wyrównane Elo;
- generator obowiązkowych par/kolejek bez automatycznego przypisywania dat i kortów;
- zgłoszenie/potwierdzenie wyniku, spory, walkower i anulowanie;
- konfigurowalna tabela i tie-breakery;
- Elo odizolowane dla każdej ligi i liczone z faktycznego składu;
- podstawowe statystyki i head-to-head;
- powiadomienia wewnętrzne oraz eksport kalendarza;
- log audytowy działań organizatora.

### Wersja 1.1 — lepsza organizacja i test wielosportowości

- dostępność, propozycje terminów i katalog kortów;
- zaawansowane statystyki, historia tabeli i ratingu;
- kolejny sport jako test abstrakcji — rekomendowany squash albo tenis stołowy;
- eksport danych grupy.

### Wersja 1.2 — typowanie wirtualne

Uruchamiane dopiero, gdy wynik, korekty i audyt są stabilne.

- sezon wirtualnej gotówki i niezmienna księga;
- rynek zwycięzcy meczu;
- kurs bazowy z Elo i ruch kursu od ekspozycji;
- limity, zamknięcie, unieważnienie, zwroty i ponowne rozliczenie;
- tabela typerów i statystyki kalibracji;
- mechanizmy antymanipulacyjne;
- regulamin jednoznacznie wykluczający realną wartość wirtualnej gotówki.

### Później

- turnieje dopiero po nowej decyzji produktowej i osobnej specyfikacji;
- dodatkowe rodzaje rynków dopiero po zebraniu danych;
- ligi drabinkowe/challenge;
- integracje z rezerwacjami, komunikatorami i kalendarzami;
- koszty kortów jako księga niezależna od typowania;
- PWA instalowalna lub aplikacje natywne, jeśli dane użycia to uzasadnią.

## 12. Kryteria akceptacji MVP

MVP można uznać za gotowe, gdy spełnia wszystkie warunki:

1. Organizator tworzy ligę 8 singlistów, generuje 28 unikalnych spotkań i publikuje terminarz bez duplikatów.
2. Organizator tworzy ligę stałych par, a ten sam zawodnik nie może należeć do dwóch aktywnych par tej ligi bez dozwolonego zastępstwa.
3. Organizator generuje pełną enumerację debla, a system przed publikacją pokazuje liczbę `3 × C(n,4)` spotkań oraz wymaga jej potwierdzenia.
4. Organizator może zamiast niej wygenerować zbalansowany podzbiór o zadanej liczbie kolejek, a raport pokazuje gry, partnerów, przeciwników i pauzy każdego zawodnika.
5. Mecz używa zamrożonego zestawu reguł; późniejsza zmiana presetu nie zmienia istniejącego wyniku.
6. Druga strona może potwierdzić lub odrzucić zgłoszony wynik.
7. Potwierdzony wynik dokładnie raz aktualizuje tabelę, Elo i statystyki, nawet po ponowieniu żądania.
8. Walkower zmienia tabelę, lecz domyślnie nie zmienia Elo ani statystyk rozegranych punktów.
9. Korekta wyniku odtwarza poprawną historię Elo dla późniejszych spotkań i pozostawia log operacji.
10. Użytkownik widzi wyjaśnienie kolejności remisujących graczy w tabeli.
11. Mecz niezależny nie zmienia Elo żadnej ligi i nie jest typowany w MVP, ale pojawia się w statystykach all time i head-to-head.
12. Użytkownik bez uprawnień nie widzi prywatnej grupy ani nie zmienia jej meczu.
13. Eksport kalendarza nie tworzy duplikatu po zmianie terminu.

Dla wersji typowania dodatkowo:

14. Kupon blokuje kurs i rezerwuje stawkę dokładnie raz.
15. Nowy kupon zmienia wyłącznie kursy przyszłych kuponów.
16. Anulowanie lub zmiana składu zwraca stawkę przez wpis w księdze.
17. Potwierdzenie wyniku rozlicza rynek dokładnie raz.
18. Korekta wyniku odwraca poprzednie rozliczenie i rozlicza ponownie bez ręcznej zmiany salda.
19. Gracz nie może typować własnego meczu.

## 13. Ryzyka i sposoby ograniczenia

| Ryzyko | Skutek | Ograniczenie |
|---|---|---|
| Nadmiernie ogólny model sportu | trudna konfiguracja i błędy wyniku | wspólny rdzeń + osobne, wersjonowane moduły reguł sportu |
| Mylenie tabeli z Elo | niezrozumiałe wyniki i spory | osobne nazwy, ekrany, historie i zasady |
| Kombinatoryka rotacyjnych debli | brak idealnego terminarza | raport jakości, jawne ograniczenia i optymalizacja zamiast obietnicy perfekcji |
| Korekta starego meczu | kaskadowa zmiana ratingu i kuponów | deterministyczne przeliczanie, księga, snapshoty i audyt |
| Manipulacja wynikiem przez typerów | utrata zaufania | zakaz typowania własnych meczów, podwójne potwierdzenie i log zmian |
| Za mało danych dla kursów | pozornie precyzyjne, słabe wyceny | rating startowy, miara niepewności, limity i komunikat o małej próbie |
| Wirtualna gotówka zacznie mieć realną wartość | ryzyko prawne i regulacyjne | brak kupna/wymiany/nagród; oddzielny przegląd prawny przed każdą zmianą |
| Zbyt szerokie MVP | długi czas bez realnego sezonu | najpierw kompletna liga tenisowa, potem drugi sport i typowanie; turnieje poza roadmapą |
| Obowiązkowe konto opóźnia start ligi | zaproszona osoba nie może znaleźć się w terminarzu | czytelny link rejestracyjny i stan „oczekuje na dołączenie” przed publikacją ligi |
| Organizator jest stroną sporu | brak bezstronności | drugi organizator lub zgoda obu stron; widoczny log decyzji |

## 14. Rejestr decyzji produktowych

### 14.1. Decyzje zatwierdzone 14 września 2026

| Obszar | Decyzja |
|---|---|
| Typowanie | Użytkownicy grają wirtualną gotówką. W specyfikacji oznacza ona wyłącznie jednostkę wewnętrzną, bez wpłat, wypłat i wymiany na nagrody. |
| Skala | System od początku obsługuje wiele oddzielnych, prywatnych grup. |
| Konta | Każdy gracz musi mieć konto; organizator nie tworzy profili bez rejestracji. |
| Elo | Rating jest odizolowany dla każdej ligi. Mecze poza ligą go nie zmieniają. |
| Format tenisa | Liga wybiera pełny mecz albo jeden krótki set do 4 gemów z tie-breakiem przy 4:4. Format nie jest nazywany FAST4. |
| Debel | Pełna enumeracja i zbalansowany podzbiór są osobnymi trybami. Wszystkie mecze opublikowane przez generator są obowiązkowe, a Elo wynika z bieżących ratingów faktycznych graczy. |
| Generator | Generuje pary i kolejki, bez automatycznego wyznaczania dat i kortów. |
| Wynik | Wynik wpisany przez jedną stronę musi zostać potwierdzony przez przeciwnika. |
| Własny mecz | Gracz nie może typować meczu, w którym uczestniczy. |
| Rodzaj rozgrywek | Obecny zakres obejmuje tylko ligi oraz mecze niezależne. Turnieje są odłożone bez terminu. |
| Mecze niezależne | Nie zmieniają Elo i nie są typowane w MVP, ale wchodzą do statystyk ogólnych oraz head-to-head. Statystyki filtruje się po lidze, all time albo własnym zakresie dat. |

### 14.2. Decyzje nadal otwarte

1. **Pełny mecz:** czy oznacza best of 3 pełnych setów z tie-breakiem przy 6:6, czy trzeci set zastępujemy match tie-breakiem do 10?  
   Rekomendacja: trzy pełne sety, jeśli nazwa ma rzeczywiście oznaczać pełny mecz.

2. **Punktacja krótkiego seta:** przyjąłem standardową przewagę po 40:40 oraz tie-break do 7 z przewagą dwóch przy stanie 4:4. Czy to prawidłowe? „Bez letów” interpretuję zgodnie z regułami No Service Lets: serwis po siatce, który wpada w prawidłowe pole, pozostaje w grze.  
   Rekomendacja: zachować tę konfigurację jako jeden jawny preset.

3. **Start Elo w nowej lidze:** czy wszyscy zaczynają np. od 1500, czy organizator może ustawić rating początkowy? Czy Elo przechodzi na kolejny sezon tej samej ligi?  
   Rekomendacja: 1500 dla nowych, kontynuacja między sezonami tej samej ligi i jawna korekta startowa organizatora.

4. **Tabela ligi:** jakie są domyślne punkty i tie-breakery?  
   Rekomendacja: zwycięstwo/porażka 2/0, następnie mała tabela, bilans setów, bilans gemów i dodatkowy mecz.

5. **Brak potwierdzenia wyniku:** co robimy, jeśli przeciwnik nie odpowiada?  
   Rekomendacja: przypomnienie po 48 godzinach, eskalacja do organizatora po 7 dniach, bez automatycznego zatwierdzenia.

6. **Wirtualna gotówka:** reset co sezon, stały portfel czy okresowe zasilenia?  
   Rekomendacja: 1 000 jednostek i reset w każdym sezonie typowania; historia wyników pozostaje.

7. **Widoczność:** czy wyniki i statystyki mogą być publiczne przez link?  
   Rekomendacja: wyłącznie członkowie grupy; publiczny widok dopiero po świadomym włączeniu.

8. **Platforma:** czy pierwszym celem jest responsywna aplikacja webowa/PWA?  
   Rekomendacja: tak; aplikacje natywne później.

9. **Istniejące dane:** czy macie arkusz lub historię meczów do importu?  
    Rekomendacja: import CSV przed pierwszym produkcyjnym sezonem, jeśli dane istnieją.

## 15. Rekomendowany zestaw decyzji startowych

Jeżeli zespół chce rozpocząć bez dalszego warsztatu, spójny wariant startowy wygląda tak:

- prywatna, wielogrupowa aplikacja webowa mobile-first;
- tenis jako pierwszy moduł sportu;
- każdy gracz posiada konto i przyjmuje zaproszenie do grupy;
- single oraz deble ze stałymi parami, pełną enumeracją, zbalansowanym podzbiorem, losowaniem i parami wyrównanymi Elo;
- presety „pełny mecz” i „krótki set do 4 gemów”;
- liga każdy z każdym, opcjonalny rewanż;
- wszystkie wygenerowane pary/kolejki są obowiązkowe; terminy ustalają gracze;
- wynik potwierdzany przez przeciwnika;
- konfigurowalna tabela i Elo odizolowane dla każdej ligi;
- walkower bez wpływu na Elo;
- drugi sport po ustabilizowaniu ligi; turnieje poza aktualną roadmapą;
- typowanie dopiero w następnym etapie, wyłącznie za wirtualną gotówkę bez wartości poza aplikacją;
- uczestnicy nie typują własnych meczów;
- kurs kuponu jest blokowany, a przyszłe kursy reagują na rating i ekspozycję.

## 16. Elementy celowo odłożone do specyfikacji technicznej

Ten dokument nie przesądza:

- frameworka aplikacji i rodzaju bazy danych;
- fizycznego schematu tabel lub API;
- konkretnego algorytmu optymalizacji terminarza;
- szczegółowych stałych w Elo i modelu kursowym;
- dostawcy logowania, wiadomości i kalendarza;
- sposobu wdrożenia i hostingu.

Te decyzje powinny wynikać z zatwierdzonych reguł biznesowych, prototypu generatora oraz rzeczywistej skali, a nie odwrotnie.
