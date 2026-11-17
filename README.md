# [NAZWA GRY] — tower defense (wersja 0.7)

Spokojna, turowa gra tower defense w przeglądarce. Między falami budujesz bez limitu czasu, potem patrzysz, jak wrogowie przechodzą przez twój labirynt.

## Jak uruchomić

Bez instalacji i bez serwera: otwórz `index.html` w przeglądarce.

Na GitHub Pages: *Settings → Pages → Deploy from branch → `main` / root*. Gra będzie pod adresem `https://<użytkownik>.github.io/<repozytorium>/`.

## Sterowanie

| Akcja | Mysz / klawiatura | Telefon |
|---|---|---|
| Wybór wieży | klik w panelu lub `1`–`6` | dotknij karty |
| Dźwięk / muzyka | przyciski głośnika i nuty, `M`; głośność w menu | te same przyciski |
| Gród (rozbudowa, odkupienie życia) | klik w gród, licznik żyć lub `G` | dotknij grodu |
| Moce bogów | `Q` Perun, `W` Swaróg, `E` Marzanna; potem klik na mapie | dotknij mocy, potem miejsca |
| Budowa | klik na polu | dotknij pola (podgląd), dotknij ponownie (budowa) |
| Ulepszenie / sprzedaż | klik na wieży, potem przycisk; `U` ulepsza | dotknij wieży |
| Anuluj | `Esc` lub prawy przycisk | dotknij pustego pola |
| Następna fala | `Spacja` lub przycisk | przycisk |
| Pauza | `P` | przycisk pauzy |
| Przybliżanie | kółko myszy, `+` / `−` | dwa palce, `+` / `−` |
| Przesuwanie mapy | przeciągnij (po przybliżeniu) | przeciągnij |

## Zasady (v0.7)

- Losowa mapa 28×16 z przeszkodami. Gniazdo wrogów jest po lewej, baza po prawej.
- Przed grą wybierasz krainę (**Łąka**, **Jesień**, **Zima**, **Pustynia**) i trudność (**Spokojny**, **Normalny**, **Wyzwanie**).
- Każda wieża ma priorytet celu do wyboru: **Pierwszy**, **Najsilniejszy** lub **Najbliższy**.
- Trasa wrogów przelicza się na żywo podczas budowy. Najechanie wieżą pokazuje nową trasę i o ile się wydłuży.
- Nie da się całkowicie zablokować drogi. Takie pole świeci się na czerwono.
- Świat: **mitologia słowiańska**. Bestie wychodzą z **Wrót Nawii** po lewej i idą na **twój gród** po prawej.
- Wieże (drewniane strażnice z bali):
  - **Palisada** (5): ostrokół, blokada do budowy labiryntu.
  - **Łucznik** (20): szybkie strzały w jeden cel.
  - **Kamieniomiot** (45): głazy rażące obszar, przebijają pancerz.
  - **Bożek Mrozu** (35): idol Marzanny, spowalnia.
  - **Słup Peruna** (60): błyskawica przeskakuje między 3–6 wrogami, rozbija tarcze.
  - **Samostrzał** (70): wielka kusza wałowa, ogromny zasięg, przebija pancerz, celuje w najsilniejszego.
  - **Znicz Swaroga** (110): ognisty krąg pali wszystkich naziemnych wrogów wokół wieży.
  - **Chram Mokoszy** (150): wieża wsparcia, +20–45% obrażeń dla wież w zasięgu (nie sumuje się z drugim chramem).
  - Każda wieża (oprócz palisady) ma 4 poziomy.
- Bestie:
  - **Bies**,
  - **Chochlik** (szybki, od fali 6),
  - **Wilkołak** (twarda skóra, od fali 4),
  - **Błędne Ogniki** (rój, nieparzyste fale od 5),
  - **Wodnik** (rozpada się na dwa Utopce, od fali 8),
  - **Strzyga** (lata prosto na gród, odporna na mróz, parzyste fale od 12),
  - **Latawiec** (latające stado, co 3 fale od 9),
  - **Nawiec** (wojownik z Nawii z odnawialną tarczą, od fali 12),
  - **Wiedźma** (leczy pobliskie bestie, od fali 14),
  - **Południca** (szybka, unika 25% strzał i głazów, od fali 7),
  - **Zmora** (co 4 s przeskakuje do przodu, od fali 10),
  - **Rusałka** (sama się leczy, od fali 13),
  - **Bebok** (bardzo wytrzymały, zabiera 2 życia, od fali 16).
- **Gród** ma poziomy 0–4. Na poziomie 0 nie broni się:
  1. **Zasieki** (60): przed bramą zatrzymują każdego naziemnego wroga na 2,5 s (bossów na 1 s).
  2. **Łucznicy na wałach** (120): gród sam strzela, także do latających, w zasięgu 4 pól.
  3. **Znicz grodu** (220): ogień pali wrogów w promieniu 2 pól, zasieki trzymają 3,5 s, łucznicy strzelają szybciej.
  4. **Gromowa Kącina** (360): co 5 s piorun w najsilniejszego wroga w zasięgu 6 pól, a po każdej fali +1 życie.
