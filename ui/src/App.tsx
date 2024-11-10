// src/App.tsx
import React from 'react';
import LiveStreamPlayer from './LiveStreamPlayer';

const App: React.FC = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>HackSC2024</h1>
      <LiveStreamPlayer />
    </div>
  );
};

export default App;
