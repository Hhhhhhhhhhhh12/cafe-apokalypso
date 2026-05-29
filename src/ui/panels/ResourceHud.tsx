import { getManagementHudLabels } from "../../game/engine/selectors";
import type { GameState } from "../../game/types/game";

interface ResourceHudProps {
  gameState: GameState;
}

export function ResourceHud({ gameState }: ResourceHudProps) {
  const labels = getManagementHudLabels(gameState);

  return (
    <section className="panel resource-panel" aria-labelledby="resources-title">
      <div className="panel-heading">
        <p className="eyebrow">Status</p>
        <h2 id="resources-title">Management row</h2>
      </div>

      <dl className="resource-list">
        <ResourceItem label="Kasse" value={`€${gameState.resources.money}`} />
        <ResourceItem label="Kaffee" value={gameState.supplies.coffee} />
        <ResourceItem label="Milch" value={gameState.supplies.milk} />
        <ResourceItem label="Gebäck" value={gameState.supplies.pastries} />
        <ResourceItem
          label="Sauberkeit"
          value={`${labels.cleanliness} (${gameState.resources.cleanliness})`}
        />
        <ResourceItem
          label="Stress"
          value={`${labels.stress} (${gameState.resources.stress})`}
        />
        <ResourceItem
          label="Ruf"
          value={`${labels.reputation} (${gameState.resources.reputation})`}
        />
      </dl>
    </section>
  );
}

interface ResourceItemProps {
  label: string;
  value: string | number;
}

function ResourceItem({ label, value }: ResourceItemProps) {
  return (
    <div className="resource-item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
