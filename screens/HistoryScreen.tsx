import React, { useState } from 'react';
import { MOCK_HISTORY } from '../constants';
import { BottomNav } from '../components/BottomNav';
import { useSettings } from '../context/SettingsContext';
import { impact } from '../utils/haptics';

export const HistoryScreen: React.FC = () => {
    const { settings } = useSettings();
    const [scrollY, setScrollY] = useState(0);
    const collapseProgress = Math.min(scrollY / 60, 1);

    const convertSpeed = (speed: number) => {
        if (settings.unit === 'MPH') {
            return (speed * 0.621371).toFixed(0);
        }
        return speed.toString();
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-[100dvh] h-[100dvh] flex flex-col font-display text-slate-900 dark:text-white overflow-hidden">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-transparent transition-colors duration-200">
                <div className="flex items-center justify-between px-6 pt-10 pb-3">
                    <h2
                        className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-white transition-opacity duration-200"
                        style={{ opacity: collapseProgress }}
                    >
                        History
                    </h2>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div
                className="flex-1 px-6 pt-3 space-y-10 overflow-y-auto ios-scroll pb-28"
                onScroll={(event) => setScrollY(event.currentTarget.scrollTop)}
            >
                <div
                    className="pt-3"
                    style={{
                        opacity: 1 - collapseProgress,
                        transform: `translateY(${Math.max(0, 12 - collapseProgress * 12)}px)`
                    }}
                >
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">History</h1>
                </div>
                {MOCK_HISTORY.map((group, groupIdx) => (
                    <section key={groupIdx}>
                        <h2 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4 pl-1 font-body">{group.date}</h2>
                        <div className="space-y-6">
                            {group.items.map((item, itemIdx) => (
                                <div
                                    key={itemIdx}
                                    className="flex items-center justify-between group cursor-pointer select-none active:scale-[0.99] active:opacity-80 transition"
                                    onClick={() => impact()}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-light dark:bg-surface-dark text-slate-900 dark:text-white transition-colors group-hover:bg-gray-200 dark:group-hover:bg-gray-800">
                                            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-semibold text-slate-900 dark:text-white leading-none mb-1.5">{item.label}</span>
                                            <span className="text-xs font-medium text-gray-400 font-body">{item.time}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{convertSpeed(item.speed)}</span>
                                        <span className="text-xs font-medium text-gray-400 ml-0.5 uppercase">
                                            {settings.unit === 'KMH' ? 'km/h' : 'mph'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <BottomNav />
        </div>
    );
};
