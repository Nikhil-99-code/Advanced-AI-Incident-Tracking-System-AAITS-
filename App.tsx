import React from 'react';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="antialiased text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 min-h-screen">
      <Dashboard />
    </div>
  );
};

export default App;