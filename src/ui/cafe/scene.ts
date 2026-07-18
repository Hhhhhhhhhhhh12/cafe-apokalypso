/**
 * Café-Szene als Daten — EIN Koordinatensystem.
 *
 * Alle Positionen sind "Stage-%": Prozent der .cafe-world-Box (= Stage-PNG).
 * `x`/`left`/`right` = Abstand vom linken/rechten Rand, `bottom` = Abstand
 * vom UNTEREN Rand, `top` nur für wandmontierte Props. Der Kamera-Zoom
 * (--cafe-zoom auf .cafe-world) skaliert die ganze Box — Klick-Kalibrierung
 * über getBoundingClientRect bleibt davon unberührt.
 *
 * Die Werte sind 1:1 aus den kalibrierten global.css-Ständen (2026-07-11,
 * v05-Pixellab-Stage) übernommen. Das alte Floor-Teilsystem (Container
 * left 5 % / width 89 % / bottom 4 % / height 65 % mit clip-path) ist hier
 * einmalig herausgerechnet — neue Kalibrierung = Zahlen hier ändern.
 */

import type { CSSProperties } from "react";

const FLOOR = { left: 5, width: 89, bottom: 4, height: 65 } as const;

/** Rechnet alte Floor-%-Werte (Kommentar-Referenz) in Stage-% um. */
const floorX = (fx: number) => round(FLOOR.left + (fx * FLOOR.width) / 100);
const floorRight = (fr: number) => round(6 + (fr * FLOOR.width) / 100);
const floorY = (fy: number) => round(FLOOR.bottom + (fy * FLOOR.height) / 100);
const round = (n: number) => Math.round(n * 100) / 100;

export interface StageSpot {
  /** Abstand linker Rand in Stage-% (Span-Anker, nicht Sprite-Mitte). */
  left?: number;
  /** Alternativ: Abstand rechter Rand in Stage-%. */
  right?: number;
  /** Abstand unterer Rand in Stage-%. */
  bottom?: number;
  /** Nur wandmontierte Props: Abstand oberer Rand in Stage-%. */
  top?: number;
  /** Malordnung; höher = weiter vorn. */
  z: number;
  /** Optionale Rahmengröße in Stage-% (sonst bestimmt die CSS-Klasse). */
  w?: number;
  h?: number;
  /** Sprite horizontal auf dem Anker zentrieren (translateX(-50%)). */
  centered?: boolean;
}

/** Inline-Style für einen StageSpot. */
export function spotStyle(s: StageSpot): CSSProperties {
  return {
    position: "absolute",
    ...(s.left !== undefined ? { left: `${s.left}%` } : {}),
    ...(s.right !== undefined ? { right: `${s.right}%` } : {}),
    ...(s.bottom !== undefined ? { bottom: `${s.bottom}%` } : {}),
    ...(s.top !== undefined ? { top: `${s.top}%` } : {}),
    ...(s.w !== undefined ? { width: `${s.w}%` } : {}),
    ...(s.h !== undefined ? { height: `${s.h}%` } : {}),
    ...(s.centered ? { transform: "translateX(-50%)" } : {}),
    zIndex: s.z,
  };
}

/* ── Sitzende / stehende Gäste ─────────────────────────────────────────
   legacyClass hält die Personality-Animationen und Sprite-Größen aus
   global.css am Leben (breathe/fidget/lean, 108-px-Assets). */
export interface GuestSpot extends StageSpot {
  legacyClass: string;
}

export const GUEST_SPOTS = {
  cem: { ...f(22, 26), z: 6, legacyClass: "placeholder-guest-normal-03" },
  mira: { right: floorRight(30), bottom: floorY(24), z: 6, legacyClass: "placeholder-guest-normal-04" },
  lukas: { ...f(17, 21), z: 6, legacyClass: "placeholder-guest-normal-05" },
  christa: { right: floorRight(24), bottom: floorY(19), z: 6, legacyClass: "placeholder-guest-normal-06" },
  bohn: { ...f(34, 38), z: 6, legacyClass: "placeholder-guest-normal-07" },
  strange: { ...f(60, 43), z: 6, legacyClass: "placeholder-guest-strange-01" },
  nele: { ...f(50, 52), z: 5, legacyClass: "placeholder-guest-normal-08" },
  meda: { right: floorRight(28), bottom: floorY(31), z: 6, legacyClass: "placeholder-guest-strange-02" },
  roterRegenschirm: { ...f(30, 52), z: 5, legacyClass: "placeholder-guest-strange-03" },
  fatou: { ...f(46, 48), z: 5, legacyClass: "placeholder-guest-normal-09" },
  /** Zweiter Wartender in Rush-Phasen (per CSS-Opacity gesteuert). */
  waitingExtra: { right: floorRight(2), bottom: floorY(6), z: 6, legacyClass: "placeholder-guest-normal-02" },
} satisfies Record<string, GuestSpot>;

