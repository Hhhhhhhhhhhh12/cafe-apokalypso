import { weekOneAchievements } from "./achievements";
import { weekOneAdvertisingCampaigns } from "./ads";
import { weekOneDayModifiers } from "./dayModifiers";
import { weekOneDays } from "./days";
import { daySevenHookLetter, weekOneEvents } from "./events";
import {
  normalWeekOneGuests,
  subtlyStrangeWeekOneGuests,
  weekOneGuests
} from "./guests";
import { kassandraMessages } from "./kassandra";
import { weekOneProducts } from "./products";
import { weekOneStaffOptions } from "./staff";
import { weekOneUpgrades } from "./upgrades";

export const weekOneContent = {
  guests: weekOneGuests,
  products: weekOneProducts,
  staffOptions: weekOneStaffOptions,
  advertisingCampaigns: weekOneAdvertisingCampaigns,
  upgrades: weekOneUpgrades,
  events: weekOneEvents,
  achievements: weekOneAchievements,
  dayModifiers: weekOneDayModifiers,
  days: weekOneDays,
  kassandraMessages,
  daySevenHookLetter
} as const;

export function getWeekOneContentSummary() {
  return {
    normalGuests: normalWeekOneGuests.length,
    subtlyStrangeGuests: subtlyStrangeWeekOneGuests.length,
    products: weekOneProducts.length,
    staffOptions: weekOneStaffOptions.length,
    advertisingCampaigns: weekOneAdvertisingCampaigns.length,
    upgrades: weekOneUpgrades.length,
    scriptedEvents: weekOneEvents.length,
    achievements: weekOneAchievements.length,
    dayModifiers: weekOneDayModifiers.length,
    days: weekOneDays.length,
    kassandraMessages: kassandraMessages.length
  };
}
