import type { CSSProperties } from "react";
import { approvedSeats, type SeatedGuestId } from "../../game/data/approvedSeats";
import lukas from "../../../assets/sprites/guests/placeholder-guest-lukas-seated-v02-front-review.png";
import christa from "../../../assets/sprites/guests/placeholder-guest-christa-seated-v04-outfit-review.png";
import fatou from "../../../assets/sprites/guests/placeholder-guest-fatou-seated-v02-approved-style.png";
import mira from "../../../assets/sprites/guests/placeholder-guest-mira-seated-v02-back-review.png";
import meda from "../../../assets/sprites/guests/placeholder-guest-meda-seated-v02-back-review.png";
import nele from "../../../assets/sprites/guests/placeholder-guest-nele-seated-v04-quiet-review.png";

const portraits = {
  "laptop-lukas": lukas, "cappuccino-christa": christa, "pendlerin-fatou": fatou,
  "nachbarin-mira": mira, "meda": meda, "freelancerin-nele": nele
} satisfies Record<SeatedGuestId, string>;

export function CafeTableGuest({ guestId }: { guestId: SeatedGuestId }) {
  const seat = approvedSeats[guestId];
  return <span className={`placeholder-guest placeholder-guest-seated cafe-seat-slot cafe-seat-slot--${seat.chair}`}
    data-seated-guest={guestId} data-guest={guestId.split("-").slice(-1)[0]} data-seat={`${seat.table}-${seat.chair}`} data-service-table={seat.table}
    aria-hidden="true" style={{
      "--seat-contact-x": `${seat.contact[0] / 1254 * 100}%`,
      "--seat-contact-y": `${seat.contact[1] / 1254 * 100}%`
    } as CSSProperties}>
    <img className="cafe-pilot-asset cafe-pilot-asset--guest" src={portraits[guestId]} alt="" />
  </span>;
}
