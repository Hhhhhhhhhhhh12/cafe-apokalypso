const ascheNumber = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

/** Show whole Asche without trailing zeros and retain exact older balances. */
export function formatAsche(amount: number): string {
  return `${ascheNumber.format(amount)} Asche`;
}

/** Round newly calculated earnings to the nearest tenth of an Asche. */
export function roundAscheEarnings(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 10) / 10;
}
