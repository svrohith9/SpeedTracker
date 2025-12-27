export interface HistoryItem {
  type: string;
  label: string;
  time: string;
  speed: number;
  icon: string;
}

export interface HistoryGroup {
  date: string;
  items: HistoryItem[];
}

export type SpeedUnit = 'KMH' | 'MPH';

export interface SettingsState {
  unit: SpeedUnit;
  highPrecision: boolean;
  stabilization: boolean;
  autoDetect: boolean;
  sensitivity: number;
}

export interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
}
