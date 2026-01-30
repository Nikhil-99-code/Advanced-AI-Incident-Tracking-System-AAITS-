import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  MapPin, 
  Radio, 
  Cpu, 
  CheckCircle, 
  XCircle,
  Clock,
  Menu,
  Search,
  Filter,
  Shield,
  Flame,
  Ambulance,
  Biohazard,
  Zap
} from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className = "" }) => {
  const icons: Record<string, React.FC<any>> = {
    alert: AlertTriangle,
    critical: ShieldAlert,
    activity: Activity,
    map: MapPin,
    feed: Radio,
    ai: Cpu,
    check: CheckCircle,
    x: XCircle,
    clock: Clock,
    menu: Menu,
    search: Search,
    filter: Filter,
    // Unit Icons
    police: Shield,
    fire: Flame,
    medic: Ambulance,
    hazmat: Biohazard,
    power: Zap
  };

  const SelectedIcon = icons[name.toLowerCase()] || AlertTriangle;

  return <SelectedIcon size={size} className={className} aria-hidden="true" />;
};