import React, { useMemo } from 'react';
import { Incident } from '../types';
import { SECTORS } from '../constants';
import { Icon } from './Icon';

interface SectorHistogramProps {
  incidents: Incident[];
}

export const SectorHistogram: React.FC<SectorHistogramProps> = ({ incidents }) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    SECTORS.forEach(sector => counts[sector] = 0);
    
    incidents.forEach(incident => {
      // We count all incidents (active and resolved) to show historical activity density
      if (counts[incident.location] !== undefined) {
        counts[incident.location]++;
      }
    });

    const maxCount = Math.max(...Object.values(counts), 1);

    return SECTORS.map(sector => ({
      name: sector,
      count: counts[sector],
      height: Math.max((counts[sector] / maxCount) * 100, 5) // Minimum 5% height for visibility
    }));
  }, [incidents]);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 h-full flex flex-col">
      <h3 className="text-gray-400 font-mono text-xs mb-4 uppercase tracking-wider flex items-center gap-2">
        <Icon name="activity" size={14} />
        Sector Activity Distribution
      </h3>
      <div className="flex-1 flex items-end justify-between gap-2 px-2">
        {data.map((item) => (
          <div key={item.name} className="flex-1 flex flex-col items-center group h-full justify-end">
             <div className="w-full relative flex items-end justify-center" style={{ height: '80%' }}>
                {/* Bar */}
                <div 
                  className="w-full max-w-[40px] bg-gray-800 border border-gray-600 rounded-t hover:bg-blue-900/60 hover:border-blue-500 transition-all duration-300 relative cursor-default"
                  style={{ height: `${item.height}%` }}
                >
                    {/* Count Label (Tooltip style on hover) */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-400 transition-all">
                        {item.count}
                    </div>
                </div>
             </div>
             {/* X-Axis Label */}
             <span className="mt-2 text-[9px] md:text-[10px] text-gray-500 font-mono truncate w-full text-center uppercase tracking-tighter md:tracking-normal group-hover:text-gray-300">
                {item.name}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
};