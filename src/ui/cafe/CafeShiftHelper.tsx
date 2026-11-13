import type { GameState } from "../../game/types/game";
import jana from "../../../assets/sprites/guests/placeholder-staff-jana.png";
import nino from "../../../assets/sprites/guests/placeholder-staff-nino.png";
import nele from "../../../assets/sprites/guests/placeholder-staff-nele.png";

const staffPortraits = { jana, nino, nele };

export function StaffPortrait({ helperId, className, alt }: {
  helperId: keyof typeof staffPortraits;
  className?: string;
  alt: string;
}) {
  return <img className={className} src={staffPortraits[helperId]} alt={alt} />;
}

export function CafeShiftHelper({ gameState }: { gameState: GameState }) {
  const assignment = gameState.helperAssignment;
  if (gameState.day !== 5 || gameState.dayPhase !== "open" || !assignment?.locked ||
      gameState.cafeClosed || gameState.demoComplete) return null;

  const { helperId, taskId } = assignment;
  const { dayFiveHelperImpact: impact, helperAutonomousActions, extraAdvertisingActions,
    advertisingRun, helperExtraOrdersRemaining } = gameState.dayManagement;
  const name = { jana: "Jana", nino: "Nino", nele: "Nele" }[helperId];
  const extraOrder = helperExtraOrdersRemaining > 0
    ? "Extra order ready"
    : impact?.extraOrders ? `+${impact.extraOrders} served` : "At the counter";
  const work = {
    cleaning: helperAutonomousActions > 0 ? `${helperAutonomousActions} cleared` : "Clearing tables",
    service: extraOrder,
    barista: impact?.reputationGained ? `+${impact.reputationGained} reputation` : "At the machine",
    counter: impact?.openingStressReduction
      ? `−${impact.openingStressReduction} stress · ${extraOrder}`
      : extraOrder,
    marketing: extraAdvertisingActions > 0 ? "Flyer · 0 actions" : advertisingRun ? "Flyer posted" : "At the noticeboard"
  }[taskId];

  return (
    <div className={`cafe-shift-helper cafe-shift-helper--${taskId}`} data-helper={helperId}>
      <StaffPortrait helperId={helperId} alt={name} />
      <span className="cafe-shift-helper__work" key={work}>{work}</span>
    </div>
  );
}
