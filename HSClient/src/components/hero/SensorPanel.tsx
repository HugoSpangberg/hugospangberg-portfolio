import type { SensorReading } from './types';

type SensorPanelProps = {
  data: SensorReading;
  isActive: boolean;
  variant?: 'compact' | 'full';
};

function SensorPanel({ data, isActive, variant = 'compact' }: SensorPanelProps) {
  const machineLabel = variant === 'compact' && data.machine.includes('H-07') ? 'H-07' : data.machine;
  const compactRows = [
    ['Status', data.systemStatus],
    ['Machine', machineLabel],
    ['Tree ID', data.treeId],
    ['Moisture', data.moisture],
    ['Load', data.load],
    ['Sync', data.dataSync],
  ];
  const fullRows = [
    ...compactRows,
    ['Temperature', data.temperature],
    ['GPS', data.gps],
    ['Cut status', data.cutStatus],
    ['System health', data.systemHealth],
  ];
  const rows = variant === 'compact' ? compactRows : fullRows;

  return (
    <aside className={`sensor-panel sensor-panel--${variant}`} aria-label="Sensor data">
      <div className="sensor-panel__header">
        <span className={isActive ? 'sensor-panel__dot is-active' : 'sensor-panel__dot'} />
        <p>Forest System</p>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export default SensorPanel;
