import { IncidentSeverity, Unit } from "./types";

// Using real SF neighborhoods for better Maps Grounding
export const SECTORS = ['Mission District', 'SoMa', 'Financial District', 'The Castro', 'North Beach'];

export const MOCK_UNITS: Unit[] = [
  { id: 'u1', name: 'Alpha-1', type: 'POLICE', status: 'IDLE', location: 'The Castro' },
  { id: 'u2', name: 'Alpha-2', type: 'POLICE', status: 'IDLE', location: 'Mission District' },
  { id: 'u3', name: 'Rescue-9', type: 'MEDIC', status: 'IDLE', location: 'SoMa' },
  { id: 'u4', name: 'Engine-4', type: 'FIRE', status: 'BUSY', location: 'Financial District' },
  { id: 'u5', name: 'Hazmat-1', type: 'HAZMAT', status: 'IDLE', location: 'North Beach' },
];

export const INCIDENT_TYPES = ['Fire', 'Medical', 'Traffic', 'Crime', 'Infrastructure'];

export const generateMockIncident = () => {
  const type = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
  const location = SECTORS[Math.floor(Math.random() * SECTORS.length)];
  
  // More specific descriptions for better map grounding
  const descriptions = [
    `Reports of smoke seen coming from a warehouse near the main intersection in ${location}, San Francisco.`,
    `Multi-vehicle collision reported at a busy junction in ${location}, San Francisco. Possible injuries.`,
    `Suspicious package found near the transit station in ${location}, San Francisco.`,
    `Power outage affecting 3 blocks in ${location}, San Francisco, traffic lights out.`,
    `Individual experiencing cardiac arrest at residential complex in ${location}, San Francisco.`
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