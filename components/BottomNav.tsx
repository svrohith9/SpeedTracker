import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-900/50 pb-6 pt-2 z-40">
      <div className="flex justify-around items-center px-6">
        <button 
          onClick={() => navigate('/')} 
          className={`p-3 transition-colors rounded-full ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${isActive('/') ? 'icon-filled' : ''}`}>home</span>
        </button>
        
        <button 
          onClick={() => navigate('/history')}
          className={`p-3 transition-colors rounded-full ${isActive('/history') ? 'text-primary' : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <span className={`material-symbols-outlined text-[26px] ${isActive('/history') ? 'icon-filled' : ''}`}>history</span>
        </button>

        <button className="group -mt-8" onClick={() => navigate('/')}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/10 dark:shadow-none text-slate-900 transition-transform group-active:scale-95">
            <span className="material-symbols-outlined text-[32px]">center_focus_strong</span>
          </div>
        </button>

        <button className="p-3 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full">
          <span className="material-symbols-outlined text-[26px]">analytics</span>
        </button>

        <button 
          onClick={() => navigate('/settings')}
          className={`p-3 transition-colors rounded-full ${isActive('/settings') ? 'text-primary' : 'text-gray-400 hover:text-slate-900 dark:hover:text-white'}`}
        >
          <span className="material-symbols-outlined text-[26px]">settings</span>
        </button>
      </div>
    </div>
  );
};
