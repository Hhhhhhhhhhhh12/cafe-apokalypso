import { useEffect, useState } from "react";
import type { AchievementDefinition } from "../../game/types/content";

interface AchievementToastProps {
  queue: AchievementDefinition[];
  onDequeue: () => void;
}

export function AchievementToast({ queue, onDequeue }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);
  const current = queue[0] ?? null;

  useEffect(() => {
    if (!current) {
      return;
    }
    const showFrame = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      // Small delay so the exit animation plays before the next item pops in
      const dequeueTimer = setTimeout(onDequeue, 300);
      return () => clearTimeout(dequeueTimer);
    }, 4000);
    return () => {
      cancelAnimationFrame(showFrame);
      clearTimeout(timer);
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
