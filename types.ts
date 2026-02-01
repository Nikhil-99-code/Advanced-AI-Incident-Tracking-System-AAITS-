export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Incident {
  id: string;
  timestamp: number;
  type: string;
  location: string;
  description: string;
  status: 'PENDING' | 'ANALYZING' | 'DISPATCHED' | 'RESOLVED';
  severity: IncidentSeverity;
  priority: 1 | 2 | 3 | 4;
  aiAnalysis?: {
    summary: string;
    recommendedUnits: string[];
    riskFactors: string[];
    googleMapsUrl?: string;
  };
}

export interface Unit {
  id: string;
  name: string;
  type: 'POLICE' | 'FIRE' | 'MEDIC' | 'HAZMAT';
  status: 'IDLE' | 'BUSY';
  location: string;
  targetLocation?: string;
}

export interface SystemStats {
  activeIncidents: number;
  availableUnits: number;
  avgResponseTime: number;
}