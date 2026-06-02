import type { KassandraMessageDefinition } from "../types/content";

export const kassandraMessages = [
  {
    id: "kassandra-customer-base-analysis",
    day: 6,
    text: "Good morning. I have analyzed your customer base. Result: 96% mortal, 4% unclear.",
    source: "authored_static",
    simulated: true
  },
  {
    id: "kassandra-demand-forecast",
    day: 6,
    text: "Demand forecast: medium. Emotional volatility: locally elevated.",
    source: "authored_static",
    simulated: true
  },
  {
    id: "kassandra-shadow-history-offer",
    day: 6,
    text: "Recommended offer: black coffee for customers with a long shadow history. This feature is currently unavailable.",
    source: "authored_static",
    simulated: true
  },
  {
    id: "kassandra-target-group-optimization",
    day: 6,
    text: "Target group optimization complete. Some targets dispute the term \"group.\"",
    source: "authored_static",
    simulated: true
  },
  {
    id: "kassandra-threshold-stability",
    day: 7,
    text: "Demand forecast: high. Threshold stability: provisional. Please keep milk above zero during reality thinning.",
    source: "authored_static",
    simulated: true
  },
  {
    id: "kassandra-prefilled-form",
    day: 7,
    text: "I have pre-filled a form you have not received yet. Apologies, or congratulations. The field was ambiguous.",
    source: "authored_static",
    simulated: true
  },
  {
    id: "kassandra-returning-directions",
    day: 7,
    text: "Returning guests today: several. A few are returning from directions that are not days.",
    source: "authored_static",
    simulated: true
  }
] as const satisfies readonly KassandraMessageDefinition[];
