import { useEffect, useRef, useState } from "react";

interface IntroSequenceProps {
  /** Dismiss the cinematic and hand off to the setup phase. */
  onComplete: () => void;
}

type Beat = {
  subtitle: string;
  glitch?: true;
  veilOpacity: number;
};

const BEATS: readonly Beat[] = [
  { subtitle: "",                          veilOpacity: 1    }, // full dark
  { subtitle: "Morning.",                  veilOpacity: 0.72 }, // dawn
  { subtitle: "The café is yours.",        veilOpacity: 0.40 },
  { subtitle: "Previous runs: [REDACTED]", veilOpacity: 0.12, glitch: true }, // crack
  { subtitle: "",                          veilOpacity: 0    }, // reveal
];
const BEAT_TIMES_MS = [0, 900, 3000, 5200, 7200];
const COMPLETE_MS = 8800;

/**
 * Diegetic cinematic cold-open. Renders as a fixed overlay above the real café
 * diorama: a dark veil fades away, sparse subtitles float at the bottom, one
 * "crack" (the register's [REDACTED] line) breaks the calm before the setup
 * phase begins. Self-running, ~9 s, skippable with the keyboard or button.
 *
 * See docs/PROJECT_CANON.md for story intent and CLAUDE.md for the walk
 * choreography notes (Paula enters diegetically in the diorama below).
 */
export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const completedRef = useRef(false);

  function skip() {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BEATS.forEach((beat, i) => {
      if (i === 0) return;
      timers.push(
        setTimeout(() => {
          setBeatIndex(i);
          if (beat.subtitle) {
            setSubtitleVisible(false);
            timers.push(setTimeout(() => setSubtitleVisible(true), 100));
          } else {
            setSubtitleVisible(false);
          }
        }, BEAT_TIMES_MS[i])
      );
    });

    timers.push(
      setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }, COMPLETE_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beat = BEATS[beatIndex];

  return (
    <div className="intro-cinema">
      <div className="intro-cinema__veil" style={{ opacity: beat.veilOpacity }} />
      {beat.subtitle && (
        <p
          className={[
            "intro-cinema__subtitle",
            subtitleVisible ? "intro-cinema__subtitle--visible" : "",
            beat.glitch ? "intro-cinema__subtitle--glitch" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {beat.subtitle}
        </p>
      )}
      <button
        type="button"
        className="intro-cinema__skip"
        onClick={skip}
        aria-label="Skip intro"
      >
        Skip
      </button>
    </div>
  );
}
