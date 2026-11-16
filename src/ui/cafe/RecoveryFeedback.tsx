import { useEffect, useState } from "react";

/** Observe earned hearts, never replay a saved shift's total as a new reward. */
export function RecoveryFeedback({ day, total }: { day: number; total: number }) {
  const [previous, setPrevious] = useState({ day, total });
  const [reward, setReward] = useState<{ amount: number; key: number } | null>(null);
  if (previous.day !== day || previous.total !== total) {
    setPrevious({ day, total });
    setReward(previous.day === day && day >= 2 && total > previous.total
      ? { amount: total - previous.total, key: total }
      : null);
  }

  useEffect(() => {
    if (!reward) return;
    const timer = setTimeout(() => setReward(null), 2800);
    return () => clearTimeout(timer);
  }, [reward]);

  return (
    <div className="cafe-recovery-feedback" role="status" aria-live="polite" aria-atomic="true">
      {reward && <span key={reward.key} className="cafe-recovery-feedback__reward">
        <span aria-hidden="true">♥ +{reward.amount}</span>
        <span className="cafe-recovery-feedback__announcement">{reward.amount} {reward.amount === 1 ? "heart" : "hearts"} restored</span>
      </span>}
    </div>
  );
}
