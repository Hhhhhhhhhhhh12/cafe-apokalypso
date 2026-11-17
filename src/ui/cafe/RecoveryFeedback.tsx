import { useEffect, useState } from "react";

/** Observe earned hearts, never replay a saved shift's total as a new reward. */
export function RecoveryFeedback({ day, total, guestNames = [] }: { day: number; total: number; guestNames?: readonly string[] }) {
  const [previous, setPrevious] = useState({ day, total, guests: guestNames.length });
  const [reward, setReward] = useState<{ amount: number; key: number; names: string[] } | null>(null);
  if (previous.day !== day || previous.total !== total || previous.guests !== guestNames.length) {
    setPrevious({ day, total, guests: guestNames.length });
    if (previous.day !== day || previous.total !== total) {
      setReward(previous.day === day && day >= 2 && total > previous.total
        ? { amount: total - previous.total, key: total, names: guestNames.slice(previous.guests) }
        : null);
    }
  }

  useEffect(() => {
    if (!reward) return;
    const timer = setTimeout(() => setReward(null), 2800);
    return () => clearTimeout(timer);
  }, [reward]);

  return (
    <div className="cafe-recovery-feedback" role="status" aria-live="polite" aria-atomic="true">
      {reward && <span key={reward.key} className="cafe-recovery-feedback__reward">
        {reward.names.length > 0 && <small className="cafe-recovery-feedback__names" aria-hidden="true">{reward.names.join(" · ")}</small>}
        <span aria-hidden="true">♥ +{reward.amount}</span>
        <span className="cafe-recovery-feedback__announcement">{reward.names.length > 0 ? `${reward.names.join(" and ")}: ` : ""}{reward.amount} {reward.amount === 1 ? "heart" : "hearts"} restored</span>
      </span>}
    </div>
  );
}
