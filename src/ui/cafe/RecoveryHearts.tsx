/** Solid hearts are present; marked hearts are the forecast for a successful order. */
export function RecoveryHearts({ current, restored }: { current: number; restored: number }) {
  return <span className="cafe-recovery-hearts" role="img"
    aria-label={`Recovery with a served order: ${current} to ${Math.min(3, current + restored)} hearts`}>
    {[0, 1, 2].map(index => {
      const present = index < current;
      const forecast = !present && index < current + restored;
      return <span key={index} aria-hidden="true" data-filled={present} data-forecast={forecast}>
        {present || forecast ? "♥" : "♡"}
        {forecast && <sup>+</sup>}
      </span>;
    })}
  </span>;
}
