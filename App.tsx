import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { CameraScreen } from './screens/CameraScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<CameraScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
};

export default App;
