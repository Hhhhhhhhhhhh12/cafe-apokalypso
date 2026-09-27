// Erzeugt die Repo-Screenshots unter docs/screenshots/ aus dem laufenden
// Dev-Server. Zweck: neue Mitarbeitende (Mensch oder Agent) sehen den
// aktuellen Look, ohne selbst zu starten.
//
// Playwright ist bewusst KEINE Projekt-Dependency (schwerer Browser-Download).
// Einmalige Einrichtung zum Neu-Erzeugen der Screenshots:
//   npm i -D playwright && npx playwright install chromium
//
// Voraussetzung: Dev-Server läuft (npm run dev) auf BASE (Default 5173).
// Aufruf:  node tools/screenshot-scenes.mjs
//          BASE=http://localhost:5173 node tools/screenshot-scenes.mjs
//
// CHROMIUM_BIN=<pfad> nutzt einen bereits vorhandenen Chromium-Build statt des
// von Playwright gepinnten (siehe unten).
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:5173";
const APP = `${BASE}/cafe-apokalypso/`;
const LOOKBOOK = `${APP}lookbook.html`;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "screenshots");
mkdirSync(OUT, { recursive: true });

const DIORAMA_STATES = [
  { match: /Day 1/, file: "diorama-day1-calm.png" },
  { match: /Day 4/, file: "diorama-day4-busy.png" },
  { match: /Day 7/, file: "diorama-day7-uncanny.png" },
];

// CHROMIUM_BIN erlaubt einen bereits vorhandenen Chromium-Build (z. B. aus
// einem früheren Playwright-Cache), falls `npx playwright install chromium`
// nicht laufen soll. Sonst nutzt Playwright seinen eigenen gepinnten Browser.
const browser = await chromium.launch(
  process.env.CHROMIUM_BIN ? { executablePath: process.env.CHROMIUM_BIN } : {}
);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

// 1) Volle Spiel-UI (Startzustand) — zeigt HUD, Diorama, Action-Panel zusammen.
await page.goto(APP, { waitUntil: "networkidle" });
await page.locator(".cafe-diorama").first().waitFor();
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "full-ui-day1.png") });
console.log("✓ full-ui-day1.png");

// 2) Diorama je Tageszustand aus dem Lookbook (nur die Bühne, ohne Panels).
await page.goto(LOOKBOOK, { waitUntil: "networkidle" });
await page.locator(".cafe-diorama").first().waitFor();
for (const state of DIORAMA_STATES) {
  await page.locator("button", { hasText: state.match }).first().click();
  await page.waitForTimeout(500); // Übergänge/Atem-Animation einschwingen lassen
  const diorama = page.locator(".cafe-diorama").first();
  await diorama.scrollIntoViewIfNeeded();
  await diorama.screenshot({ path: join(OUT, state.file) });
  console.log(`✓ ${state.file}`);
}

await browser.close();
console.log(`\nFertig — Screenshots in ${OUT}`);
