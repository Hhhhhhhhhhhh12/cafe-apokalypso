import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import roomAsset from "../../../assets/sprites/intro/placeholder-intro-arcana-room-v02.png";
import roofCleanPlate from "../../../assets/sprites/intro/placeholder-intro-roof-clean-plate-v01.png";
import roomDetailPlate from "../../../assets/sprites/intro/placeholder-intro-room-details-v01.png";
import ivyAsset from "../../../assets/sprites/intro/placeholder-intro-ivy-tendril-v01.png";
import doorAsset from "../../../assets/sprites/intro/placeholder-intro-door-v01.png";
import plantAsset from "../../../assets/sprites/intro/placeholder-intro-plant-v02-arcana.png";
import animalAsset from "../../../assets/sprites/intro/placeholder-intro-animal-v01.png";

interface IntroSequenceProps {
  children?: ReactNode;
  notice?: ReactNode;
  onComplete: () => void;
}

const OPENING_MS = 2100;
const CATCH_MS = 850;
const DOOR_OUTLINE = "M0 0V-226C0-265 16-284 48-291C73-296 105-269 108-236V0Z";

const BEATS = [
  { id: "dark", duration: 650 },
  { id: "cutting", duration: 950 },
  { id: "opening", duration: OPENING_MS },
  { id: "reveal", duration: 450 },
  { id: "fleeing", duration: 950 },
  { id: "snap", duration: CATCH_MS },
  { id: "settled", duration: 1350 },
  { id: "relics", duration: 1650 },
  { id: "ready", duration: 0 },
] as const;

const FLUTTER_BEFORE_BITE_MS = BEATS.slice(
  BEATS.findIndex(({ id }) => id === "opening"),
  BEATS.findIndex(({ id }) => id === "snap"),
).reduce<number>((total, { duration }) => total + duration, 0);

const PHASE_LAYERS = [
  ["cutting", "is-cut"], ["opening", "is-open"], ["reveal", "is-revealed"],
  ["fleeing", "is-fleeing"], ["snap", "is-snapping"],
] as const;

function IntroIcon({ kind }: { kind: "play" | "pause" | "next" | "replay" | "enter" | "close" }) {
  const paths = {
    play: "M8 5l11 7-11 7Z",
    pause: "M8 5v14M16 5v14",
    next: "M8 5l8 7-8 7",
    replay: "M4 10a8 8 0 1 1 1 8M4 4v6h6",
    enter: "M13 3h7v18h-7M3 12h12M10 7l5 5-5 5",
    close: "M6 6l12 12M18 6 6 18",
  };
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={paths[kind]} />
  </svg>;
}

function ArcanaDoor() {
  const id = useId();
  const outline = `${id}-outline`;
  const shadow = `${id}-shadow`;
  const timber = `${id}-timber`;
  return <svg className="arcana-doorway" viewBox="0 0 1672 941" aria-hidden="true">
    <defs>
      <clipPath id={outline}><path d={DOOR_OUTLINE} /></clipPath>
      <linearGradient id={shadow} x2="0" y2="1">
        <stop stopColor="#211209" stopOpacity=".76" />
        <stop offset="1" stopColor="#211209" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={timber}>
        <stop stopColor="#352215" />
        <stop offset=".52" stopColor="#755031" />
        <stop offset="1" stopColor="#9b7048" />
      </linearGradient>
    </defs>
    {/* This origin sits on the painted right jamb at floor level. */}
    <g transform="translate(265 507)">
      <g transform="matrix(-1 .324 0 1 0 0)" clipPath={`url(#${outline})`}>
        <rect className="arcana-doorway-shade" y="-300" width="108" height="300" fill="#16110b" />
      </g>
      <path className="arcana-door-shadow" d="M0 0H108L104 116 3 136Z" fill={`url(#${shadow})`} />
      <path className="arcana-door-rear" d={DOOR_OUTLINE} fill="#64462d" />
      <path className="arcana-door-edge" d="M0 -236H7V0H0Z" fill={`url(#${timber})`} />
      <g className="arcana-door-face" clipPath={`url(#${outline})`}>
        <path d={DOOR_OUTLINE} fill="#3b281c" />
        {/* Straighten the perspective baked into the painted planks before projecting the leaf. */}
        <image href={doorAsset} width="1024" height="1536" transform="matrix(.19 -.045 0 .217 -43.9 -282.8)" />
      </g>
    </g>
  </svg>;
}