function f(fx: number, fy: number) {
  return { left: floorX(fx), bottom: floorY(fy) };
}

/* ── Paula-Choreografie (Warteschlangen-Gast) ──────────────────────────
   Wegpunkte in Stage-%, umgerechnet aus dem alten .cafe-queue-Rahmen
   (Floor 34 %/9 %, 16 %×41 %): queue-relative Werte wie left −195 % ergeben
   die absoluten Punkte hier. Übergänge laufen als CSS-Transition auf
   left/bottom (Klasse placeholder-guest-normal-01). */
const QUEUE_FRAME = {
  left: floorX(34),
  bottom: floorY(9),
  w: round((16 * FLOOR.width) / 100),
  h: round((41 * FLOOR.height) / 100),
};

const qx = (pct: number) => round(QUEUE_FRAME.left + (pct / 100) * QUEUE_FRAME.w);
const qy = (pct: number) => round(QUEUE_FRAME.bottom + (pct / 100) * QUEUE_FRAME.h);

export const PAULA_PATH = {
  /** Kalibriert auf die gemalte Tür (Sprite-Mitte ≈ dio x 8.4 %). */
  atDoor: { left: qx(-195), bottom: qy(130) },
  /** Wartepunkt in der Schlange. */
  queue: { left: qx(50), bottom: qy(8) },
  /** Nach dem Servieren: zur Theke (Norden im gemalten Raum). */
  toCounter: { left: qx(60), bottom: qy(185) },
  /** Abgang nach Osten aus dem Bild. */
  exitEast: { left: qx(420), bottom: qy(8) },
  z: 6,
} as const;

/* ── Möbel & Theke ─────────────────────────────────────────────────── */
export const TABLE_BASE = { w: round((22 * FLOOR.width) / 100), h: round((26 * FLOOR.height) / 100) };

export const TABLE_SPOTS = {
  left: { ...f(15, 19), z: 5, ...TABLE_BASE },
  right: { right: floorRight(22), bottom: floorY(15), z: 5, ...TABLE_BASE },
  back: { ...f(45, 47), z: 5, w: round((18 * FLOOR.width) / 100), h: round((16 * FLOOR.height) / 100) },
} satisfies Record<string, StageSpot>;

/** Theke: Rahmen für Kaffeemaschine + KASSANDRA-Kasse (bleiben Kinder,
    ihre Offsets liegen weiter in den CSS-Klassen). Alt: Floor top 53.8 %
    / left 59.6 % / 43.8 %×33.8 %. */
export const COUNTER_FRAME: StageSpot = {
  left: floorX(59.6),
  bottom: round(100 - (31 + 53.8 * 0.65) - 33.8 * 0.65),
  w: round((43.8 * FLOOR.width) / 100),
  h: round((33.8 * FLOOR.height) / 100),
  z: 4,
};

/* ── Décor-Slots (wandmontiert, px-Größen liegen in den Tier-Klassen) ── */
export const DECOR_SPOTS = {
  clock: { left: 49.5, top: 19.0, z: 8, centered: true },
  lamp: { left: 59.5, bottom: 37.0, z: 4, centered: true },
  cups: { left: 61.0, top: 72.0, z: 6 },
  plant: { left: 17.4, top: 55.4, z: 5 },
  plant2: { left: 78.0, top: 55.0, z: 5 },
  /** Regal rechts — sichtbarer Décor-Slot. */
  shelf: { right: 2, top: 37, w: 18, h: 45, z: 3 },
} satisfies Record<string, StageSpot>;

export const WEIRDNESS_SPOT: StageSpot = { right: 13, top: 18, w: 20, h: 32, z: 7 };
