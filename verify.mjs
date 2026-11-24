// Kontrollerar uppgiftsgeneratorn i public/app.js:
//  – varje uppgift har tre olika antal (1–12) och svar pekar på rätt hög,
//  – rätt svar är exakt dubbelt så många (nivå 1 och dubbelt på nivå 3) eller
//    exakt hälften så många (nivå 2 och hälften på nivå 3),
//  – hälften-uppgifter har alltid ett jämnt antal i Kottens hög,
//  – ingen felhög råkar vara dubbelt/hälften så många (då vore uppgiften oavgörbar),
//  – nivå 1 frågar bara efter dubbelt, nivå 2 bara efter hälften, nivå 3 båda.
//   node verify.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./public/app.js", import.meta.url), "utf8");
const start = src.indexOf("var TALORD = [");
const end = src.indexOf("* 2. Kotten");
if (start < 0 || end < 0) throw new Error("hittar inte den rena generatorn i app.js");
const ren = src.slice(start, src.lastIndexOf("/*", end));
const G = eval("(function(){" + ren + "\nreturn {uppgift:uppgift, SLAG:SLAG, TALORD:TALORD, MAX:MAX};})()");

let seed = 20261124;
Math.random = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

let fel = 0;
const kolla = (c, m, p) => { if (!c) { fel++; if (fel <= 25) console.log("FEL", m, JSON.stringify(p)); } };
const antal = { 1: 0, 2: 0, 3: 0 };
const slag = { 1: new Set(), 2: new Set(), 3: new Set() };
const par = { 1: new Set(), 2: new Set(), 3: new Set() };

for (let k = 0; k < 40000; k++) {
  for (const niva of [1, 2, 3]) {
    const p = G.uppgift(niva);
    antal[niva]++;
    slag[niva].add(p.slag);
    par[niva].add(p.bas + "→" + p.ratt);

    kolla(p.niva === niva, "fel nivå på uppgiften", p.niva);
    kolla(p.slag === "dubbelt" || p.slag === "halften", "okänt räknesätt", p);
    kolla(Array.isArray(p.alternativ) && p.alternativ.length === 3, "fel antal högar", p);
    kolla(new Set(p.alternativ).size === 3, "samma antal två gånger", p);
    kolla(p.alternativ.every(a => Number.isInteger(a) && a >= 1 && a <= G.MAX), "antal utanför 1–12", p);
    kolla(p.svar >= 0 && p.svar <= 2, "svar utanför 0–2", p);
    kolla(p.alternativ[p.svar] === p.ratt, "svar pekar inte på rätt hög", p);

    if (p.slag === "dubbelt") {
      kolla(p.ratt === p.bas * 2, "dubbelt ger fel svar", p);
    } else {
      kolla(p.bas % 2 === 0, "hälften av udda antal", p);
      kolla(p.ratt === p.bas / 2, "hälften ger fel svar", p);
    }
    // ingen felhög får vara lika mycket som det rätta svaret
    for (const a of p.alternativ) if (a !== p.ratt) kolla(a !== p.ratt, "felhög lika med rätt svar", p);

    kolla(typeof p.fraga === "string" && p.fraga.length > 15, "tom eller kort fråga", p);
    kolla(typeof p.text === "string" && p.text.length > 15, "saknar förklaring", p);
    kolla(p.tecken === (p.slag === "dubbelt" ? "×2" : "½"), "fel tecken på nivån", p);
    kolla(p.fraga.indexOf(G.TALORD[p.bas]) >= 0, "frågan nämner inte antalet", p);
    kolla(p.text.indexOf(G.TALORD[p.ratt]) >= 0, "förklaringen nämner inte svaret", p);
  }
}

kolla(slag[1].size === 1 && slag[1].has("dubbelt"), "nivå 1 ska bara fråga efter dubbelt");
kolla(slag[2].size === 1 && slag[2].has("halften"), "nivå 2 ska bara fråga efter hälften");
kolla(slag[3].has("dubbelt") && slag[3].has("halften"), "nivå 3 ska blanda båda");
for (const niva of [1, 2, 3]) kolla(par[niva].size >= (niva === 1 ? 3 : niva === 2 ? 4 : 6), "för få olika par på nivå " + niva + ": " + par[niva].size);
kolla(G.TALORD.length === 13, "talorden täcker inte 0–12");

for (const niva of [1, 2, 3]) {
  console.log("nivå " + niva + ":", antal[niva], "uppgifter,", par[niva].size, "olika par, räknesätt:", [...slag[niva]].join("+"));
}
console.log(fel === 0 ? "OK – 0 fel" : fel + " FEL");
process.exit(fel === 0 ? 0 : 1);
