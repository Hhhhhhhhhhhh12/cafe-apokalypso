import { useEffect, useState } from "react";
import type { AchievementDefinition } from "../../game/types/content";

interface AchievementToastProps {
  queue: AchievementDefinition[];
  onDequeue: () => void;
}

export function AchievementToast({ queue, onDequeue }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);
  const current = queue[0] ?? null;

  // Adjust-during-render: reset the enter animation whenever the toast slot
  // empties, so the next item starts hidden and animates in again.
  if (!current && visible) {
    setVisible(false);
  }

  useEffect(() => {
    if (!current) {
      return;
    }
    // One frame hidden, then visible — lets the enter transition play.
    const raf = requestAnimationFrame(() => setVisible(true));
    let dequeueTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      setVisible(false);
      // Small delay so the exit animation plays before the next item pops in
      dequeueTimer = setTimeout(onDequeue, 300);
    }, 4000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      if (dequeueTimer) clearTimeout(dequeueTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  if (!current) return null;

  return (
    <div
      className={`achievement-toast${visible ? " achievement-toast--visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="achievement-toast__check" aria-hidden="true">✓</span>
      <div className="achievement-toast__body">
        <p className="achievement-toast__label">Achievement</p>
        <p className="achievement-toast__name">{current.name}</p>
        <p className="achievement-toast__desc">{current.description}</p>
      </div>
    </div>
  );
}