function ArcanaPlant() {
  const id = useId();
  const hood = `${id}-hood`;
  const body = `${id}-body`;
  return <svg className="arcana-plant" viewBox="0 0 1254 1254" aria-hidden="true">
    <defs>
      <clipPath id={hood}>
        <path d="M0 0H642L676 251L654 347L614 427L545 464L503 452L467 429L414 434L388 449L348 446L315 404H0Z" />
      </clipPath>
      <mask id={body} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
        <rect width="1254" height="1254" fill="white" />
        {/* Leave overlap at the hinge so the silhouette does not split when it closes. */}
        <path d="M0 0H479L523 210L527 315L502 418L474 441L397 449L353 441L318 403H0Z" fill="black" />
      </mask>
    </defs>
    <image className="arcana-plant-still" href={plantAsset} width="1254" height="1254" />
    <g className="arcana-plant-bite">
      <image href={plantAsset} width="1254" height="1254" mask={`url(#${body})`} />
      <g className="arcana-plant-hood">
        <image href={plantAsset} width="1254" height="1254" clipPath={`url(#${hood})`} />
      </g>
    </g>
  </svg>;
}

function initialReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Isolated animated opening; the actual café only becomes interactive on handoff. */
export function IntroSequence({ children, notice, onComplete }: IntroSequenceProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(initialReducedMotion);
  const completedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pausedAnimations = useRef<Animation[]>([]);
  const phaseClock = useRef({ index: 0, remaining: Number(BEATS[0].duration) });
  const beat = BEATS[beatIndex];
  const worldLayers = PHASE_LAYERS.filter(([phase]) => beatIndex >= BEATS.findIndex(({ id }) => id === phase))
    .map(([, className]) => className).join(" ");
  const isReady = beat.id === "ready";

  const complete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    const loaders = [roomAsset, roofCleanPlate, roomDetailPlate, ivyAsset, doorAsset, plantAsset, animalAsset].map(src =>
      new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("intro asset unavailable"));
        image.src = src;
      })
    );
    Promise.all(loaders).then(() => {
      if (!cancelled) setAssetsReady(true);
    }).catch(() => {
      if (!cancelled) setLoadFailed(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (phaseClock.current.index !== beatIndex) {
      phaseClock.current = { index: beatIndex, remaining: Number(beat.duration) };
    }
    if (!assetsReady || paused || reducedMotion || isReady || clearing) return;
    const started = Date.now();
    const timer = setTimeout(() => setBeatIndex(index => index + 1), phaseClock.current.remaining);
    return () => {
      clearTimeout(timer);
      phaseClock.current.remaining = Math.max(0, phaseClock.current.remaining - (Date.now() - started));
    };
  }, [assetsReady, beatIndex, beat.duration, paused, reducedMotion, isReady, clearing]);

  useEffect(() => {
    if (paused) {
      pausedAnimations.current = (rootRef.current?.getAnimations({ subtree: true }) ?? [])
        .filter(animation => animation.playState === "running");
      pausedAnimations.current.forEach(animation => animation.pause());
    } else {
      pausedAnimations.current.forEach(animation => {
        if (animation.playState === "paused") animation.play();
      });
      pausedAnimations.current = [];
    }
  }, [paused]);

  useEffect(() => {
    if (!clearing) return;
    const timer = setTimeout(complete, reducedMotion ? 0 : 2200);
    return () => clearTimeout(timer);
  }, [clearing, complete, reducedMotion]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        complete();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [complete]);

  function replay() {
    setBeatIndex(0);
    setPaused(false);
    phaseClock.current = { index: 0, remaining: Number(BEATS[0].duration) };
  }

  return (
    <div ref={rootRef} className={`intro-cinema intro-cinema--arcana${paused ? " intro-cinema--paused" : ""}${reducedMotion ? " intro-cinema--reduced" : ""}`}
      role="dialog" aria-modal="true" aria-label="Das überwucherte Café" lang="de"
      data-phase={clearing ? "clearing" : beat.id} data-beat={beatIndex}>
      <div className="intro-cinema__scene arcana-scene" aria-hidden="true" inert>
        <div className={`arcana-world ${worldLayers}`}
          style={{
            "--arcana-opening-time": `${OPENING_MS}ms`,
            "--arcana-catch-time": `${CATCH_MS}ms`,
            "--arcana-flutter-before-bite": `${FLUTTER_BEFORE_BITE_MS}ms`,
          } as CSSProperties}>
          <div className="arcana-door-lit-room">
            <img className="arcana-room" src={roomAsset} alt="" />
            <img className="arcana-room arcana-roof-clean-plate" src={roofCleanPlate} alt="" />
            <img className="arcana-room arcana-clock-detail" src={roomDetailPlate} alt="" />
            <img className="arcana-room arcana-puddle-detail" src={roomDetailPlate} alt="" />
            <ArcanaDoor />
            <div className="arcana-vine-anchor arcana-vine-anchor--one"><img className="arcana-vine" src={ivyAsset} alt="" /></div>
            <div className="arcana-vine-anchor arcana-vine-anchor--two"><img className="arcana-vine" src={ivyAsset} alt="" /></div>
            <img className="arcana-frond arcana-frond--one" src={ivyAsset} alt="" />
            <img className="arcana-frond arcana-frond--two" src={ivyAsset} alt="" />
            <div className="arcana-motes">
              {[ [20, 43], [24, 52], [31, 58], [35, 65], [42, 70], [48, 76] ].map(([left, top], index) =>
                <span key={index} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${-index * .8}s` }} />
              )}
            </div>
            <div className="arcana-animal-window">
              <img className="arcana-animal" src={animalAsset} alt="" />
            </div>
            <img className="arcana-floor-vine" src={ivyAsset} alt="" />
            <div className="arcana-plant-bed">
              <ArcanaPlant />
            </div>
            <span className="arcana-butterfly arcana-butterfly--one"><i /><i /></span>
            <span className="arcana-butterfly arcana-butterfly--two"><i /><i /></span>
            <span className="arcana-butterfly arcana-butterfly--caught"><i /><i /></span>
            <span className="arcana-firefly arcana-firefly--cyan" />
            <span className="arcana-firefly arcana-firefly--violet" />
            <span className="arcana-firefly arcana-firefly--red" />
            <span className="arcana-water-drop" />
            <span className="arcana-puddle-ripple" />
          </div>
        </div>
        <div className="arcana-clean-room">{children}</div>
      </div>
      <div className="intro-cinema__story">
        {notice}
        {loadFailed && <span className="sr-only" role="alert">Das Intro konnte nicht geladen werden. Du kannst es überspringen.</span>}
        <div className="intro-cinema__controls">
          {isReady && !clearing ? <>
            <button className="intro-cinema__begin intro-cinema__icon" type="button" onClick={() => setClearing(true)}
              aria-label="Aussortieren & aufräumen" title="Aussortieren & aufräumen"><IntroIcon kind="enter" /></button>
            <button className="intro-cinema__secondary intro-cinema__icon" type="button" onClick={replay}
              aria-label="Noch einmal ansehen" title="Noch einmal ansehen"><IntroIcon kind="replay" /></button>
          </> : assetsReady && !clearing && !loadFailed ? reducedMotion ?
            <button className="intro-cinema__begin intro-cinema__icon" type="button" onClick={() => setBeatIndex(index => Math.min(index + 1, BEATS.length - 1))}
              aria-label="Weiter" title="Weiter"><IntroIcon kind="next" /></button> :
            <button className="intro-cinema__secondary intro-cinema__icon" type="button" onClick={() => setPaused(value => !value)}
              aria-pressed={paused} aria-label={paused ? "Fortsetzen" : "Pause"} title={paused ? "Fortsetzen" : "Pause"}>
              <IntroIcon kind={paused ? "play" : "pause"} />
            </button> : null}
        </div>
      </div>
      <button type="button" className="intro-cinema__skip intro-cinema__icon" onClick={complete}
        aria-label="Intro überspringen" title="Intro überspringen" autoFocus><IntroIcon kind="close" /></button>
    </div>
  );
}
