---
name: cafe-preview
description: Café Apokalypso im Browser-Preview starten, Diorama-Szenen prüfen und Prop-Positionen kalibrieren. Nutzen bei visueller Verifikation, Prop-Verschiebungen, Sprite-Integration oder Savegame-Teststates.
---

# Café Apokalypso: Preview & Diorama-Kalibrierung

Verifiziertes Rezept (Stand Juni 2026) — erspart die Scroll-/Screenshot-Fallen dieses Setups.

## Starten & Screenshot

1. `preview_start` mit Name `cafe-apokalypso` (Port 5173).
2. **Viewport: 1280×1400** (`preview_resize`). Kleinere Höhen schneiden das Diorama ab; bei gescrolltem Zustand liefert `preview_screenshot` teils leere/versetzte Captures.
3. `preview_eval`: `document.querySelector('.cafe-diorama').scrollIntoView({block:'start'})` — dann erst screenshotten.

## Positionen messen (statt Screenshot-Iteration)

Diorama-relative Rechtecke in % holen:

```js
(() => {
  const dr = document.querySelector('.cafe-diorama').getBoundingClientRect();
  const rel = s => { const r = document.querySelector(s).getBoundingClientRect();
    return { x1:(r.left-dr.left)/dr.width*100, y1:(r.top-dr.top)/dr.height*100,
             x2:(r.right-dr.left)/dr.width*100, y2:(r.bottom-dr.top)/dr.height*100 }; };
  return { clock: rel('.cafe-decor-clock'), counter: rel('.cafe-counter') };
})()
```

## Kalibrieren

1. **Grid-Overlay** (10 %-Linien mit Labels) ins Diorama hängen, einen Screenshot machen, gemalte Ankerpunkte ablesen:

```js
(() => { const d = document.querySelector('.cafe-diorama');
  const g = document.createElement('div'); g.id='calib-grid';
  g.style.cssText='position:absolute;inset:0;z-index:99;pointer-events:none;';
  for (let i=1;i<10;i++){
    g.innerHTML += `<div style="position:absolute;left:${i*10}%;top:0;bottom:0;width:1px;background:rgba(255,0,0,.5)"><span style="position:absolute;top:2px;left:2px;font:10px monospace;color:red">${i*10}</span></div>`;
    g.innerHTML += `<div style="position:absolute;top:${i*10}%;left:0;right:0;height:1px;background:rgba(0,0,255,.5)"><span style="position:absolute;left:2px;font:10px monospace;color:blue">${i*10}</span></div>`; }
  d.appendChild(g); return 'grid on'; })()
```

2. Trial-Positionen per `el.style.left/top` + farbige `outline` setzen, EIN Screenshot, ablesen, nachjustieren.
3. Finale Werte ins CSS übernehmen, `location.reload()`, ein Beweis-Screenshot. Grid mit `document.getElementById('calib-grid')?.remove()` entfernen.

Koordinatensysteme (Diorama vs. `.cafe-floor` vs. `.cafe-counter`) stehen in CLAUDE.md → „Diorama-Geometrie".

## Savegame-Testzustand

```js
(() => { const k='cafe-apokalypso.save.v4';
  const s = JSON.parse(localStorage.getItem(k)); // existiert nach erstem Laden
  s.day=3; s.dayPhase='open';
  s.decor={...s.decor, clock:3, lamp:2, cups:2, plant:3};
  s.dayManagement={...s.dayManagement, customersServed:3, actionPointsRemaining:2};
  s.resources={...s.resources, cleanliness:55};
  localStorage.setItem(k, JSON.stringify(s)); location.reload(); })()
```

Aufräumen: `localStorage.removeItem('cafe-apokalypso.save.v4'); location.reload();`

## Abschluss

- `npx vitest run` (76 Tests grün)
- Testzustand entfernt? Finaler Day-1-Screenshot als Beleg.
