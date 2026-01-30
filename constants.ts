import { IncidentSeverity, Unit } from "./types";

export const MOCK_UNITS: Unit[] = [
  { id: 'u1', name: 'Alpha-1', type: 'POLICE', status: 'IDLE', location: 'Sector 4' },
  { id: 'u2', name: 'Alpha-2', type: 'POLICE', status: 'IDLE', location: 'Sector 1' },
  { id: 'u3', name: 'Rescue-9', type: 'MEDIC', status: 'IDLE', location: 'Sector 2' },
  { id: 'u4', name: 'Engine-4', type: 'FIRE', status: 'BUSY', location: 'Sector 3' },
  { id: 'u5', name: 'Hazmat-1', type: 'HAZMAT', status: 'IDLE', location: 'HQ' },
];

export const INCIDENT_TYPES = ['Fire', 'Medical', 'Traffic', 'Crime', 'Infrastructure'];
export const SECTORS = ['Downtown', 'Industrial', 'Suburbs', 'Port', 'Uptown'];

export const generateMockIncident = () => {
  const type = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
  const location = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  
  const descriptions = [
    `Reports of smoke seen coming from a warehouse in ${location}.`,
    `Multi-vehicle collision reported at main intersection of ${location}. Possible injuries.`,
    `Suspicious package found near the subway station in ${location}.`,
    `Power outage affecting 3 blocks in ${location}, traffic lights out.`,
    `Individual experiencing cardiac arrest at residential complex in ${location}.`
  ];

  // Randomize severity
  const severities = Object.values(IncidentSeverity);
  const severity = severities[Math.floor(Math.random() * severities.length)];

  // Map severity to priority (1 is Critical, 4 is Low)
  let priority: 1 | 2 | 3 | 4;
  switch (severity) {
    case IncidentSeverity.CRITICAL: priority = 1; break;
    case IncidentSeverity.HIGH: priority = 2; break;
    case IncidentSeverity.MEDIUM: priority = 3; break;
    case IncidentSeverity.LOW: priority = 4; break;
    default: priority = 3;
  }

  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type,
    location,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    status: 'PENDING' as const,
    severity,
    priority,
  };
};