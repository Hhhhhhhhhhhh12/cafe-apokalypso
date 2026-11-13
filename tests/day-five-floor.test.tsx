import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../src/game/engine/gameState";
import { createInitialDayManagement } from "../src/game/engine/management";
import { gameReducer } from "../src/game/engine/reducer";
import type { StaffOptionId } from "../src/game/types/content";
import type { HelperTaskId } from "../src/game/types/game";
import { CafeShiftHelper } from "../src/ui/cafe/CafeShiftHelper";
import { RestockControls } from "../src/ui/cafe/CafeManagement";

const espresso = { type: "serve_product", productId: "espresso" } as const;
const noop = () => {};

function startDayFive(helperId?: StaffOptionId, taskId?: HelperTaskId) {
  const base = createInitialGameState();
  const morning = {
    ...base,
    day: 5 as const,
    dayPhase: "day_start" as const,
    dayManagement: createInitialDayManagement(base.resources.reputation, 5),
    unlocks: { ...base.unlocks, pricing: true, staff: true, advertising: true }
  };
  const selected = helperId && taskId
    ? gameReducer(morning, { type: "select_helper", helperId, taskId })
    : morning;
  return gameReducer(selected, { type: "open_day" });
}

const renderHelper = (gameState: ReturnType<typeof startDayFive>) =>
  renderToStaticMarkup(<CafeShiftHelper gameState={gameState} />);

describe("Day 5 staffing on the café floor", () => {
  it("lets Jana clear a specific table for free and shows the work in the room", () => {
    const open = startDayFive("jana", "cleaning");
    expect(renderHelper(open)).toContain("cafe-shift-helper--cleaning");
    expect(open.pendingEvents).toContain("day-5-wet-table-jana");
    const served = gameReducer(open, espresso);
    const [tableId] = served.dayManagement.dirtyTableIds;
    expect(tableId).toBeDefined();
    const cleared = gameReducer(served, { type: "clean_table", tableId });
    expect(cleared.dayManagement.dirtyTableIds).not.toContain(tableId);
    expect(cleared.dayManagement.actionPointsRemaining).toBe(served.dayManagement.actionPointsRemaining);
    expect(cleared.dayManagement.dayFiveHelperImpact?.cleanlinessRestored).toBe(1);
    expect(renderHelper(cleared)).toContain("1 cleared");
  });

  it("shows the extra order only when Jana on service has completed it", () => {
    const open = startDayFive("jana", "service");
    expect(renderHelper(open)).toContain("Extra order ready");
    const served = gameReducer(open, espresso);
    expect(served.dayManagement.customersServed).toBe(2);
    expect(renderHelper(served)).toContain("+1 served");
  });

  it("shows Nino's drink reputation at the machine and Nele's consumed flyer bonus at the board", () => {
    const nino = gameReducer(startDayFive("nino", "barista"), espresso);
    expect(renderHelper(nino)).toContain("cafe-shift-helper--barista");
    expect(renderHelper(nino)).toContain("+1 reputation");
    const nele = startDayFive("nele", "marketing");
    expect(renderHelper(nele)).toContain("Flyer · 0 actions");
    const advertised = gameReducer(nele, { type: "run_advertising", adType: "flyer" });
    expect(advertised.dayManagement.actionPointsRemaining).toBe(nele.dayManagement.actionPointsRemaining);
    expect(advertised.resources.money).toBe(nele.resources.money - 2);
    expect(renderHelper(advertised)).toContain("Flyer posted");
  });

  it("keeps solo shifts playable and applies the existing action tradeoff", () => {
    let solo = startDayFive();
    expect(renderHelper(solo)).toBe("");
    expect(solo.pendingEvents).not.toContain("day-5-wet-table-jana");
    expect(solo.dayManagement.actionPointsRemaining).toBe(4);
    for (let i = 0; i < 3; i++) solo = gameReducer(solo, espresso);
    const closed = gameReducer(solo, { type: "complete_day" });
    expect(closed.daySummary?.objectiveCompleted).toBe(true);
    expect(closed.daySummary?.helperAutonomyRecap).toContain("+10 stress at closing");
  });

  it("shows whether planned Day 4 restocking leaves enough cash for help on Day 5", () => {
    const base = startDayFive();
    const render = (money: number) => renderToStaticMarkup(
      <RestockControls gameState={{ ...base, day: 4, resources: { ...base.resources, money } }}
        onSetSupplyPurchase={noop} onConfirmSupplyPurchase={noop} onSkipRestocking={noop} />
    );
    expect(render(20)).toContain("Tomorrow: help from 14 Asche");
    expect(render(10)).toContain("Tomorrow: 4 Asche short for help");
  });
});
