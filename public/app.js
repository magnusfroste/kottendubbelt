/* Kotten och dubbelt och hälften – dubbelt så många, hälften så många.
   Statisk app, inga beroenden. Tränar MA.1-3.5.1 (proportionella samband,
   däribland dubbelt och hälften). Frågan läses upp på svenska; barnet pekar
   på en av tre högar med nötter. Allt ritas i kod: nötterna och Kotten i SVG,
   ljud i WebAudio + talsyntes. Uppgiftsgeneratorn är en ren funktion som
   verify.mjs kontrollerar. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. Ren uppgiftsgenerator                                            *
   *    Varje uppgift har ett rätt svar och två högar som bevisligen inte  *
   *    har dubbelt/hälften så många – annars blir uppgiften oavgörbar.    *
   * ------------------------------------------------------------------ */
  var TALORD = ["noll", "ett", "två", "tre", "fyra", "fem", "sex",
    "sju", "åtta", "nio", "tio", "elva", "tolv"];

  /* "en nöt", inte "ett nöt" – räknarordet böjs efter substantivet */
  function antalsord(n) { return n === 1 ? "en" : TALORD[n]; }

  var SLAG = {
    dubbelt: {
      tecken: "×2",
      fraga: function (bas) {
        return "Kotten har " + antalsord(bas) + (bas === 1 ? " nöt" : " nötter") +
          ". Vilken hög har dubbelt så många?";
      },
      svar: function (bas) { return bas * 2; },
      text: function (bas, ratt) {
        return "Dubbelt så många som " + antalsord(bas) + " är " + TALORD[ratt] + ".";
      }
    },
    halften: {
      tecken: "½",
      fraga: function (bas) {
        return "Kotten har " + TALORD[bas] + " nötter. Vilken hög har hälften så många?";
      },
      svar: function (bas) { return bas / 2; },
      text: function (bas, ratt) {
        return "Hälften av " + TALORD[bas] + " är " + TALORD[ratt] + ".";
      }
    }
  };

  var MAX = 12; /* fler nötter än tolv går inte att räkna på en liten skärm */

  function heltal(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function blanda(a) {
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function normaltal(n, m) { return Math.min(m, Math.max(n, 1)); }

  /* Två felhögar: aldrig rätt antal, aldrig samma tal två gånger, aldrig
     utanför 1–12. Första valet ligger nära rätt svar, så uppgiften kräver
     att barnet räknar i stället för att gissa på den största högen. */
  function felhögar(ratt, bas) {
    var nara = blanda([ratt - 2, ratt - 1, ratt + 1, ratt + 2]);
    var ut = [];
    function ta(v) {
      v = normaltal(v, MAX);
      if (v !== ratt && ut.indexOf(v) < 0) ut.push(v);
    }
    nara.forEach(function (v) { if (ut.length < 2) ta(v); });
    if (ut.length < 2) { ta(bas); ta(bas % 2 ? ratt * 2 : bas + 3); }
    if (ut.length < 2) { ta(ratt + 3); ta(ratt - 3); }
    return ut.slice(0, 2);
  }

  function uppgift(niva) {
    niva = niva === 2 || niva === 3 ? niva : 1;
    var slag, bas;
    if (niva === 1) { slag = "dubbelt"; bas = heltal(1, 3); }
    else if (niva === 2) { slag = "halften"; bas = 2 * heltal(1, 4); }
    else { slag = Math.random() < 0.5 ? "dubbelt" : "halften"; bas = slag === "dubbelt" ? heltal(3, 6) : 2 * heltal(2, 6); }

    var ratt = SLAG[slag].svar(bas);
    var fel = felhögar(ratt, bas);
    var alt = blanda([ratt].concat(fel));
    return {
      slag: slag,
      niva: niva,
      bas: bas,
      ratt: ratt,
      fraga: SLAG[slag].fraga(bas),
      text: SLAG[slag].text(bas, ratt),
      tecken: SLAG[slag].tecken,
      alternativ: alt,
      svar: alt.indexOf(ratt)
    };
  }

  /* ------------------------------------------------------------------ *
   * 2. Kotten (egen SVG-figur, fem uttryck – samma som i familjen)       *
   * ------------------------------------------------------------------ */
  function kottenSvg(uttryck, klass) {
    var F = "#b07d4b", M = "#8a5f36", O = "#2b2118", mun, ogen = "", extra = "";
    if (uttryck === "hejar") { mun = '<path d="M22 36 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else if (uttryck === "firar") {
      mun = '<path d="M21 34 q9 12 18 0" fill="#fff"/><path d="M21 34 q9 12 18 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
      extra = '<path d="M10 12 l3 6M50 12 l-3 6M30 6 v5" stroke="#e8a33d" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    }
    else if (uttryck === "tanker") { mun = '<path d="M24 37 h11" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>'; ogen = '<circle cx="46" cy="24" r="4" fill="none" stroke="' + M + '" stroke-width="1.6" opacity=".5"/>'; }
    else if (uttryck === "funderar") { mun = '<path d="M22 38 q8 -6 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else { mun = '<path d="M22 34 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    var oga = '<circle cx="23" cy="24" r="5.2" fill="#fff"/><circle cx="37" cy="24" r="5.2" fill="#fff"/>' +
      '<circle cx="24" cy="24.6" r="2.5" fill="' + O + '"/><circle cx="36" cy="24.6" r="2.5" fill="' + O + '"/>';
    return '<svg class="' + (klass || "kotten-svg") + '" viewBox="0 0 60 60" aria-hidden="true">' + extra +
      '<path d="M30 6 q9 4 12 12 q9 12 4 24 q-4 12 -16 14 q-12 -2 -16 -14 q-5 -12 4 -24 q3 -8 12 -12z" fill="' + F + '"/>' +
      '<path d="M19 20 q11 -5 22 0M16 30 q14 -5 28 0M16 40 q14 -4 28 0" stroke="' + M + '" stroke-width="1.7" fill="none" opacity=".85" stroke-linecap="round"/>' +
      oga + ogen + mun + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * 3. Ljud (WebAudio + talsyntes, skapas vid första gesten)             *
   * ------------------------------------------------------------------ */
  var ac = null, ljudPa = true;
  function ljud(frekvens, längd, typ) {
    if (!ljudPa) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || "sine"; o.frequency.value = frekvens;
      g.gain.value = 0.001; o.connect(g); g.connect(ac.destination);
      var t = ac.currentTime;
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + längd);
      o.start(t); o.stop(t + längd + 0.02);
    } catch (e) { }
  }
  function sag(text) {
    if (!ljudPa) return;
          try { if (window.__rost && window.__rost(text, true)) return; } catch (e) { }
    try {
      if (!("speechSynthesis" in window) || !text) return;
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "sv-SE"; u.rate = 0.95; u.volume = 0.9;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) { }
  }
  function spar(namn, värde) { try { if (window.skolappar && window.skolappar.event) window.skolappar.event(namn, värde); } catch (e) { } }

  /* ------------------------------------------------------------------ *
   * 4. Nötterna, ritade i kod                                            *
   * ------------------------------------------------------------------ */
  var FÄRG = { skal: "#c98a4b", skalMörk: "#a86f36", mössa: "#6b4a24", kant: "#7c5327" };

  function nötRit(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + FÄRG.skal + '" stroke="' + FÄRG.kant + '" stroke-width="' + (r * 0.16) + '"/>' +
      '<path d="M' + (cx - r * 0.55) + ',' + (cy - r * 0.6) + ' q' + (r * 0.55) + ',-' + (r * 0.5) + ' ' + (r * 1.1) + ',0" fill="none" stroke="' + FÄRG.skalMörk + '" stroke-width="' + (r * 0.22) + '" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M' + (cx - r * 0.34) + ',' + (cy - r * 1.02) + ' q' + (r * 0.34) + ',-' + (r * 0.42) + ' ' + (r * 0.68) + ',0" fill="' + FÄRG.mössa + '"/>' +
      '<path d="M' + cx + ',' + (cy - r * 1.4) + ' l' + (r * 0.2) + ',' + (r * 0.34) + '" stroke="' + FÄRG.mössa + '" stroke-width="' + (r * 0.22) + '" stroke-linecap="round"/>';
  }

  /* En hög med nötter: 1–3 på en rad, 4–6 på två, 7–9 på tre, 10–12 på fyra. */
  function rader(n) { return n <= 3 ? 1 : n <= 6 ? 2 : n <= 9 ? 3 : 4; }

  function högRit(cx, cy, n, r) {
    var R = rader(n), rad = [], kvar = n, i, per, w, ry = 2.05 * r, ys = (R - 1) / 2, h = "";
    for (i = 0; i < R; i++) { per = Math.ceil(kvar / (R - i)); rad.push(per); kvar -= per; }
    for (i = 0; i < R; i++) {
      w = rad[i];
      for (var j = 0; j < w; j++) {
        h += nötRit(cx + (j - (w - 1) / 2) * 2.15 * r, cy + (i - ys) * ry, r);
      }
    }
    return h;
  }

  /* ------------------------------------------------------------------ *
   * 5. Ritningen: Kottens hög överst, tre val under                      *
   * ------------------------------------------------------------------ */
  var RUNDA = 8;
  var S = {
    skärm: "start", niva: 1, runda: 1, item: 0, svarRätt: 0, stjärnor: 0,
    felförsök: 0, p: null, klar: false, visaRätt: false, visatGrepp: false
  };

  /* Två layouter: tre kort på rad (iPad liggande, dator) och tre kort i
     kolumn (telefon och iPad stående). */
  function layoutFor(el) {
    var r = el.getBoundingClientRect();
    if (r.width && r.height && r.width < r.height * 0.95) {
      return {
        vb: [620, 1160], liggande: false,
        kort: { w: 560, h: 290, x: 310, ys: [200, 508, 816] },
        r: 24, högY: 118, siffraY: -20,
        kotten: { x: 110, y: 96, s: 118 }, basHög: { x: 330, y: 96, r: 19 },
        chip: { x: 520, y: 96 }
      };
    }
    return {
      vb: [900, 440], liggande: true,
      kort: { w: 252, h: 258, x: 168, ys: [176, 176, 176] },
      r: 20, högY: 118, siffraY: -18,
      kotten: { x: 62, y: 88, s: 96 }, basHög: { x: 350, y: 88, r: 18 },
      chip: { x: 720, y: 88 }
    };
  }

  function chipRit(cx, cy, text, storlek) {
    var w = text.length > 1 ? storlek * 2.2 : storlek * 1.5, h = storlek * 1.5;
    return '<rect x="' + (cx - w / 2) + '" y="' + (cy - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (h * 0.32) + '" fill="var(--accent)"/>' +
      '<text x="' + cx + '" y="' + (cy + storlek * 0.42) + '" text-anchor="middle" font-size="' + storlek + '" font-weight="800" fill="#fff">' + text + '</text>';
  }

  function ritaScen() {
    var p = S.p, el = document.getElementById("scen");
    if (!p) return;
    var L = layoutFor(el), h = [];
    h.push('<rect x="0" y="0" width="' + L.vb[0] + '" height="' + L.vb[1] + '" fill="var(--papper)"/>');

    /* Kottens egen hög och räknesättet, så barnet ser vad som frågas efter */
    h.push('<g aria-hidden="true">');
    h.push('<svg x="' + (L.kotten.x - L.kotten.s / 2) + '" y="' + (L.kotten.y - L.kotten.s / 2) + '" width="' + L.kotten.s + '" height="' + L.kotten.s + '" viewBox="0 0 60 60">' +
      kottenSvg("glad", "").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "") + '</svg>');
    h.push('</g>');
    h.push('<rect x="' + (L.basHög.x - 150) + '" y="' + (L.basHög.y - 80) + '" width="300" height="160" rx="30" fill="#fff" stroke="var(--linje)" stroke-width="3"/>');
    h.push(högRit(L.basHög.x, L.basHög.y, p.bas, L.basHög.r));
    h.push(chipRit(L.basHög.x + 108, L.basHög.y + 52, String(p.bas), 26));
    h.push(chipRit(L.chip.x, L.chip.y, p.tecken, 34));

    /* De tre högarna att välja mellan */
    p.alternativ.forEach(function (antal, i) {
      var c = L.kort.x, ky = L.kort.ys[i];
      var xs = L.liggande
        ? [L.kort.x, L.kort.x + 282, L.kort.x + 564]
        : [L.kort.x, L.kort.x, L.kort.x];
      var x = xs[i];
      var rättNu = S.klar && S.visaRätt && i === p.svar;
      h.push('<g class="hog-g' + (rättNu ? " ratt" : "") + '" data-i="' + i + '" role="button" tabindex="0" aria-label="hög ' + (i + 1) + '">');
      h.push('<rect class="hog-kort" x="' + (x - L.kort.w / 2) + '" y="' + ky + '" width="' + L.kort.w + '" height="' + L.kort.h + '" rx="26" fill="#fff" stroke="var(--linje)" stroke-width="3"/>');
      h.push(högRit(x, ky + L.högY, antal, L.r));
      h.push('<text class="hog-siffra" x="' + x + '" y="' + (ky + L.kort.h + L.siffraY) + '" text-anchor="middle" font-size="' + (L.liggande ? 38 : 42) + '" font-weight="800" fill="var(--accent-mörk)">' +
        (S.klar ? String(antal) : "") + '</text>');
      if (rättNu) {
        h.push('<rect class="ratt-ring" x="' + (x - L.kort.w / 2 - 8) + '" y="' + (ky - 8) + '" width="' + (L.kort.w + 16) + '" height="' + (L.kort.h + 16) + '" rx="32" fill="none" stroke="var(--stjärna)" stroke-width="7"/>');
      }
      if (!S.visatGrepp && !S.klar) {
        h.push('<circle class="grepp-ring" cx="' + x + '" cy="' + (ky + L.kort.h / 2) + '" r="' + (L.liggande ? 34 : 38) + '" fill="none" stroke="var(--accent)" stroke-width="5" opacity=".7"/>');
      }
      h.push('</g>');
    });

    el.setAttribute("viewBox", "0 0 " + L.vb[0] + " " + L.vb[1]);
    el.innerHTML = h.join("");
  }

  function ritaPrickar() {
    var h = "", i;
    for (i = 0; i < RUNDA; i++) h += '<i class="' + (i < S.item ? "klar" : "") + '"></i>';
    document.getElementById("prickar").innerHTML = h;
  }
  function ritaStjärnor() {
    document.getElementById("stjarnor").textContent = "★".repeat(Math.min(S.stjärnor, 12)) + (S.stjärnor > 12 ? "+" : "");
  }
  function kottenByt(uttryck) {
    var el = document.getElementById("kotten");
    if (el) el.innerHTML = kottenSvg(uttryck, "kotten-svg");
  }

  /* ------------------------------------------------------------------ *
   * 6. Spelflöde                                                       *
   * ------------------------------------------------------------------ */
  var idleTimer = null;
  function startIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (S.skärm === "spel" && !S.klar && S.felförsök === 0) {
        sag(S.p.fraga);
        spar("hint");
      }
    }, 12000);
  }

  function nyUppgift() {
    S.p = uppgift(S.niva);
    S.klar = false; S.felförsök = 0; S.visaRätt = false;
    ritaScen(); ritaPrickar();
    sag(S.p.fraga);
    startIdle();
  }

  function valj(i) {
    if (S.skärm !== "spel" || S.klar) return;
    clearTimeout(idleTimer);
    var p = S.p;
    var g = document.querySelector('.hog-g[data-i="' + i + '"]');
    if (!S.visatGrepp) { S.visatGrepp = true; ritaScen(); }
    if (i === p.svar) {
      S.klar = true; S.visaRätt = true; S.item++; S.svarRätt++; S.stjärnor++;
      ritaScen(); ritaPrickar(); ritaStjärnor();
      ljud(520, 0.12, "square");
      setTimeout(function () { ljud(780, 0.14, "sine"); }, 130);
      setTimeout(function () { ljud(1040, 0.18, "sine"); }, 260);
      sag("Rätt! " + p.text);
      kottenByt("firar");
      setTimeout(function () {
        kottenByt("glad");
        if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
      }, 2200);
    } else {
      S.felförsök++;
      if (g) { g.classList.add("fel"); setTimeout(function () { g.classList.remove("fel"); }, 520); }
      ljud(220, 0.16, "triangle");
      setTimeout(function () { ljud(170, 0.18, "triangle"); }, 150);
      kottenByt("funderar");
      sag("Räkna noga. " + p.fraga);
      spar("hint");
      /* tre högar = två felhögar: efter båda lyser rätt hög, barnet går vidare */
      if (S.felförsök >= 2) {
        S.visaRätt = true; S.klar = true;
        ritaScen();
        sag("Den som lyser är rätt. " + p.text);
        kottenByt("tanker");
        setTimeout(function () {
          S.item++;
          kottenByt("glad");
          if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
        }, 2600);
      } else {
        startIdle();
      }
    }
  }

  function rundaKlar() {
    S.skärm = "överlägg";
    var procent = Math.round(100 * S.svarRätt / RUNDA);
    spar("round_done", procent);
    sag("Rundan är klar. " + S.svarRätt + " av " + RUNDA + " rätt.");
    var stegUpp = S.svarRätt >= 6 && S.niva < 3;
    visaOverlay(S.svarRätt >= 6 ? "firar" : "hejar", "Rundan är klar!",
      S.svarRätt + " av " + RUNDA + " rätt. " + S.stjärnor + " stjärnor totalt." +
      (stegUpp ? " Nu blir det svårare!" : ""),
      "En runda till →", function () {
        if (stegUpp) { S.niva++; spar("level", S.niva); }
        S.runda++; startaRunda(S.niva);
      }, true);
  }

  function visaOverlay(uttryck, titel, text, knapptext, vidare, medNiva) {
    var ov = document.getElementById("overlay");
    document.getElementById("ov-bild").innerHTML = kottenSvg(uttryck, "ov-kotten");
    document.getElementById("ov-titel").textContent = titel;
    document.getElementById("ov-text").textContent = text;
    var b = document.getElementById("ov-nasta");
    b.textContent = knapptext;
    b.onclick = function () { ov.hidden = true; vidare(); };
    var n = document.getElementById("ov-niva");
    n.hidden = !medNiva;
    n.onclick = function () { ov.hidden = true; S.niva = S.niva >= 3 ? 1 : S.niva + 1; S.runda++; startaRunda(S.niva); };
    ov.hidden = false;
  }

  function startaRunda(niva) {
    S.niva = niva; S.skärm = "spel"; S.item = 0; S.svarRätt = 0; S.felförsök = 0;
    S.visatGrepp = false;
    document.getElementById("startskarm").hidden = true;
    document.getElementById("spel").hidden = false;
    document.getElementById("overlay").hidden = true;
    ritaStjärnor(); kottenByt("glad");
    spar("round_start"); spar("level", niva);
    if (niva === 2) setTimeout(function () { sag("Nu frågar jag efter hälften. Lyssna noga."); }, 900);
    else if (niva === 3) setTimeout(function () { sag("Nu blandar jag dubbelt och hälften. Lyssna noga."); }, 900);
    nyUppgift();
  }

  function tipsa() {
    if (S.skärm !== "spel" || S.klar) return;
    sag(S.p.fraga);
    spar("hint");
    kottenByt("tanker");
    setTimeout(function () { if (!S.klar) kottenByt("glad"); }, 1600);
  }

  /* ------------------------------------------------------------------ *
   * 7. Händelser och start                                             *
   * ------------------------------------------------------------------ */
  function ritaLjudIkon() {
    document.getElementById("ljudikon").innerHTML = ljudPa
      ? '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 8a5 5 0 0 1 0 8"/>'
      : '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 9l5 6M20 9l-5 6"/>';
  }

  function bind() {
    /* pointerdown i stället för click: svarar direkt på touch utan att vänta på
       ett click som Safari ibland lägger efter en fördröjning. Tangentbordet har
       egen väg (1/2/3), så inget dubbeltryck kan uppstå. */
    document.getElementById("scen").addEventListener("pointerdown", function (e) {
      var g = e.target.closest(".hog-g");
      if (g) { e.preventDefault(); valj(Number(g.dataset.i)); }
    });
    document.getElementById("spela").addEventListener("click", function () { ljud(600, 0.1); startaRunda(1); });
    document.getElementById("hjalp").addEventListener("click", tipsa);
    document.getElementById("ljud").addEventListener("click", function () {
      ljudPa = !ljudPa;
      if (!ljudPa && "speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) { } }
      ritaLjudIkon(); spar("sound_off");
    });
    document.addEventListener("keydown", function (e) {
      if (S.skärm !== "spel") return;
      if (e.key === "1" || e.key === "ArrowLeft") valj(0);
      if (e.key === "2" || e.key === "ArrowDown") valj(1);
      if (e.key === "3" || e.key === "ArrowRight") valj(2);
      if (e.key === "h" || e.key === "?") tipsa();
    });
    window.addEventListener("resize", function () { if (S.p) ritaScen(); });
  }

  function init() {
    bind(); ritaLjudIkon(); ritaStjärnor(); ritaPrickar();
    document.getElementById("kotten-hud").innerHTML = kottenSvg("glad", "kotten-hud");
    kottenByt("glad");
    window.__game = {
      S: S, uppgift: uppgift, SLAG: SLAG, TALORD: TALORD, valj: valj,
      startaRunda: startaRunda, nyUppgift: nyUppgift, tipsa: tipsa, ritaScen: ritaScen
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
