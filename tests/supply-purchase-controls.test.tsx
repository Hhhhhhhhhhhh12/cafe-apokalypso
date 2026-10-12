import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { createInitialGameState } from "../src/game/engine/gameState";
import type { GameState } from "../src/game/types/game";
import { SupplyPurchaseControls } from "../src/ui/interactions/SupplyPurchaseControls";

interface TestElementProps {
  "aria-label"?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

function collectElements(
  node: ReactNode,
  type: string
): ReactElement<TestElementProps>[] {
  if (!isValidElement<TestElementProps>(node)) return [];

  const matches = node.type === type ? [node] : [];
  return Children.toArray(node.props.children).reduce<ReactElement<TestElementProps>[]>(
    (elements, child) => elements.concat(collectElements(child, type)),
    matches
  );
}

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (!isValidElement<TestElementProps>(node)) return "";
  return Children.toArray(node.props.children).map(textContent).join("");
}

function dayEndState(overrides: Partial<GameState> = {}): GameState {
  const state = createInitialGameState();
  return {
    ...state,
    dayPhase: "day_end",
    ...overrides
  };
}

function findButton(
  controls: ReactNode,
  predicate: (button: ReactElement<TestElementProps>) => boolean
) {
  return collectElements(controls, "button").find(predicate);
}

describe("SupplyPurchaseControls", () => {
  it("sends the ingredient and next quantity for both stepper directions", () => {
    const onSetSupplyPurchase = vi.fn();
    const state = dayEndState({
      pendingSupplyPurchase: { coffee: 2, milk: 0, pastries: 0 }
    });
    const controls = SupplyPurchaseControls({
      gameState: state,
      onSetSupplyPurchase,
      onConfirmSupplyPurchase: vi.fn()
    });

    findButton(
      controls,
      (button) => button.props["aria-label"] === "Buy one fewer Coffee beans"
    )?.props.onClick?.();
    findButton(
      controls,
      (button) => button.props["aria-label"] === "Buy one more Milk"
    )?.props.onClick?.();

    expect(onSetSupplyPurchase).toHaveBeenNthCalledWith(1, "coffee", 1);
    expect(onSetSupplyPurchase).toHaveBeenNthCalledWith(2, "milk", 1);
  });

  it("disables decrement at zero and increment at the remaining stock cap", () => {
    const state = dayEndState({
      supplies: { coffee: 12, milk: 8, pastries: 6 },
      pendingSupplyPurchase: { coffee: 8, milk: 0, pastries: 0 }
    });
    const controls = SupplyPurchaseControls({
      gameState: state,
      onSetSupplyPurchase: vi.fn(),
      onConfirmSupplyPurchase: vi.fn()
    });

    expect(
      findButton(
        controls,
        (button) => button.props["aria-label"] === "Buy one more Coffee beans"
      )?.props.disabled
    ).toBe(true);
    expect(
      findButton(
        controls,
        (button) => button.props["aria-label"] === "Buy one fewer Milk"
      )?.props.disabled
    ).toBe(true);
  });

  it("disables an unaffordable non-empty restock plan", () => {
    const state = dayEndState({
      resources: { ...createInitialGameState().resources, money: 0.5 },
      pendingSupplyPurchase: { coffee: 0, milk: 0, pastries: 1 }
    });
    const controls = SupplyPurchaseControls({
      gameState: state,
      onSetSupplyPurchase: vi.fn(),
      onConfirmSupplyPurchase: vi.fn()
    });
    const confirm = findButton(
      controls,
      (button) => button.props.className === "restock-confirm"
    );

    expect(confirm?.props.disabled).toBe(true);
    expect(textContent(confirm)).toBe("Restock · €1.2 → €-0.7 left");
  });

  it("allows continuing with a zero-purchase plan", () => {
    const onConfirmSupplyPurchase = vi.fn();
    const controls = SupplyPurchaseControls({
      gameState: dayEndState(),
      onSetSupplyPurchase: vi.fn(),
      onConfirmSupplyPurchase
    });
    const confirm = findButton(
      controls,
      (button) => button.props.className === "restock-confirm"
    );

    expect(confirm?.props.disabled).toBe(false);
    expect(textContent(confirm)).toBe("Open tomorrow without restocking");
    confirm?.props.onClick?.();
    expect(onConfirmSupplyPurchase).toHaveBeenCalledOnce();
  });

  it("locks restocking and hides following shops after the demo ending", () => {
    const markup = renderToStaticMarkup(
      <SupplyPurchaseControls
        gameState={dayEndState({ demoComplete: true })}
        onSetSupplyPurchase={vi.fn()}
        onConfirmSupplyPurchase={vi.fn()}
      >
        <span>Following shop</span>
      </SupplyPurchaseControls>
    );

    expect(markup).toContain('class="restock-panel"');
    expect(markup).toContain('aria-label="Demo complete"');
    expect(markup).toContain("The Day-7 letter has arrived. Restock is locked for the demo ending.");
    expect(markup).not.toContain("<button");
    expect(markup).not.toContain("Following shop");
  });
});
