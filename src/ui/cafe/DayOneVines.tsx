import { useEffect, useRef } from "react";

const WIDTH = 640;
const HEIGHT = 300;
const MAX_TIP_RETREAT = 6;

interface VineShape {
  weight: number;
  nodes: readonly (readonly [number, number])[];
}

interface VinePoint {
  x: number;
  y: number;
  length: number;
}

interface VineLeaf extends VinePoint {
  angle: number;
  size: number;
  colors: readonly [string, string, string];
}

// Keep the approved paths and translate their roots into the counter pot below.
const vineShapes: readonly VineShape[] = [
  { weight: 3.2, nodes: [
    [616, 219], [610, 194], [608, 165], [592, 151], [581, 132], [581, 104],
    [567, 89], [553, 72], [549, 46], [527, 35], [503, 40], [485, 35],
    [460, 44], [439, 56], [415, 62], [392, 72], [376, 83], [352, 87], [326, 99]
  ] },
  { weight: 2.8, nodes: [
    [627, 219], [641, 195], [648, 173], [651, 151], [665, 133], [682, 119],
    [703, 111], [726, 115], [750, 126], [775, 123], [804, 113], [823, 115],
    [842, 130], [854, 151], [873, 162], [895, 164]
  ] },
  { weight: 2.5, nodes: [
    [610, 216], [586, 211], [559, 228], [530, 235], [511, 249], [484, 257],
    [460, 256], [435, 265], [413, 279], [387, 282], [367, 290]
  ] },
  { weight: 2, nodes: [
    [415, 62], [408, 76], [399, 84], [396, 101], [404, 113], [407, 128], [401, 140]
  ] },
  { weight: 1.8, nodes: [
    [804, 113], [812, 129], [808, 143], [817, 156], [820, 170], [816, 186]
  ] },
  { weight: 1.9, nodes: [
    [581, 104], [592, 92], [612, 85], [624, 67], [627, 50], [642, 36]
  ] }
];

const leafColors = [
  ["#73813a", "#56602c", "#a5a451"],
  ["#8b8d40", "#64642c", "#b6ab57"],
  ["#697c3f", "#44582f", "#9da152"],
  ["#85984b", "#5c6d37", "#b3b96a"]
] as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, fraction: number) => from + (to - from) * fraction;

function smooth(value: number) {
  const fraction = clamp(value);
  return fraction * fraction * (3 - 2 * fraction);
}

function measureVine(shape: VineShape, seed: number) {
  const points: VinePoint[] = [];
  const nodes = shape.nodes.map(([x, y]) => ({ x, y }));
  let length = 0;
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const previous = nodes[Math.max(0, index - 1)];
    const start = nodes[index];
    const end = nodes[index + 1];
    const next = nodes[Math.min(index + 2, nodes.length - 1)];
    for (let step = 0; step < 7; step += 1) {
      const t = step / 7;
      const spline = (a: number, b: number, c: number, d: number) => .5 * (
        2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t ** 2
        + (3 * b - a - 3 * c + d) * t ** 3
      );
      const x = spline(previous.x, start.x, end.x, next.x);
      const y = spline(previous.y, start.y, end.y, next.y);
      const last = points[points.length - 1];
      if (last) length += Math.hypot(x - last.x, y - last.y);
      points.push({ x, y, length });
    }
  }
  const tip = nodes[nodes.length - 1];
  const last = points[points.length - 1];
  length += Math.hypot(tip.x - last.x, tip.y - last.y);
  points.push({ ...tip, length });

  const leaves: VineLeaf[] = [];
  let nextLeaf = 8 + seed;
  points.slice(1).forEach((point, index) => {
    if (point.length < nextLeaf || point.length > length - 2) return;
    const leaf = leaves.length;
    const previous = points[index];
    const side = (leaf + seed) % 2 === 0 ? 1 : -1;
    const direction = Math.atan2(point.y - previous.y, point.x - previous.x);
    leaves.push({
      ...point,
      angle: direction + side * (0.76 + ((leaf + 2 * seed) % 5) * .13),
      size: (9 + ((leaf * 7 + seed) % 8)) * mix(1, .72, point.length / length),
      colors: leafColors[(leaf + Math.floor(leaf / 4) + seed) % leafColors.length]
    });
    nextLeaf += 8 + ((leaf * 3 + seed) % 7);
  });

  return { ...shape, points, length, leaves };
}

