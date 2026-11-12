import { useCallback, useEffect, useRef, useState } from "react";
import type { StorageLike } from "../../game/engine/save";
import matureSeated from "../../../assets/sprites/guests/placeholder-guest-bohn-mature-seated.png";
import greyTemplesSeated from "../../../assets/sprites/guests/placeholder-guest-bohn-grey-temples-seated.png";
import silverSeated from "../../../assets/sprites/guests/placeholder-guest-bohn-silver-seated.png";
import oldestSeated from "../../../assets/sprites/guests/placeholder-guest-bohn-oldest-seated.png";
import matureStanding from "../../../assets/sprites/guests/placeholder-guest-bohn-mature-standing.png";
import greyTemplesStanding from "../../../assets/sprites/guests/placeholder-guest-bohn-grey-temples-standing.png";
import silverStanding from "../../../assets/sprites/guests/placeholder-guest-bohn-silver-standing.png";
import oldestStanding from "../../../assets/sprites/guests/placeholder-guest-bohn-oldest-standing.png";

const appearances = [
  { seated: oldestSeated, standing: oldestStanding },
  { seated: greyTemplesSeated, standing: greyTemplesStanding },
  { seated: silverSeated, standing: silverStanding },
  { seated: matureSeated, standing: matureStanding },
] as const;

const STORAGE_KEY = "cafe-apokalypso.bohn-appearance.v1";
const nextAppearance = (index: number) => (index + 1) % appearances.length;

function initialAppearance(storage: StorageLike | null): number {
  try {
    const previous = storage?.getItem(STORAGE_KEY);
    const index = appearances.findIndex((_, candidate) => String(candidate) === previous);
    return nextAppearance(index);
  } catch {
    return 0;
  }
}

export function useBohnAppearance(storage: StorageLike | null, occluder: HTMLElement | null) {
  const [index, setIndex] = useState(() => initialAppearance(storage));
  const currentIndex = useRef(index);
  const wasVisible = useRef(false);
  const [sprite, spriteRef] = useState<HTMLElement | null>(null);

  const recordVisibility = useCallback((visible: boolean) => {
    if (visible === wasVisible.current) return;
    wasVisible.current = visible;
    if (!visible) {
      currentIndex.current = nextAppearance(currentIndex.current);
      setIndex(currentIndex.current);
      return;
    }
    try {
      storage?.setItem(STORAGE_KEY, String(currentIndex.current));
    } catch {
      // Appearance still changes within this session if storage is unavailable.
    }
  }, [storage]);

  useEffect(() => {
    if (!sprite) {
      recordVisibility(false);
      return;
    }

    let inView: boolean | null = typeof IntersectionObserver === "undefined" ? true : null;
    let pageHidden = false;

    function syncVisibility() {
      if (pageHidden || document.hidden) {
        recordVisibility(false);
      } else if (inView !== null && sprite) {
        recordVisibility(inView && !fullyCovered(sprite, occluder));
      }
    }

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      if (!entry) return;
      inView = entry.isIntersecting;
      syncVisibility();
    });
    observer?.observe(sprite);

    function hidePage() {
      pageHidden = true;
      syncVisibility();
    }
    function showPage() {
      pageHidden = false;
      syncVisibility();
    }

    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("pagehide", hidePage);
    window.addEventListener("pageshow", showPage);
    if (occluder) {
      window.addEventListener("scroll", syncVisibility, { capture: true, passive: true });
      window.addEventListener("resize", syncVisibility);
    }
    syncVisibility();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("pagehide", hidePage);
      window.removeEventListener("pageshow", showPage);
      if (occluder) {
        window.removeEventListener("scroll", syncVisibility, true);
        window.removeEventListener("resize", syncVisibility);
      }
    };
  }, [sprite, occluder, recordVisibility]);

  return { ...appearances[index], spriteRef };
}

function fullyCovered(sprite: HTMLElement, occluder: HTMLElement | null): boolean {
  if (!occluder) return false;
  const target = sprite.getBoundingClientRect();
  const cover = occluder.getBoundingClientRect();
  return cover.left <= target.left && cover.right >= target.right &&
    cover.top <= target.top && cover.bottom >= target.bottom;
}
