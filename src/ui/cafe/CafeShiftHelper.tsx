import { useEffect, useId, useRef, useState } from "react";
import { getDayFiveHelperRecap } from "../../game/engine/management";
import type { GameState } from "../../game/types/game";
import jana from "../../../assets/sprites/guests/placeholder-staff-jana-v02-off-duty-approved.webp";
import nino from "../../../assets/sprites/guests/placeholder-staff-nino-v02-off-duty-approved.webp";
import nele from "../../../assets/sprites/guests/placeholder-staff-nele-v02-off-duty-approved.webp";

const staffPortraits = { jana, nino, nele };

export function StaffPortrait({ helperId, className, alt }: {
  helperId: keyof typeof staffPortraits;
  className?: string;
  alt: string;
}) {
  return <img className={className} src={staffPortraits[helperId]} alt={alt} />;
}

type WorkIcon = "broom" | "cup" | "star" | "flyer" | "calm" | "milk";
type WorkCue = { icon: WorkIcon; phase: "ready" | "done" | "working"; value?: string };

function WorkSymbol({ icon }: { icon: WorkIcon }) {
  const paths: Record<WorkIcon, string> = {
    broom: "M15 2 8 12 M5 11l7 4-4 6-7-4z M4 16l3 2 M7 13l-3 5",
    cup: "M3 6h13v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z M16 7h2a3 3 0 0 1 0 6h-2 M2 22h17",
    star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
    flyer: "M5 2h14v20H5z M8 7h8 M8 11h8 M8 15h5",
    calm: "M2 7h11c5 0 5-5 2-5 M2 12h17c4 0 4 6 0 6 M2 17h8",
    milk: "M8 2h8v4l3 4v12H5V10l3-4z M8 6h8 M5 10h14",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d={paths[icon]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function CafeShiftHelper({ gameState }: { gameState: GameState }) {
  const detailsId = useId();
  const workRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const detailsOpen = pinned || hovered;
  useEffect(() => {
    if (!pinned) return;
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !workRef.current?.contains(event.target)) {
        setPinned(false);
        setHovered(false);
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    return () => document.removeEventListener("pointerdown", dismissOutside);
  }, [pinned]);
  useEffect(() => {
    if (!detailsOpen) return;
    const dismissHover = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(false);
        setHovered(false);
      }
    };
    document.addEventListener("keydown", dismissHover);
    return () => document.removeEventListener("keydown", dismissHover);
  }, [detailsOpen]);
  const assignment = gameState.helperAssignment;
  if (gameState.day !== 5 || gameState.dayPhase !== "open" || !assignment?.locked ||
      gameState.cafeClosed || gameState.demoComplete) return null;

  const { helperId, taskId } = assignment;
  const { dayFiveHelperImpact: impact, helperAutonomousActions, extraAdvertisingActions,
    advertisingRun, helperExtraOrdersRemaining } = gameState.dayManagement;
  const name = { jana: "Jana", nino: "Nino", nele: "Nele" }[helperId];
  const cues: WorkCue[] = [];
  const ready: string[] = [];
  if (taskId === "cleaning") {
    cues.push({ icon: "broom", phase: helperAutonomousActions ? "done" : "working",
      value: helperAutonomousActions ? String(helperAutonomousActions) : undefined });
  }
  if (taskId === "barista") {
    if (impact?.reputationGained) cues.push({ icon: "star", phase: "done", value: `+${impact.reputationGained}` });
    if (impact?.milkSaved) cues.push({ icon: "milk", phase: "done", value: String(impact.milkSaved) });
    if (gameState.dayManagement.baristaReputationBonus < 3) {
      cues.push({ icon: "star", phase: "ready" });
      ready.push("Reputation bonus available for espresso or cappuccino");
    }
  }
  if (taskId === "counter" && impact?.openingStressReduction) {
    cues.push({ icon: "calm", phase: "done", value: `−${impact.openingStressReduction}` });
  }
  if (taskId === "marketing") {
    if (advertisingRun) cues.push({ icon: "flyer", phase: "done" });
    if (extraAdvertisingActions > 0) {
      cues.push({ icon: "flyer", phase: "ready", value: "0 AP" });
      ready.push("Flyer ready without spending an action");
    }
  }
  if (taskId === "service" || taskId === "counter" || taskId === "marketing") {
    if (impact?.extraOrders) cues.push({ icon: "cup", phase: "done", value: String(impact.extraOrders) });
    if (helperExtraOrdersRemaining > 0) {
      cues.push({ icon: "cup", phase: "ready", value: String(helperExtraOrdersRemaining) });
      ready.push(`${helperExtraOrdersRemaining} extra order${helperExtraOrdersRemaining === 1 ? "" : "s"} ready if stock allows`);
    }
  }
  if (!cues.length) cues.push({ icon: taskId === "marketing" ? "flyer" : "cup", phase: "working" });
  // Keep the floor readable: one earned effect and one available benefit.
  // The disclosure retains every recorded effect, including secondary savings.
  const earned = cues.find(cue => cue.phase === "done");
  const available = cues.find(cue => cue.phase === "ready");
  const visibleCues = earned && available ? [earned, available] : cues.slice(0, 2);
  const work = [getDayFiveHelperRecap(assignment, gameState.dayManagement), ...ready].join(" ");

  return (
    <div className={`cafe-shift-helper cafe-shift-helper--${taskId}`} data-helper={helperId}>
      <StaffPortrait helperId={helperId} alt={name} />
      <div className="cafe-shift-helper__work" ref={workRef}
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
        onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(false); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setPinned(false); setHovered(false); } }}
        onKeyDown={event => {
          if (event.key === "Escape" && detailsOpen) {
            event.preventDefault(); event.stopPropagation(); setPinned(false); setHovered(false);
          }
        }}>
        <button type="button" className="cafe-shift-helper__work-button" aria-label={work}
          aria-expanded={detailsOpen} aria-controls={detailsId}
          onClick={() => { setHovered(false); setPinned(value => !value); }}>
        <span className="cafe-shift-helper__cues" key={work} aria-hidden="true">
          {visibleCues.map((cue, index) => <span className="cafe-helper-cue" data-phase={cue.phase} data-icon={cue.icon} key={index}>
            <WorkSymbol icon={cue.icon} />
            {cue.value && <b>{cue.value}</b>}
            {cue.phase === "done" && <small>✓</small>}
            {cue.phase === "ready" && <svg className="cafe-helper-cue__clock" viewBox="0 0 16 16" focusable="false">
              <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4v4h3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>}
          </span>)}
        </span>
        </button>
        <div id={detailsId} className="cafe-shift-helper__details" role="tooltip" hidden={!detailsOpen}>{work}</div>
      </div>
    </div>
  );
}