const vines = vineShapes.map(measureVine);

function drawLeaf(context: CanvasRenderingContext2D, leaf: VineLeaf, growth: number) {
  const size = leaf.size;
  const [green, shade, light] = leaf.colors;
  context.save();
  context.translate(leaf.x, leaf.y);
  context.rotate(leaf.angle - .45 * (1 - growth));
  context.scale(growth, growth);
  context.shadowColor = "#4b2e2380";
  context.shadowBlur = 1.9;
  context.shadowOffsetY = 1.3;
  context.fillStyle = shade;
  context.beginPath();
  context.moveTo(0, 0);
  context.quadraticCurveTo(size * .18, -size * .47, size * .45, -size * .26);
  context.quadraticCurveTo(size * .75, -size * .24, size, 0);
  context.quadraticCurveTo(size * .70, size * .35, size * .40, size * .26);
  context.quadraticCurveTo(size * .15, size * .36, 0, 0);
  context.fill();
  context.shadowColor = "transparent";
  context.fillStyle = green;
  context.beginPath();
  context.moveTo(size * .10, 0);
  context.quadraticCurveTo(size * .31, -size * .28, size * .52, -size * .19);
  context.quadraticCurveTo(size * .80, -size * .15, size * .92, -.25);
  context.quadraticCurveTo(size * .49, size * .20, size * .10, 0);
  context.fill();
  context.beginPath();
  context.strokeStyle = light;
  context.lineWidth = .65;
  context.moveTo(size * .20, -.4);
  context.quadraticCurveTo(size * .43, -size * .12, size * .69, -.65);
  context.stroke();
  context.restore();
}

function drawVine(context: CanvasRenderingContext2D, vine: (typeof vines)[number], tipRetreat: number) {
  const visible = vine.length - tipRetreat;
  if (visible <= 0) return;

  const tipIndex = vine.points.findIndex((point) => point.length >= visible);
  const tip = vine.points[tipIndex];
  const beforeTip = vine.points[tipIndex - 1];
  const tipFraction = (visible - beforeTip.length) / (tip.length - beforeTip.length);
  context.save();
  context.shadowColor = "#4b2e2375";
  context.shadowBlur = 2;
  context.shadowOffsetX = 1;
  context.shadowOffsetY = 1.2;
  context.strokeStyle = "#53582e";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = vine.weight;
  context.beginPath();
  context.moveTo(vine.points[0].x, vine.points[0].y);
  for (let index = 1; index <= tipIndex; index += 1) {
    const before = vine.points[index - 1];
    const after = vine.points[index];
    const fraction = index === tipIndex ? tipFraction : 1;
    context.lineTo(mix(before.x, after.x, fraction), mix(before.y, after.y, fraction));
  }
  context.stroke();
  context.restore();

  for (const leaf of vine.leaves) {
    const growth = smooth((visible - leaf.length) / 13);
    if (growth > 0) drawLeaf(context, leaf, growth);
  }
}

export function DayOneVines({
  actionPointsSpent,
  actionPointsRemaining
}: {
  actionPointsSpent: number;
  actionPointsRemaining: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actionCapacity = actionPointsSpent + actionPointsRemaining;
  const shiftProgress = clamp(actionPointsSpent / Math.max(1, actionCapacity));

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const tipRetreat = MAX_TIP_RETREAT * shiftProgress;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.save();
    // The root cluster (616, 219) sits near the bottom center of the overlay.
    context.translate(WIDTH / 2 - 616, 200 - 219);
    for (const vine of vines) {
      drawVine(context, vine, tipRetreat);
    }
    context.restore();
  }, [shiftProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="cafe-day-one-vines"
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
    />
  );
}
