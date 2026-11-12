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
import { GuestOrderControls } from "../src/ui/interactions/GuestOrderControls";

interface TestElementProps {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
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

function openState(actionPointsRemaining: number): GameState {
  const state = createInitialGameState();
  return {
    ...state,
    dayPhase: "open",
    dayManagement: {
      ...state.dayManagement,
      actionPointsRemaining
    }
  };
}

describe("GuestOrderControls", () => {
  it("keeps the guest preview before the product menu and sends the selected product id", () => {
    const onServeProduct = vi.fn();
    const controls = GuestOrderControls({
      gameState: openState(3),
      onServeProduct
    });
    const markup = renderToStaticMarkup(controls);
    const espresso = collectElements(controls, "button").find((button) =>
      textContent(button).includes("Espresso")
    );

    expect(markup.indexOf('class="next-guest"')).toBeLessThan(
      markup.indexOf('class="serve-menu"')
    );
    expect(markup).toContain('aria-label="Next guest in line"');
    expect(markup).toContain('aria-label="Serve a product"');
    expect(espresso).toBeDefined();

    espresso?.props.onClick?.();
    expect(onServeProduct).toHaveBeenCalledOnce();
    expect(onServeProduct).toHaveBeenCalledWith("espresso");
  });

  it("keeps every serving choice unavailable when the shift has no actions left", () => {
    const controls = GuestOrderControls({
      gameState: openState(0),
      onServeProduct: vi.fn()
    });
    const productButtons = collectElements(controls, "button").filter((button) =>
      button.props.className?.includes("serve-menu__item")
    );

    expect(productButtons).toHaveLength(4);
    expect(productButtons.every((button) => button.props.disabled)).toBe(true);
    expect(productButtons.every((button) => button.props.title === "No actions left this shift.")).toBe(true);
  });
});
