import type { AdvertisingCampaignDefinition } from "../types/content";

export const weekOneAdvertisingCampaigns = [
  {
    id: "flyer-nachbarschaft",
    name: "Flyer in der Nachbarschaft",
    unlockDay: 4,
    cost: 12,
    effects: ["Increases grounded neighborhood traffic"],
    summary: "The first simple advertising option."
  },
  {
    id: "studentenrabatt",
    name: "Studentenrabatt",
    unlockDay: 4,
    cost: 10,
    effects: ["Attracts low-spend guests", "Can increase table pressure"],
    summary: "A grounded demand lever with operational tradeoffs."
  },
  {
    id: "social-media-post",
    name: "Social-Media-Post",
    unlockDay: 4,
    cost: 8,
    effects: ["Raises visibility", "Can attract longer-seat-time guests"],
    summary: "A small modern café marketing action."
  },
  {
    id: "automatische-zielgruppenoptimierung",
    name: "Automatische Zielgruppenoptimierung",
    unlockDay: 6,
    cost: 0,
    effects: ["KASSANDRA-driven targeting", "May attract unclear audiences"],
    summary:
      "A simulated KASSANDRA feature. It is authored static logic, not a real AI service."
  }
] as const satisfies readonly AdvertisingCampaignDefinition[];