- **Odkupienie życia**: w każdej chwili, do limitu życia z poziomu trudności. Cena = (18 + 4 × nr fali) × 1,18^(liczba odkupionych żyć).
- Bossowie co 5 fal, z paskiem życia na górze ekranu:
  - **Leszy** (5): pan lasu.
  - **Wołot** (10): olbrzym w skórach.
  - **Baba Jaga** (15): w stępie, wypuszcza Błędne Ogniki.
  - **Licho** (20): jednooki kamienny stwór, przy połowie życia kruszy się i przyspiesza.
  - **Żmij** (25): skrzydlaty smok, leci prosto na gród i wzywa Latawce.
  - **Czarnobóg** (30): odradza się, przy połowie życia wzywa Wilkołaki.
- Latające bestie lecą po fioletowej linii prosto z Wrót Nawii na gród. Linia pokazuje się przed falą, w której się pojawią.
- 30 fal (plus tryb bez końca). Złoto dostajesz za pokonane bestie oraz premię za odpartą falę.
- Sprzedaż wieży postawionej w tej samej przerwie zwraca 100% ceny, w innym przypadku 70%.
- Niska kara za porażkę: falę można powtórzyć od początku.
- Tempo x1/x2/x3, pauza i auto-start kolejnej fali.
- Zapis automatyczny w przeglądarce (localStorage) po każdej fali i każdej zmianie w budowie.
- **Moce bogów** (tylko w trakcie fali, odnawiają się podczas walki):
  - **Gniew Peruna** (40 s): piorun w wybrane miejsce, ignoruje pancerz i tarcze.
  - **Ogień Swaroga** (45 s): pole świętego ognia przez 8 s, pali naziemnych wrogów.
  - **Oddech Marzanny** (70 s): mróz zatrzymuje wszystkich wrogów na 3 s (bossów na 1,5 s), potem spowalnia.
- **Dar Welesa**: na start fali +5% niewydanego złota (limit rośnie z falą).
- Wieże zmieniają wygląd z poziomem: 2: czerwono-biały haft; 3: drewniana palisada; 4: złoty rant, rozeta gromowa, proporce i poświata.
- Muzyka w stylu słowiańskiego folku, generowana na żywo: burdon jak w dudach, pierwsza linia melodii jak gęśle, druga jak fujarka, w walce dochodzi bęben. Tonacja zależy od krainy.
- Po 30 fali możesz grać dalej w **trybie bez końca**: bossowie wracają co 5 fal, coraz silniejsi.
- Efekty dźwiękowe są syntezowane w przeglądarce przez Web Audio, bez plików audio (`js/audio.js`).
- 30 fal (plus tryb bez końca). Złoto dostajesz za pokonanych wrogów oraz premię za odpartą falę.
- Sprzedaż wieży postawionej w tej samej przerwie zwraca 100% ceny, w innym przypadku 70%.
- Niska kara za porażkę: falę można powtórzyć od początku.
- Tempo x1/x2/x3, pauza i auto-start kolejnej fali.
- Zapis automatyczny w przeglądarce (localStorage) po każdej fali i każdej zmianie w budowie.

## Grafika

Cała grafika jest rysowana kodem (SVG → sprite'y canvas), na podstawie koncepcji z `docs/koncepcje/` (wygenerowanych w Gemini). Bestie i bossowie mają pełne sylwetki z grubym konturem; wieże to wysokie strażnice z bali na kamiennej podmurówce. Wrogowie idą brukowaną drogą, która przebudowuje się razem z labiryntem.

## Struktura

```
docs/koncepcje/ grafiki koncepcyjne (Gemini) — wzór dla stylu
index.html      układ strony
css/style.css   wygląd UI (desktop, telefon poziomo i pionowo)
js/art.js       teren, krainy i rasteryzacja SVG do sprite'ów canvas
js/art_slavic.js wieże, bestie, gród i Wrota Nawii w stylu słowiańskim
js/map.js       losowanie mapy i wyszukiwanie ścieżki (BFS)
js/game.js      zasady, balans, symulacja, zapis/odczyt stanu
js/render.js    rysowanie na canvasie + kamera (zoom, przesuwanie)
js/audio.js     efekty dźwiękowe i generatywna muzyka (Web Audio)
js/main.js      UI, sterowanie, pętla gry, zapis
```

Balans (koszty, obrażenia, HP, skład fal) jest w `js/game.js`, na początku pliku.

## Pomysły na kolejne wersje

- Wybór poziomu trudności / rozmiaru mapy
- Więcej typów wież i wrogów, specjalizacje na 4. poziomie
- Statystyki po fali, rekordy
