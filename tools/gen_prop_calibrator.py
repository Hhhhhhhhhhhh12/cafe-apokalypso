#!/usr/bin/env python3
"""
Generiert tools/prop-calibrator.html.

Aufruf:  python3 tools/gen_prop_calibrator.py
"""
import base64
import io
import json
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG   = os.path.join(ROOT, "assets/backgrounds/placeholder-cafe-stage-base-v03.png")
PROP_DIR = os.path.join(ROOT, "assets/sprites/props")
OUT  = os.path.join(ROOT, "tools/prop-calibrator.html")

STAGE_W, STAGE_H = 873, 625   # .cafe-world / .cafe-diorama in px
WORLD_SCALE = 1.35
ORIGIN_X    = 0.50             # transform-origin x (50% = center)
ORIGIN_Y    = 0.58             # transform-origin y

# Visible CSS-% range after 1.35x zoom:
#   left/right: ox ± ox/S  → [ox*(1-1/S), ox*(1+1/S)] as % of W
#   top/bottom: oy ± oy/S (top) and (H-oy) ± (H-oy)/S (bottom)
def clip_rect():
    ox = ORIGIN_X * STAGE_W
    oy = ORIGIN_Y * STAGE_H
    x0 = ox - ox / WORLD_SCALE
    x1 = ox + (STAGE_W - ox) / WORLD_SCALE
    y0 = oy - oy / WORLD_SCALE
    y1 = oy + (STAGE_H - oy) / WORLD_SCALE
    return {
        "x0pct": round(x0 / STAGE_W * 100, 2),
        "y0pct": round(y0 / STAGE_H * 100, 2),
        "x1pct": round(x1 / STAGE_W * 100, 2),
        "y1pct": round(y1 / STAGE_H * 100, 2),
    }

# (id, sprite, w, h, bg-position, start-left%, start-top%)
PROPS = [
    ("plant", "placeholder-cafe-plant.png", 68, 80, "center bottom", 46.4, 43.7),
    ("clock", "placeholder-cafe-clock.png", 56, 56, "center",        78.6, 23.7),
    ("lamp",  "placeholder-cafe-lamp.png",  48, 64, "center top",    47.7,  8.1),
    ("cups",  "placeholder-cafe-cups.png",  48, 40, "center",        78.4, 36.2),
    # shelf removed — painted background already has shelves
]

# Gemalte Anker (CSS-% = Bild-%)
ANCHORS = [
    ("A", 17, 33, "Oval über Tür"),
    ("B", 43, 30, "Oval li. Ecke"),
    ("C", 55, 29, "Oval re. Ecke"),
    ("D", 87, 35, "Oval re. Wand"),
    ("Regal↑", 82, 42, "Holzregal oben"),
    ("Regal↓", 82, 49, "Holzregal unten"),
]


