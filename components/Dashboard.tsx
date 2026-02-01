import React, { useState, useEffect, useCallback } from 'react';
import { Incident, Unit, IncidentSeverity } from '../types';
import { Sidebar } from './Sidebar';
import { MapVisualization } from './MapVisualization';
import { SectorHistogram } from './SectorHistogram';
import { Icon } from './Icon';
import { generateMockIncident, MOCK_UNITS, SECTORS } from '../constants';
import { analyzeIncidentWithGemini } from '../services/geminiService';

export const Dashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Smart Caching: Load resolved incidents stats from local storage
  const [resolvedCount, setResolvedCount] = useState(() => {
    const saved = localStorage.getItem('guardian_resolved_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist resolved count
  useEffect(() => {
    localStorage.setItem('guardian_resolved_count', resolvedCount.toString());
  }, [resolvedCount]);

  // Simulate Unit Movement (Patrolling & Response)
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setUnits(prevUnits => {
        return prevUnits.map(unit => {
          // 1. RESPONSE LOGIC: If BUSY and has a target, move towards it
          if (unit.status === 'BUSY' && unit.targetLocation && unit.location !== unit.targetLocation) {
             // Reverted: 60% chance to arrive at target this tick (was 70%)
             // Reverted: Update interval is back to 2000ms
             if (Math.random() > 0.4) {
                 return { ...unit, location: unit.targetLocation };
             } else {
                 // Move to a random intermediate sector that isn't current or target
                 const possibleMoves = SECTORS.filter(s => s !== unit.location && s !== unit.targetLocation);
                 if (possibleMoves.length > 0) {
                     const nextSector = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                     return { ...unit, location: nextSector };
                 }
                 return unit; // No moves possible (shouldn't happen with >2 sectors)
             }
          }

          // 2. PATROL LOGIC: Only move IDLE units randomly
          // 20% chance to move each tick
          if (unit.status === 'IDLE' && Math.random() > 0.8) {
             const randomSector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
             return { ...unit, location: randomSector };
          }
          return unit;
        });
      });
    }, 2000); // Reverted: Update every 2 seconds

    return () => clearInterval(moveInterval);
  }, []);

  // Simulate Live Feed (Async Operation)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only add incident if we have fewer than 12 active to prevent clutter
      if (incidents.filter(i => i.status !== 'RESOLVED').length < 12) {
        const newIncident = generateMockIncident();
        setIncidents(prev => [newIncident, ...prev]);
      }
    }, 8000); // Reverted: New incident every 8 seconds

    return () => clearInterval(interval);
  }, [incidents]);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  // Gemini Handler
  const handleAnalyze = async () => {
    if (!selectedIncident) return;
    
    setLoadingAnalysis(true);
    
    // Update status to analyzing
    setIncidents(prev => prev.map(i => 
      i.id === selectedIncident.id ? { ...i, status: 'ANALYZING' } : i
    ));

    const analysis = await analyzeIncidentWithGemini(selectedIncident);

    setIncidents(prev => prev.map(i => 
      i.id === selectedIncident.id ? { 
        ...i, 
        aiAnalysis: analysis,
        status: 'PENDING' // Ready for dispatch
      } : i
    ));
    setLoadingAnalysis(false);
  };

  const handleDispatch = () => {
    if (!selectedIncident) return;
    
    // 1. Update Incident Status
    setIncidents(prev => prev.map(i => 
        i.id === selectedIncident.id ? { ...i, status: 'DISPATCHED' } : i
    ));

    // 2. Dispatch a unit
    // Find closest IDLE unit (logic simplified: find ANY IDLE unit)
    setUnits(prev => {
        const availableUnitIndex = prev.findIndex(u => u.status === 'IDLE');
        
        if (availableUnitIndex !== -1) {
            const newUnits = [...prev];
            // Mark BUSY and set TARGET, but do not move immediately (simulating travel initiation)
            newUnits[availableUnitIndex] = {
                ...newUnits[availableUnitIndex],
                status: 'BUSY',
                targetLocation: selectedIncident.location
            };
            return newUnits;
        }
        return prev;
    });
  };

  const handleResolve = () => {
    if (!selectedIncident) return;
    setIncidents(prev => prev.map(i => 
        i.id === selectedIncident.id ? { ...i, status: 'RESOLVED' } : i
    ));
    setResolvedCount(prev => prev + 1);

    // Free up units at this location
    setUnits(prev => {
        // Find units at this location that are BUSY
        const unitIndices = prev.map((u, i) => (u.location === selectedIncident.location && u.status === 'BUSY') ? i : -1).filter(i => i !== -1);
        
        if (unitIndices.length > 0) {
            const newUnits = [...prev];
            // Release one unit
            const idxToFree = unitIndices[0];
            newUnits[idxToFree] = { 
                ...newUnits[idxToFree], 
                status: 'IDLE',
                targetLocation: undefined
            };
            return newUnits;
        }
        return prev;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Left Sidebar - Live Feed */}
      <Sidebar 
        incidents={incidents} 
        onSelectIncident={setSelectedIncidentId} 
        selectedId={selectedIncidentId} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-gray-700 bg-gray-900 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900 rounded-lg">
               <Icon name="critical" className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">GuardianAI</h1>
              <p className="text-xs text-gray-400">Urban Crisis Response System</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
             <div className="flex flex-col items-end">
                <span className="text-gray-400 text-xs">Active Incidents</span>
                <span className="font-mono font-bold text-red-400 text-lg">
                    {incidents.filter(i => i.status !== 'RESOLVED').length}
                </span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-gray-400 text-xs">Resolved (Cached)</span>
                <span className="font-mono font-bold text-green-400 text-lg">{resolvedCount}</span>
             </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
          
          {/* Top/Left: Map & Stats */}
          <div className="flex flex-col gap-4 lg:h-full overflow-y-auto lg:overflow-hidden">
            <div className="h-64 lg:flex-1 lg:min-h-0">
              <MapVisualization 
                activeIncidents={incidents} 
                units={units}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={setSelectedIncidentId}
              />
            </div>
            <div className="h-48 shrink-0">
              <SectorHistogram incidents={incidents} />
            </div>
          </div>

          {/* Bottom/Right: Action Panel */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-full overflow-hidden">
            {!selectedIncident ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                <Icon name="activity" size={48} className="mb-4 opacity-20" />
                <p className="text-lg">Select an incident from the Live Feed to manage response.</p>
              </div>
            ) : (
              <>
                {/* Incident Details Header */}
                <div className="p-6 border-b border-gray-700 bg-gray-850">
                  <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {selectedIncident.type}
                        </h2>
                        <p className="text-gray-400 flex items-center gap-2">
                            <Icon name="map" size={14} />
                            {selectedIncident.location}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        selectedIncident.status === 'RESOLVED' ? 'border-green-500 text-green-400 bg-green-900/20' :
                        selectedIncident.status === 'DISPATCHED' ? 'border-blue-500 text-blue-400 bg-blue-900/20' :
                        'border-red-500 text-red-400 bg-red-900/20'
                    }`}>
                        {selectedIncident.status}
                    </div>
                  </div>
                  
                  {/* Incident Description */}
                  <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700 text-sm">
                    {selectedIncident.description}
                  </div>

                  {/* AI Summary (Displayed directly under description if available) */}
                  {selectedIncident.aiAnalysis?.summary && (
                    <div className="mt-2 p-3 bg-blue-900/10 border border-blue-500/20 rounded text-sm animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon name="ai" size={14} className="text-blue-400" />
                            <span className="font-bold text-blue-400 text-xs uppercase">Situation Summary</span>
                        </div>
                        <p className="text-gray-300">{selectedIncident.aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>

                {/* AI Analysis Section */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold flex items-center gap-2 text-blue-300">
                            <Icon name="ai" />
                            Tactical Analysis
                        </h3>
                        {!selectedIncident.aiAnalysis && selectedIncident.status !== 'RESOLVED' && (
                             <button 
                                onClick={handleAnalyze}
                                disabled={loadingAnalysis}
                                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                             >
                                {loadingAnalysis ? <Icon name="activity" className="animate-spin" size={12}/> : null}
                                {loadingAnalysis ? 'Analyzing...' : 'Run Analysis'}
                             </button>
                        )}
                    </div>

                    {selectedIncident.aiAnalysis ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Maps Grounding Result - With Fallback */}
                            <a 
                                href={selectedIncident.aiAnalysis.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedIncident.location + ' ' + selectedIncident.type + ' San Francisco')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 border rounded-lg transition-all group ${
                                    selectedIncident.aiAnalysis.googleMapsUrl 
                                    ? 'bg-gray-700/50 border-gray-600 hover:border-blue-500 hover:bg-gray-700' 
                                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                                }`}
                            >
                                <div className={`p-2 rounded-full transition-colors ${
                                    selectedIncident.aiAnalysis.googleMapsUrl
                                    ? 'bg-blue-900/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                                    : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200'
                                }`}>
                                    <Icon name="map" size={18} />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${selectedIncident.aiAnalysis.googleMapsUrl ? 'text-gray-200' : 'text-gray-400'}`}>
                                        {selectedIncident.aiAnalysis.googleMapsUrl ? 'View Verified Location' : 'Locate on Maps'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {selectedIncident.aiAnalysis.googleMapsUrl ? 'Location verified by Gemini' : 'External Search'}
                                    </p>
                                </div>
                                <Icon name="search" size={14} className="ml-auto text-gray-500 group-hover:text-white" />
                            </a>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                                    <h4 className="text-xs text-yellow-500 uppercase tracking-wide mb-2">Recommended Units</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedIncident.aiAnalysis.recommendedUnits.map((u, idx) => (
                                            <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 border border-gray-600">
                                                {u}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                                    <h4 className="text-xs text-red-500 uppercase tracking-wide mb-2">Risk Factors</h4>
                                    <ul className="text-xs space-y-1 text-gray-400">
                                        {selectedIncident.aiAnalysis.riskFactors.map((r, idx) => (
                                            <li key={idx} className="flex items-start gap-1">
                                                <span className="text-red-500 mt-0.5">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg text-gray-500 text-sm">
                            Run analysis to generate tactical summary and unit recommendations.
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-gray-700 bg-gray-900 flex justify-end gap-3 sticky bottom-0">
                    {selectedIncident.status !== 'RESOLVED' && (
                        <>
                            <button 
                                onClick={handleDispatch}
                                disabled={selectedIncident.status === 'DISPATCHED'}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm font-semibold rounded shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                            >
                                <Icon name="feed" size={16} />
                                Dispatch Units
                            </button>
                            <button 
                                onClick={handleResolve}
                                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded shadow-lg shadow-green-900/20 transition-all flex items-center gap-2"
                            >
                                <Icon name="check" size={16} />
                                Mark Resolved
                            </button>
                        </>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};