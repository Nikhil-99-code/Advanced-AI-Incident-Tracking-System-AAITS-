import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Incident, Unit } from '../types';
import { Icon } from './Icon';
import { SECTORS } from '../constants';

interface MapVisualizationProps {
  activeIncidents: Incident[];
  units: Unit[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({ activeIncidents, units, selectedIncidentId, onSelectIncident }) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Helper to get styling based on Unit Type
  const getUnitConfig = (type: Unit['type']) => {
    switch (type) {
        case 'POLICE': return { 
            icon: 'police', 
            bg: 'bg-blue-600', 
            border: 'border-blue-400', 
            text: 'text-blue-50', 
            shadow: 'rgba(37, 99, 235, 0.5)' 
        };
        case 'FIRE': return { 
            icon: 'fire', 
            bg: 'bg-orange-600', 
            border: 'border-orange-400', 
            text: 'text-orange-50', 
            shadow: 'rgba(234, 88, 12, 0.5)' 
        };
        case 'MEDIC': return { 
            icon: 'medic', 
            bg: 'bg-emerald-600', 
            border: 'border-emerald-400', 
            text: 'text-emerald-50', 
            shadow: 'rgba(5, 150, 105, 0.5)' 
        };
        case 'HAZMAT': return { 
            icon: 'hazmat', 
            bg: 'bg-purple-600', 
            border: 'border-purple-400', 
            text: 'text-purple-50', 
            shadow: 'rgba(147, 51, 234, 0.5)' 
        };
        default: return { 
            icon: 'activity', 
            bg: 'bg-gray-600', 
            border: 'border-gray-400', 
            text: 'text-gray-100', 
            shadow: 'rgba(75, 85, 99, 0.5)' 
        };
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4 h-full flex flex-col relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
      
      {/* Legend / Header */}
      <div className="flex flex-col gap-2 mb-4 z-10">
        <div className="flex justify-between items-center">
            <h3 className="text-gray-400 font-mono text-sm flex items-center gap-2">
            <Icon name="map" size={16} />
            SECTOR_GRID_VIEW
            </h3>
            {/* Status Indicators Legend */}
            <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded bg-gray-600 border border-gray-400"></span> 
                    Idle
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <div className="relative flex items-center justify-center w-2.5 h-2.5">
                        <span className="absolute inline-flex h-full w-full rounded bg-amber-500 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex rounded w-2.5 h-2.5 bg-gray-600 border border-amber-500"></span>
                    </div> 
                    Busy
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> 
                    Incident
                </div>
            </div>
        </div>
        {/* Unit Type Legend */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Icon name="police" size={10} className="text-blue-500" /> Police
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Icon name="fire" size={10} className="text-orange-500" /> Fire
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Icon name="medic" size={10} className="text-emerald-500" /> Medic
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Icon name="hazmat" size={10} className="text-purple-500" /> Hazmat
            </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 relative z-0">
        {SECTORS.map((sector) => {
          const incidentsInSector = activeIncidents.filter(i => i.location === sector && i.status !== 'RESOLVED');
          const unitsInSector = units.filter(u => u.location === sector);
          const hasSelected = incidentsInSector.some(i => i.id === selectedIncidentId);

          return (
            <div 
              key={sector} 
              className={`
                relative border border-gray-800 bg-gray-800/50 rounded-lg p-3 transition-colors duration-300
                ${hasSelected ? 'border-blue-500/50 bg-blue-900/10' : 'hover:border-gray-600'}
              `}
            >
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest absolute top-2 right-2">
                {sector}
              </span>

              {/* Incidents Layer */}
              <div className="mt-6 flex flex-wrap gap-2 min-h-[24px]">
                <AnimatePresence>
                {incidentsInSector.map(inc => (
                  <motion.button 
                    key={inc.id}
                    layoutId={inc.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncident(inc.id);
                    }}
                    aria-label={`Select ${inc.type} incident in ${sector}`}
                    aria-pressed={inc.id === selectedIncidentId}
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-[0_0_10px_rgba(239,68,68,0.5)] cursor-pointer transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white
                      ${inc.id === selectedIncidentId ? 'bg-red-500 border-white scale-110 z-10' : 'bg-red-900 border-red-500'}
                    `}
                    title={`Select ${inc.type} Incident`}
                  >
                    <Icon name="alert" size={12} className="text-white" />
                  </motion.button>
                ))}
                </AnimatePresence>
              </div>

              {/* Units Layer - Dynamic Icons */}
              <div className="absolute bottom-2 left-2 flex gap-1.5 flex-wrap">
                 <AnimatePresence>
                 {unitsInSector.map(unit => {
                   const config = getUnitConfig(unit.type);
                   const isBusy = unit.status === 'BUSY';
                   // A unit is moving if it has a target location different from its current location
                   const isMoving = isBusy && unit.targetLocation && unit.location !== unit.targetLocation;

                   return (
                    <motion.button 
                        key={unit.id}
                        layoutId={unit.id} // Essential for smooth movement between sectors
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUnitId(unit.id);
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                            scale: isBusy ? [1, 1.1, 1] : 1, // Heartbeat effect when busy
                            opacity: 1,
                            borderColor: isBusy ? 'rgb(245, 158, 11)' : 'rgba(255,255,255,0.2)', // Amber border when busy
                            boxShadow: isBusy 
                                ? `0 0 0 2px rgba(245, 158, 11, 0.4), 0 0 10px ${config.shadow}` // Double glow
                                : "0 0 0 0px transparent"
                        }}
                        transition={{
                            scale: { 
                                duration: isMoving ? 0.6 : 2, // Faster heartbeat if en route
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            },
                            layout: { duration: 0.6, type: "spring", bounce: 0.15 },
                            borderColor: { duration: 0.3 }
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`
                            relative w-9 h-9 rounded-xl flex items-center justify-center z-20 cursor-pointer transition-colors
                            border-2 shadow-lg
                            ${config.bg} ${config.text}
                            ${!isBusy && config.border}
                            hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white
                        `}
                        title={`${unit.name} (${isMoving ? 'En Route' : unit.status})`}
                    >
                        {/* The Unit Icon */}
                        <Icon name={config.icon} size={18} />

                        {/* Status Indicator Dot */}
                        {isBusy && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isMoving ? 'bg-white' : 'bg-amber-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 border-2 border-gray-900 ${isMoving ? 'bg-white' : 'bg-amber-500'}`}></span>
                            </span>
                        )}
                    </motion.button>
                   );
                 })}
                 </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Unit Modal */}
      <AnimatePresence>
        {selectedUnit && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                onClick={() => setSelectedUnitId(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 w-full max-w-[280px] relative overflow-hidden"
                >
                        {/* Decorative background gradient */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${selectedUnit.status === 'BUSY' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                        
                        <button 
                        onClick={() => setSelectedUnitId(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                        >
                        <Icon name="x" size={16} />
                        </button>

                        <div className="flex items-center gap-3 mt-2 mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shadow-inner ${getUnitConfig(selectedUnit.type).bg} border-white/20 text-white`}>
                            <Icon name={getUnitConfig(selectedUnit.type).icon} size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white leading-tight">{selectedUnit.name}</h4>
                            <span className="text-xs font-mono text-gray-400 px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700 mt-1 inline-block">
                                {selectedUnit.type}
                            </span>
                        </div>
                        </div>

                        <div className="space-y-2 bg-gray-900/50 p-3 rounded border border-gray-700/50 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-bold px-2 py-0.5 rounded text-xs border ${
                                selectedUnit.status === 'BUSY' ? 'bg-amber-900/30 border-amber-500/30 text-amber-400' : 'bg-blue-900/30 border-blue-500/30 text-blue-400'
                            }`}>
                                {selectedUnit.status === 'BUSY' && selectedUnit.location !== selectedUnit.targetLocation && selectedUnit.targetLocation ? 
                                    'EN ROUTE' : selectedUnit.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Location</span>
                            <span className="text-gray-300 font-mono">{selectedUnit.location}</span>
                        </div>
                        {selectedUnit.targetLocation && selectedUnit.location !== selectedUnit.targetLocation && (
                             <div className="flex justify-between items-center animate-pulse">
                                <span className="text-gray-500">Destination</span>
                                <span className="text-amber-400 font-mono text-xs">{selectedUnit.targetLocation}</span>
                            </div>
                        )}
                            <div className="flex justify-between items-center">
                            <span className="text-gray-500">Unit ID</span>
                            <span className="text-gray-500 font-mono text-xs">#{selectedUnit.id.toUpperCase()}</span>
                        </div>
                        </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};