def b64_png(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


def b64_bg(path, width=800, quality=78):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    nh   = round(h * width / w)
    img  = img.resize((width, nh), Image.LANCZOS)
    buf  = io.BytesIO()
    img.save(buf, format="JPEG", quality=quality)
    return base64.b64encode(buf.getvalue()).decode()


def main():
    bg_uri = "data:image/jpeg;base64," + b64_bg(BG)
    props  = []
    for pid, fname, w, h, bgpos, left, top in PROPS:
        uri = "data:image/png;base64," + b64_png(os.path.join(PROP_DIR, fname))
        props.append({"id": pid, "uri": uri, "w": w, "h": h,
                      "bgpos": bgpos, "left": left, "top": top})

    data = {
        "stageW":  STAGE_W, "stageH": STAGE_H,
        "scale":   WORLD_SCALE,
        "originX": ORIGIN_X, "originY": ORIGIN_Y,
        "clip":    clip_rect(),
        "bg":      bg_uri,
        "props":   props,
        "anchors": [{"label": a, "x": x, "y": y, "note": n}
                    for a, x, y, n in ANCHORS],
    }

    html = TEMPLATE.replace("/*__DATA__*/", json.dumps(data))
    with open(OUT, "w") as f:
        f.write(html)
    kb = os.path.getsize(OUT) / 1024
    print(f"✓ {OUT}  ({kb:.0f} KB)")
    cr = clip_rect()
    print(f"  Sichtbarer Bereich: x {cr['x0pct']}%–{cr['x1pct']}%, "
          f"y {cr['y0pct']}%–{cr['y1pct']}%")


TEMPLATE = r"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Café Apokalypso — Prop-Kalibrator</title>
<style>
:root{--bg:#1a2030;--panel:#22293a;--ink:#dde4f0;--muted:#7e8fa8;--accent:#68d49a;--hot:#ffb04a;--dim:rgba(0,0,0,.62)}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font:13px/1.4 ui-monospace,"SF Mono",Menlo,monospace;min-height:100vh}
header{padding:12px 16px;border-bottom:1px solid #2e3a52;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
header h1{font-size:14px;font-weight:700}
.modes{display:flex;gap:4px}
.modes button{font:inherit;padding:5px 11px;border-radius:6px;cursor:pointer;border:1px solid #3a4d6a;background:#273044;color:var(--muted)}
.modes button.on{background:var(--accent);color:#0e2218;border-color:var(--accent);font-weight:700}
.hint-bar{font-size:11px;color:var(--muted)}
.outer{display:flex;gap:14px;padding:14px;align-items:flex-start;flex-wrap:wrap}
/* ── STAGE ──────────────────────────────────────────────── */
.stage-wrap{flex:0 0 auto;position:relative}
.stage{position:relative;background:#111;outline:1px solid #2e3a52}
/* Spiel mode: clip world to diorama bounds */
.stage.mode-spiel{overflow:hidden}
/* Vollbild mode: no clip; dashed rect shows visible area */
.stage.mode-voll{overflow:visible}
.world{position:absolute;inset:0}
.stage.mode-spiel .world{transform:scale(1.35);transform-origin:center 58%}
.world>img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:fill}
/* clip overlay (Vollbild only) */
.clip-shim{position:absolute;pointer-events:none;z-index:90}
.stage.mode-spiel .clip-shim{display:none}
.clip-border{position:absolute;z-index:91;border:2px dashed var(--accent);pointer-events:none}
.stage.mode-spiel .clip-border{display:none}
/* Props */
.prop{position:absolute;background-repeat:no-repeat;background-size:contain;image-rendering:pixelated;cursor:grab;touch-action:none}
.prop:hover,.prop.sel{outline:1px dashed var(--hot)}
.prop.sel{z-index:60;cursor:grabbing}
/* Anchors */
.anch{position:absolute;width:14px;height:20px;border:2px solid var(--accent);border-radius:50%;margin:-10px 0 0 -7px;pointer-events:none;display:none}
.anch span{position:absolute;left:16px;top:-2px;white-space:nowrap;font-size:10px;color:var(--accent);text-shadow:0 1px 3px #000}
.stage.show-anchors .anch{display:block}
/* ── PANEL ───────────────────────────────────────────────── */
.panel{flex:1 1 290px;min-width:270px;background:var(--panel);border:1px solid #2e3a52;border-radius:10px;padding:13px}
.prop-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px;cursor:pointer}
.prop-row:hover,.prop-row.sel{background:#2d3d58}
.dot{width:10px;height:10px;border-radius:3px;flex:0 0 auto}
.pname{width:46px;font-weight:700}
.pval{color:var(--muted);flex:1;font-size:12px}
.pval b{color:var(--ink)}
.pvis{font-size:11px;color:#5a7a9a}
.ctl{margin-top:12px;display:flex;gap:7px;flex-wrap:wrap;align-items:center}
.ctl label{font-size:12px;color:var(--muted);cursor:pointer;display:flex;align-items:center;gap:5px}
.arrows{display:grid;grid-template-columns:repeat(3,28px);gap:3px;margin-top:10px}
.arrows button{font:inherit;padding:4px 0;background:#273044;border:1px solid #3a4d6a;color:var(--ink);border-radius:5px;cursor:pointer;text-align:center}
.arrows button:hover{background:#334968}
.arrows .sp{visibility:hidden}
button.primary{font:inherit;padding:8px 13px;background:var(--accent);color:#0e2218;border:none;border-radius:7px;cursor:pointer;font-weight:700}
button.sec{font:inherit;padding:8px 13px;background:#273044;color:var(--ink);border:1px solid #3a4d6a;border-radius:7px;cursor:pointer}
pre.css-out{margin-top:12px;background:#10141e;border:1px solid #2a3550;border-radius:7px;padding:11px;font-size:11px;color:#8fd4a8;white-space:pre-wrap;max-height:220px;overflow:auto}
.note{margin-top:8px;font-size:11px;color:var(--muted);line-height:1.5}
</style>
</head>
<body>
<header>
  <h1>☕ Prop-Kalibrator</h1>
  <div class="modes">
    <button id="btn-voll" class="on">🔍 Vollbild</button>
    <button id="btn-spiel">▶ Spiel-Ansicht</button>
  </div>
  <span class="hint-bar">Props ziehen · Pfeil-Buttons = 0,2 %-Schritte · CSS direkt kopieren</span>
</header>
<div class="outer">
  <div class="stage-wrap">
    <div class="stage mode-voll show-anchors" id="stage">
      <div class="world" id="world">
        <img class="bg" id="bg">
      </div>
      <!-- clip overlay shims (Vollbild only) -->
      <div class="clip-shim" id="shim-top"    style="top:0;left:0;right:0"></div>
      <div class="clip-shim" id="shim-bottom" style="left:0;right:0;bottom:0"></div>
      <div class="clip-shim" id="shim-left"   style="background:var(--dim)"></div>
      <div class="clip-shim" id="shim-right"  style="background:var(--dim)"></div>
      <div class="clip-border" id="clip-border"></div>
    </div>
  </div>
  <div class="panel">
    <div id="rows"></div>
    <div class="ctl">
      <label><input type="checkbox" id="chk-anchors" checked> Anker-Ovale</label>
    </div>
    <div class="arrows">
      <span class="sp"></span><button data-dx="0" data-dy="-0.2">↑</button><span class="sp"></span>
      <button data-dx="-0.2" data-dy="0">←</button><button data-dx="0" data-dy="0">•</button><button data-dx="0.2" data-dy="0">→</button>
      <span class="sp"></span><button data-dx="0" data-dy="0.2">↓</button><span class="sp"></span>
    </div>
    <div class="ctl" style="margin-top:12px">
      <button class="primary" id="btn-copy">CSS kopieren</button>
      <button class="sec"     id="btn-reset">Zurücksetzen</button>
    </div>
    <pre class="css-out" id="css-out"></pre>
    <p class="note">
      <b>Vollbild</b>: zeigt den kompletten CSS-Koordinatenraum (873×625 px).<br>
      Der <span style="color:var(--accent)">grüne Rahmen</span> markiert was im Spiel sichtbar ist.<br>
      <b>Spiel-Ansicht</b>: exakt der gerenderte Diorama-Ausschnitt (1.35×).
    </p>
  </div>
</div>
<script>
const D = /*__DATA__*/;
const LS = "cafe-calib.v2";
const stage = document.getElementById("stage");
const world = document.getElementById("world");
document.getElementById("bg").src = D.bg;

// Gespeicherten Stand laden
let saved = {};
try { saved = JSON.parse(localStorage.getItem(LS)||"{}"); } catch(e){}
const props = D.props.map(p => ({...p,
  left: saved[p.id]?.left ?? p.left,
  top:  saved[p.id]?.top  ?? p.top}));

const COLORS = {plant:"#74bb5e",clock:"#d9a441",lamp:"#e0c14a",cups:"#b0bfc8",shelf:"#b07a4a"};
let selId = props[0].id;
let mode  = "voll"; // "voll" | "spiel"

// ── Stage-Größe ───────────────────────────────────────────
stage.style.width  = D.stageW + "px";
stage.style.height = D.stageH + "px";

// ── Clip-Overlay (Vollbild) ───────────────────────────────
const cr = D.clip; // {x0pct,y0pct,x1pct,y1pct}
function updateShims() {
  if (mode !== "voll") return;
  const W = D.stageW, H = D.stageH;
  const x0 = cr.x0pct/100*W, x1 = cr.x1pct/100*W;
  const y0 = cr.y0pct/100*H, y1 = cr.y1pct/100*H;
  const set = (id, t, l, w, h, bg) => {
    const el = document.getElementById(id);
    el.style.top  = t+"px"; el.style.left = l+"px";
    el.style.width= w+"px"; el.style.height=h+"px";
    if (bg) el.style.background = bg;
  };
  set("shim-top",    0,  0,  W,   y0, "var(--dim)");
  set("shim-bottom", y1, 0,  W,   H-y1, "var(--dim)");
  set("shim-left",   y0, 0,  x0,  y1-y0);
  set("shim-right",  y0, x1, W-x1,y1-y0);
  const brd = document.getElementById("clip-border");
  brd.style.left=x0+"px"; brd.style.top=y0+"px";
  brd.style.width=(x1-x0)+"px"; brd.style.height=(y1-y0)+"px";
}

// ── Prop-Elemente ─────────────────────────────────────────
const els = {};
for (const p of props) {
  const el = document.createElement("div");
  el.className = "prop";
  el.dataset.id = p.id;
  const rot = p.id === "clock" ? "rotate(-90deg)" : "";
  el.style.cssText = `width:${p.w}px;height:${p.h}px;background-image:url(${p.uri});background-position:${p.bgpos};${rot?"transform:"+rot+";":""}`;
  world.appendChild(el);
  els[p.id] = el;
  el.addEventListener("pointerdown", onDown);
}

// ── Anker ─────────────────────────────────────────────────
for (const a of D.anchors) {
  const d = document.createElement("div");
  d.className = "anch";
  d.style.left = a.x+"%"; d.style.top = a.y+"%";
  d.innerHTML  = `<span>${a.label}</span>`;
  world.appendChild(d);
}

// ── Layout ────────────────────────────────────────────────
function layout() {
  for (const p of props) {
    const el = els[p.id];
    el.style.left = p.left+"%";
    el.style.top  = p.top+"%";
    el.classList.toggle("sel", p.id === selId);
  }
  updateShims();
  renderPanel();
  renderCss();
  persist();
}

function visualCenter(p) {
  const S  = D.scale;
  const ox = D.originX * D.stageW, oy = D.originY * D.stageH;
  const cx = p.left/100*D.stageW + p.w/2;
  const cy = p.top /100*D.stageH + p.h/2;
  return {
    x: +((ox + (cx-ox)*S) / D.stageW * 100).toFixed(1),
    y: +((oy + (cy-oy)*S) / D.stageH * 100).toFixed(1),
  };
}

function isClipped(p) {
  const S  = D.scale;
  const ox = D.originX * D.stageW, oy = D.originY * D.stageH;
  const edges = [
    [p.left/100*D.stageW, p.top/100*D.stageH],
    [p.left/100*D.stageW + p.w, p.top/100*D.stageH + p.h],
  ];
  return edges.every(([cx,cy]) => {
    const vx = ox + (cx-ox)*S, vy = oy + (cy-oy)*S;
    return vx < 0 || vx > D.stageW || vy < 0 || vy > D.stageH;
  });
}

function renderPanel() {
  const rows = document.getElementById("rows");
  rows.innerHTML = "";
  for (const p of props) {
    const v    = visualCenter(p);
    const clip = isClipped(p);
    const row  = document.createElement("div");
    row.className = "prop-row"+(p.id===selId?" sel":"");
    row.innerHTML =
      `<span class="dot" style="background:${COLORS[p.id]||'#888'}"></span>`+
      `<span class="pname">${p.id}</span>`+
      `<span class="pval"><b>${p.left.toFixed(1)}% / ${p.top.toFixed(1)}%</b>`+
      `<br><span class="pvis">${clip?"⚠️ außerhalb Spielbereich":"sicht. "+v.x+"% / "+v.y+"%"}</span></span>`;
    row.addEventListener("click", () => { selId = p.id; layout(); });
    rows.appendChild(row);
  }
}

function renderCss() {
  let s = "";
  for (const p of props)
    s += `.cafe-decor-${p.id} {\n  left: ${p.left.toFixed(1)}%;\n  top: ${p.top.toFixed(1)}%;\n}\n`;
  document.getElementById("css-out").textContent = s.trim();
}

function persist() {
  const o = {}; for (const p of props) o[p.id] = {left:p.left,top:p.top};
  try { localStorage.setItem(LS, JSON.stringify(o)); } catch(e){}
}

// ── Modus-Toggle ─────────────────────────────────────────
function setMode(m) {
  mode = m;
  stage.classList.toggle("mode-voll",  m==="voll");
  stage.classList.toggle("mode-spiel", m==="spiel");
  document.getElementById("btn-voll") .classList.toggle("on", m==="voll");
  document.getElementById("btn-spiel").classList.toggle("on", m==="spiel");
  layout();
}
document.getElementById("btn-voll") .addEventListener("click", ()=>setMode("voll"));
document.getElementById("btn-spiel").addEventListener("click", ()=>setMode("spiel"));

// ── Drag ─────────────────────────────────────────────────
let drag = null;

function fitScale() {
  const m = new DOMMatrixReadOnly(getComputedStyle(document.querySelector(".stage-wrap")).transform);
  // stage-wrap itself has no transform; fit is on a parent none here
  return currentFitScale;
}

let currentFitScale = 1;

function onDown(e) {
  const id = e.currentTarget.dataset.id;
  selId = id; layout();
  const p = props.find(x=>x.id===id);
  // In Spiel-mode, visual movement = css movement * 1.35
  // So to convert px mouse-delta → css-%, divide by (fitScale * (mode=spiel ? scale : 1))
  const worldFactor = mode==="spiel" ? D.scale : 1;
  drag = {p, sx:e.clientX, sy:e.clientY, l0:p.left, t0:p.top,
          fw: currentFitScale * worldFactor};
  e.currentTarget.setPointerCapture(e.pointerId);
  e.preventDefault();
}
window.addEventListener("pointermove", e => {
  if (!drag) return;
  const dl = (e.clientX-drag.sx) / drag.fw / D.stageW * 100;
  const dt = (e.clientY-drag.sy) / drag.fw / D.stageH * 100;
  drag.p.left = +Math.max(-15, Math.min(105, drag.l0+dl)).toFixed(1);
  drag.p.top  = +Math.max(-15, Math.min(105, drag.t0+dt)).toFixed(1);
  layout();
});
window.addEventListener("pointerup", () => { drag=null; });

// ── Pfeil-Buttons ────────────────────────────────────────
document.querySelectorAll(".arrows button").forEach(b=>{
  b.addEventListener("click", ()=>{
    const dx=parseFloat(b.dataset.dx||0), dy=parseFloat(b.dataset.dy||0);
    const p=props.find(x=>x.id===selId); if(!p)return;
    p.left=+(p.left+dx).toFixed(1); p.top=+(p.top+dy).toFixed(1); layout();
  });
});

// ── Anker-Toggle ─────────────────────────────────────────
document.getElementById("chk-anchors").addEventListener("change", e=>{
  stage.classList.toggle("show-anchors", e.target.checked);
});

// ── Copy/Reset ───────────────────────────────────────────
document.getElementById("btn-copy").addEventListener("click", async ()=>{
  try {
    await navigator.clipboard.writeText(document.getElementById("css-out").textContent);
    const b=document.getElementById("btn-copy"); b.textContent="✓ kopiert";
    setTimeout(()=>b.textContent="CSS kopieren",1400);
  } catch(e){ alert("Clipboard blockiert — Text manuell kopieren."); }
});
document.getElementById("btn-reset").addEventListener("click", ()=>{
  localStorage.removeItem(LS);
  for (const p of props){ const d=D.props.find(x=>x.id===p.id); p.left=d.left; p.top=d.top; }
  layout();
});

// ── Fit ──────────────────────────────────────────────────
const stageWrap = document.querySelector(".stage-wrap");
function doFit(){
  const panel = 330;
  const avail = Math.max(300, Math.min(window.innerWidth - panel - 30, D.stageW));
  const s = avail / D.stageW;
  currentFitScale = s;
  stageWrap.style.transform = `scale(${s})`;
  stageWrap.style.transformOrigin = "top left";
  stageWrap.style.width  = (D.stageW * s) + "px";
  stageWrap.style.height = (D.stageH * s) + "px";
}
window.addEventListener("resize", doFit);
doFit();
layout();
</script>
</body>
</html>"""


if __name__ == "__main__":
    main()
