import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { impact } from '../utils/haptics';

export const SettingsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { settings, updateSettings } = useSettings();
    const [scrollY, setScrollY] = useState(0);
    const collapseProgress = Math.min(scrollY / 60, 1);
    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate('/');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-body antialiased transition-colors duration-200 min-h-[100dvh]">
            <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden max-w-md mx-auto">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)]">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                        <button 
                            onClick={() => {
                                impact();
                                handleBack();
                            }}
                            className="justify-self-start flex items-center gap-1 text-primary hover:opacity-70 transition-opacity -ml-2 px-2 py-1 select-none"
                        >
                            <span className="material-symbols-outlined text-2xl -ml-1">chevron_left</span>
                            <span className="text-[17px] leading-tight -mt-0.5 font-display">Back</span>
                        </button>
                        <h2
                            className="text-[17px] font-semibold leading-tight font-display transition-opacity duration-200"
                            style={{ opacity: collapseProgress }}
                        >
                            Settings
                        </h2>
                        <div className="w-[60px] justify-self-end" aria-hidden="true"></div>
                    </div>
                </header>

                <main
                    className="flex-1 overflow-y-auto ios-scroll pb-24 pt-2 px-4"
                    onScroll={(event) => setScrollY(event.currentTarget.scrollTop)}
                >
                    <div
                        className="px-2 pt-4 pb-2"
                        style={{
                            opacity: 1 - collapseProgress,
                            transform: `translateY(${Math.max(0, 12 - collapseProgress * 12)}px)`
                        }}
                    >
                        <h1 className="text-[34px] leading-tight font-semibold font-display">Settings</h1>
                    </div>
                    {/* Section: Measurements */}
                    <div className="mt-6">
                        <h4 className="text-text-secondary text-[13px] uppercase leading-none px-4 mb-2 tracking-wide font-normal">Measurements</h4>
                        <div className="overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-separator-light/30 dark:border-separator-dark">
                                <span className="text-[17px] text-slate-900 dark:text-white">Speed Units</span>
                                <div className="flex bg-gray-100 dark:bg-black/30 p-0.5 rounded-lg select-none">
                                    <label className="cursor-pointer" onClick={() => {
                                        impact();
                                        updateSettings({ unit: 'MPH' });
                                    }}>
                                        <input checked={settings.unit === 'MPH'} readOnly className="peer sr-only" name="speed_unit" type="radio"/>
                                        <div className="px-3 py-1 rounded-[6px] text-[13px] font-medium text-gray-500 peer-checked:bg-white dark:peer-checked:bg-[#636366] peer-checked:text-black dark:peer-checked:text-white peer-checked:shadow-sm transition-all">MPH</div>
                                    </label>
                                    <label className="cursor-pointer" onClick={() => {
                                        impact();
                                        updateSettings({ unit: 'KMH' });
                                    }}>
                                        <input checked={settings.unit === 'KMH'} readOnly className="peer sr-only" name="speed_unit" type="radio"/>
                                        <div className="px-3 py-1 rounded-[6px] text-[13px] font-medium text-gray-500 peer-checked:bg-white dark:peer-checked:bg-[#636366] peer-checked:text-black dark:peer-checked:text-white peer-checked:shadow-sm transition-all">KM/H</div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-[17px] text-slate-900 dark:text-white">High Precision</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        checked={settings.highPrecision}
                                        onChange={() => {
                                            impact();
                                            updateSettings({ highPrecision: !settings.highPrecision });
                                        }}
                                        className="sr-only peer"
                                        type="checkbox"
                                    />
                                    <div className="w-[51px] h-[31px] bg-[#E9E9EA] peer-focus:outline-none rounded-full peer dark:bg-[#39393D] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:transition-all dark:border-gray-600 peer-checked:bg-[#34C759]"></div>
                                </label>
                            </div>
                        </div>
                        <p className="text-text-secondary text-[13px] px-4 mt-2 font-normal">Enables 2 decimal places for speed readings.</p>
                    </div>

                    {/* Section: Camera */}
                    <div className="mt-8">
                        <h4 className="text-text-secondary text-[13px] uppercase leading-none px-4 mb-2 tracking-wide font-normal">Camera</h4>
                        <div className="overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark divide-y divide-separator-light/30 dark:divide-separator-dark">
                            <button
                                className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                                onClick={() => impact()}
                            >
                                <span className="text-[17px] text-slate-900 dark:text-white">Resolution</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[17px] text-text-secondary">4K 60fps</span>
                                    <span className="material-symbols-outlined text-text-secondary/50 text-xl">chevron_right</span>
                                </div>
                            </button>
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-[17px] text-slate-900 dark:text-white">Stabilization</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        checked={settings.stabilization}
                                        onChange={() => {
                                            impact();
                                            updateSettings({ stabilization: !settings.stabilization });
                                        }}
                                        className="sr-only peer"
                                        type="checkbox"
                                    />
                                    <div className="w-[51px] h-[31px] bg-[#E9E9EA] peer-focus:outline-none rounded-full peer dark:bg-[#39393D] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:transition-all dark:border-gray-600 peer-checked:bg-[#34C759]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section: Tracking Engine */}
                    <div className="mt-8">
                        <h4 className="text-text-secondary text-[13px] uppercase leading-none px-4 mb-2 tracking-wide font-normal">Tracking Engine</h4>
                        <div className="overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark divide-y divide-separator-light/30 dark:divide-separator-dark">
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-[17px] text-slate-900 dark:text-white">Auto-Detect Vehicles</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        checked={settings.autoDetect}
                                        onChange={() => {
                                            impact();
                                            updateSettings({ autoDetect: !settings.autoDetect });
                                        }}
                                        className="sr-only peer"
                                        type="checkbox"
                                    />
                                    <div className="w-[51px] h-[31px] bg-[#E9E9EA] peer-focus:outline-none rounded-full peer dark:bg-[#39393D] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:transition-all dark:border-gray-600 peer-checked:bg-[#34C759]"></div>
                                </label>
                            </div>
                            <div className="px-4 py-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[17px] text-slate-900 dark:text-white">Sensitivity</span>
                                    <span className="text-[15px] text-text-secondary">{settings.sensitivity}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-text-secondary text-lg">remove_circle_outline</span>
                                    <div className="relative w-full h-6 flex items-center">
                                        <input 
                                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary z-10" 
                                          max="100" 
                                          min="0" 
                                          type="range" 
                                          value={settings.sensitivity}
                                          onChange={(e) => updateSettings({ sensitivity: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <span className="material-symbols-outlined text-text-secondary text-lg">add_circle_outline</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section: Data & Storage */}
                    <div className="mt-8 mb-10">
                        <h4 className="text-text-secondary text-[13px] uppercase leading-none px-4 mb-2 tracking-wide font-normal">Data & Storage</h4>
                        <div className="overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark divide-y divide-separator-light/30 dark:divide-separator-dark">
                            <button
                                className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                                onClick={() => impact()}
                            >
                                <span className="text-[17px] text-slate-900 dark:text-white">Export History</span>
                                <span className="material-symbols-outlined text-text-secondary/50 text-xl">chevron_right</span>
                            </button>
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-[17px] text-slate-900 dark:text-white">Save Snapshots</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input className="sr-only peer" type="checkbox" onChange={() => impact()} />
                                    <div className="w-[51px] h-[31px] bg-[#E9E9EA] peer-focus:outline-none rounded-full peer dark:bg-[#39393D] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:transition-all dark:border-gray-600 peer-checked:bg-[#34C759]"></div>
                                </label>
                            </div>
                            <button
                                className="w-full flex items-center justify-between px-4 py-3 active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
                                onClick={() => impact()}
                            >
                                <span className="text-[17px] text-red-500">Clear All Data</span>
                            </button>
                        </div>
                        <div className="mt-8 flex flex-col items-center">
                            <p className="text-text-secondary text-[13px] font-normal">SpeedTracker Pro v2.4 (Build 890)</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
