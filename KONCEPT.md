# KONCEPT – Kotten – dubbelt och hälften

**Mål (en sak):** barnet ska se sambandet mellan två mängder där den ena är dubbelt så stor
eller hälften så stor som den andra – och hitta den mängden genom att räkna, inte genom att
gissa på den största eller minsta högen.

**Målgrupp:** FK–2 (innehållet hör till åk 1–3 matematik). Spelbart utan att kunna läsa.

**Kärnmekanik (touch först):** Kotten visar sin egen hög med nötter (och antalet som siffra).
Frågan läses upp på svenska: ”Kotten har tre nötter. Vilken hög har dubbelt så många?” Tre högar
står på skärmen; barnet pekar på en. Rätt hög lyser guld, siffrorna visas under alla tre och
Kotten säger varför: ”Rätt! Dubbelt så många som tre är sex.” Fel hög skakar till, Kotten
funderar, frågan läses om – och efter båda felhögarna lyser den rätta, spelet går vidare. Ingen
förlust, ingen game over.

**5-minuterssession:** åtta högar per runda, ungefär 3–5 minuter. ”En runda till”-knapp.

**Belöning barnet kan berätta om:** stjärnor och ”8 av 8 rätt”, och att det vet att ”dubbelt så
många som tre är sex och hälften av sex är tre”.

**Vad barnet lär:** dubbelt så många (×2) och hälften så många (½) som ett antal. Nivå 1: dubbelt
av 1–3. Nivå 2: hälften av 2–8. Nivå 3: blandat, dubbelt av 3–6 och hälften av 4–12. Felhögarna
ligger alltid nära rätt svar (en eller två nötter ifrån), så barnet måste räkna.

**Lgr22:** MA.1-3.5.1 – ”Proportionella samband, däribland dubbelt och hälften.” (ordagrant ur
Skolverkets syllabus-API, hämtad 2026-11-23)

**Varför det funkar på iPad:** tre kort på rad i liggande läge (276×282 px per kort på 1024×768)
och tre kort i kolumn i stående (338×175 px på en 390×844) – inget scroll, inga ord i spelytan,
allt avgörs med ett finger. Kottens hög står kvar överst under hela uppgiften, så barnet kan
räkna om.

## Testplan (mätbara krav)

1. `node verify.mjs`: 120 000 uppgifter, 0 fel. Rätt svar är exakt bas×2 (dubbelt) eller bas÷2
   (hälften, alltid jämn bas); tre olika antal i 1–12; ingen felhög har rätt antal; nivå 1 frågar
   bara dubbelt, nivå 2 bara hälften, nivå 3 båda; frågan och förklaringen nämner rätt antal
   med rätt böjning (”en nöt”, inte ”ett nöt”).
2. 0 px scroll (båda axlarna) i 1024×768, 768×1024, 390×844, 1440×900, före och efter Spela.
3. Hela rundan spelas med pekdon (`Input.dispatchTouchEvent`): 8/8, stjärnor, prickar,
   resultatruta som är ogenomskinlig och täcker HUD.
4. Två felhögar i rad → rätt hög lyser, siffrorna visas, uppgiften går vidare.
5. Nivå 3 blandar dubbelt och hälften (mätt över 2 000 uppgifter).
6. Ingen inloggning, inga länkar ut, ingen reklam, ingen tredjeparts-CDN förutom kotten.js.
7. Kortbilden är ett spelmoment 1200×900 (4:3) utan pålagd text.

## Validering före bygge

`delegate_task` (andra agentens hårda go/no-go) fanns inte tillgängligt i den här körningen
(inga subagent-verktyg i sessionen). Kritiken och go/no-go gjordes därför som en skriftlig
egenkontroll mot de tre frågorna, och den ligger i körningsrapporten:

- **Skulle ett barn spela det frivilligt i 5 minuter?** Ja – räkna-och-peka-loopen är kort,
  talad fråga, tre val, och belöningen (stjärnor + siffrorna som dyker upp) kommer direkt.
  Risk: uppgiften är kognitivt ensidig; därför bara åtta högar per runda och ”en runda till”.
- **Träffar det ett verkligt kunskapskrav?** Ja – MA.1-3.5.1 är ordagrant citerat, och dubbelt
  och hälften är ett av de vanligaste momenten i åk 1–3. Ingen app i katalogen (54 rader)
  täcker det: `list_apps` gav noll träff på dubbelt/hälften som innehåll.
- **Teknisk risk:** låg – samma statiska upplägg som de fem Kotten-appar som redan är
  publicerade; generatorn är ren och verifieras headless; inga fysikmotorer, ingen tidspress.

Go.
