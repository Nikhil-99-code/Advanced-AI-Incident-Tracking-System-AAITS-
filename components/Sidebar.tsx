import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Incident, IncidentSeverity } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  selectedId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ incidents, onSelectIncident, selectedId }) => {
  const [activeTab, setActiveTab] = useState<'OPEN' | 'RESOLVED'>('OPEN');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterTime, setFilterTime] = useState<string>('ALL');

  // Reset status filter when tab changes to avoid invalid states
  useEffect(() => {
    setFilterStatus('ALL');
  }, [activeTab]);

  const filteredIncidents = useMemo(() => {
    let result = incidents;

    // 0. Tab Filter
    if (activeTab === 'OPEN') {
      result = result.filter(i => i.status !== 'RESOLVED');
    } else {
      result = result.filter(i => i.status === 'RESOLVED');
    }

    // 1. Text Search
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(incident => 
        incident.location.toLowerCase().includes(query) ||
        incident.type.toLowerCase().includes(query) ||
        incident.id.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query)
      );
    }

    // 2. Status Filter (Sub-filter within the tab)
    if (filterStatus !== 'ALL') {
      result = result.filter(incident => incident.status === filterStatus);
    }

    // 3. Severity Filter
    if (filterSeverity !== 'ALL') {
      result = result.filter(incident => incident.severity === filterSeverity);
    }

    // 4. Time Filter
    if (filterTime !== 'ALL') {
      const now = Date.now();
      const oneMinute = 60 * 1000;
      const oneHour = 60 * oneMinute;
      
      if (filterTime === '1H') {
        result = result.filter(i => now - i.timestamp < oneHour);
      } else if (filterTime === '24H') {
        result = result.filter(i => now - i.timestamp < 24 * oneHour);
      }
    }

    return result;
  }, [incidents, activeTab, searchQuery, filterStatus, filterSeverity, filterTime]);

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'RESOLVED': return 'bg-green-900/80 text-green-300 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
        case 'DISPATCHED': return 'bg-blue-900/80 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
        case 'ANALYZING': return 'bg-purple-900/80 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
        default: return 'bg-red-900/80 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    }
  };
  
  // Calculate counts for tabs
  const openCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  return (
    <aside 
      className="w-full md:w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-[40vh] md:h-full transition-all duration-300"
      aria-label="Live Incident Feed"
    >
      <div className="p-4 border-b border-gray-700 bg-gray-900/50 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-red-400 flex items-center gap-2">
            <Icon name="feed" className="animate-pulse" />
            Live Feed
          </h2>
          <span className="text-xs font-mono bg-red-900/30 text-red-400 px-2 py-1 rounded">
            LIVE
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-900 rounded-lg border border-gray-700">
            <button
                onClick={() => setActiveTab('OPEN')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === 'OPEN' 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Open
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'OPEN' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                    {openCount}
                </span>
            </button>
            <button
                onClick={() => setActiveTab('RESOLVED')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${
                    activeTab === 'RESOLVED' 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
            >
                Resolved
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'RESOLVED' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}>
                    {resolvedCount}
                </span>
            </button>
        </div>

        {/* Search and Filter Toggle */}
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" size={14} className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-md pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search incidents"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-md border transition-colors flex items-center justify-center
              ${showFilters 
                ? 'bg-blue-900/50 border-blue-500 text-blue-400' 
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            aria-label="Toggle advanced filters"
            aria-pressed={showFilters}
          >
            <Icon name="filter" size={16} />
          </button>
        </div>

        {/* Advanced Filters with Animation */}
        <AnimatePresence>
            {showFilters && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 gap-2 overflow-hidden"
            >
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="col-span-1 bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                    aria-label="Filter by Status"
                    disabled={activeTab === 'RESOLVED'} // No status to filter in resolved tab
                >
                    <option value="ALL">All Status</option>
                    {activeTab === 'OPEN' && (
                        <>
                            <option value="PENDING">Pending</option>
                            <option value="ANALYZING">Analyzing</option>
                            <option value="DISPATCHED">Dispatched</option>
                        </>
                    )}
                     {activeTab === 'RESOLVED' && (
                        <option value="RESOLVED">Resolved</option>
                    )}
                </select>

                <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="col-span-1 bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                aria-label="Filter by Severity"
                >
                <option value="ALL">All Severity</option>
                {Object.values(IncidentSeverity).map(sev => (
                    <option key={sev} value={sev}>{sev}</option>
                ))}
                </select>

                <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="col-span-2 bg-gray-800 border border-gray-700 text-xs text-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
                aria-label="Filter by Timeframe"
                >
                <option value="ALL">Any Time</option>
                <option value="1H">Last Hour</option>
                <option value="24H">Last 24 Hours</option>
                </select>
            </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
        <AnimatePresence mode="popLayout">
            {filteredIncidents.length === 0 ? (
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-500 text-center mt-10 p-4"
                >
                    {searchQuery || filterStatus !== 'ALL' || filterSeverity !== 'ALL' || filterTime !== 'ALL' ? (
                    <>
                        <Icon name="search" size={24} className="mx-auto mb-2 opacity-20" />
                        <p>No matches found.</p>
                        <button 
                        onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('ALL');
                            setFilterSeverity('ALL');
                            setFilterTime('ALL');
                        }}
                        className="text-blue-400 text-xs mt-2 hover:underline"
                        >
                        Clear all filters
                        </button>
                    </>
                    ) : (
                    <>
                        <p>Scanning frequencies...</p>
                        <p className="text-sm mt-2">No {activeTab.toLowerCase()} incidents.</p>
                    </>
                    )}
                </motion.div>
            ) : (
            filteredIncidents.map((incident) => (
                <motion.button
                layout
                key={incident.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectIncident(incident.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 relative group overflow-hidden
                    ${selectedId === incident.id 
                    ? 'bg-gray-700 border-blue-500 shadow-lg shadow-blue-900/20' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-500'
                    }
                `}
                aria-pressed={selectedId === incident.id}
                aria-label={`${incident.severity} priority incident at ${incident.location}`}
                >
                    <div className="flex justify-between items-start mb-1 relative z-10">
                        <div className="flex gap-2 items-center">
                            {/* Priority Badge */}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border
                            ${incident.priority === 1 ? 'bg-red-500/20 text-red-400 border-red-500/50' : 
                                incident.priority === 2 ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                                incident.priority === 3 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                'bg-blue-500/20 text-blue-400 border-blue-500/50'
                            }`}>
                            P{incident.priority}
                            </span>
                            
                            {/* Animated Status Badge */}
                            <motion.span
                                key={incident.status}
                                initial={{ scale: 0.8, opacity: 0.5, y: 5 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 backdrop-blur-sm transition-colors duration-300 ${getStatusColor(incident.status)}`}
                            >
                                {incident.status === 'ANALYZING' && (
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Icon name="activity" size={10} />
                                    </motion.span>
                                )}
                                {incident.status === 'RESOLVED' && <Icon name="check" size={10} />}
                                {incident.type.toUpperCase()}
                            </motion.span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                            {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-100 truncate relative z-10">{incident.location}</p>
                    <p className="text-xs text-gray-400 truncate mt-1 relative z-10">{incident.description}</p>
                    
                    {/* Status Indicator Bar */}
                    <motion.div 
                        initial={false}
                        animate={{ 
                            backgroundColor: incident.status === 'RESOLVED' ? '#22c55e' : 
                                           incident.status === 'DISPATCHED' ? '#3b82f6' :
                                           incident.status === 'ANALYZING' ? '#a855f7' : '#ef4444'
                        }}
                        transition={{ duration: 0.3 }}
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg
                            ${incident.status !== 'RESOLVED' && 'animate-pulse'}
                        `} 
                    />
                </motion.button>
            ))
            )}
        </AnimatePresence>
      </div>
    </aside>
  );
};