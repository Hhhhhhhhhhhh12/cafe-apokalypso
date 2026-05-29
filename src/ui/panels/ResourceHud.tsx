import type { ResourceState } from "../../game/types/game";

interface ResourceHudProps {
  resources: ResourceState;
}

export function ResourceHud({ resources }: ResourceHudProps) {
  return (
    <section className="panel resource-panel" aria-labelledby="resources-title">
      <div className="panel-heading">
        <p className="eyebrow">Status</p>
        <h2 id="resources-title">Resource HUD</h2>
      </div>

      <dl className="resource-list">
        <ResourceItem label="Money" value={`${resources.money} €`} />
        <ResourceItem label="Coffee" value={resources.coffee} />
        <ResourceItem label="Milk" value={resources.milk} />
        <ResourceItem label="Pastries" value={resources.pastries} />
        <ResourceItem label="Reputation" value={resources.reputation} />
        <ResourceItem label="Cleanliness" value={`${resources.cleanliness}%`} />
        <ResourceItem label="Stress" value={resources.stress} />
        <ResourceItem label="Mood" value={resources.mood} />
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
