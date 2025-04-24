import React, { useState, useEffect, useCallback } from 'react';

const effects = ['Blur', 'Pixelate', 'Sepia', 'Invert'];
const sounds = [
  { label: '👏', value: 'Applause' },
  { label: '💨', value: 'ColdWind' },
  { label: '🐦', value: 'Crow' },
  { label: '😂', value: 'Laugh' },
];

export default function App() {
  const [appliedEffect, setAppliedEffect] = useState('No effect applied');
  const [isBackgroundRemovalEnabled, setIsBackgroundRemovalEnabled] = useState(true);

  const backgroundBtnText = isBackgroundRemovalEnabled ? 'Hide Background' : 'Show Background';
  const backgroundBtnStyle = { backgroundColor: isBackgroundRemovalEnabled ? '#4CAF50' : '#FF5722' };

  const applyEffect = (effect) => {
    setAppliedEffect(`Applied Effect: ${effect}`);
    window?.ipcRenderer?.send?.('apply-effect', effect);
  };
  const playSound = (sound) => {
    window?.ipcRenderer?.send?.('play-sound', sound);
  };
  const openSecondaryWindow = () => {
    window?.ipcRenderer?.send?.('open-secondary-window');
  };
  const mirrorSecondary = () => {
    window?.ipcRenderer?.send?.('toggle-mirror-secondary');
  };
  const toggleBackground = () => {
    setIsBackgroundRemovalEnabled((prev) => {
      const next = !prev;
      window?.ipcRenderer?.send?.('toggle-background-removal', next);
      return next;
    });
  };
  const onCamera = () => {};
  const onCapture = () => {};
  const onMultimedia = () => {};
  const onRTMP = () => {};
  const onStartStreaming = () => {};

  useEffect(() => {
    if (window?.ipcRenderer) {
      window.ipcRenderer.on('update-effect', (event, effectName) => {
        setAppliedEffect(`Applied Effect: ${effectName}`);
      });
    }
    // Cleanup
    return () => {
      if (window?.ipcRenderer?.removeAllListeners) {
        window.ipcRenderer.removeAllListeners('update-effect');
      }
    };
  }, []);

  return (
    <div id="app">
      <div id="video-preview">
        Video Preview Area
        <div id="applied-effect">{appliedEffect}</div>
      </div>
      <div id="main-controls">
        <div id="left-controls">
          <button onClick={onCamera}>Camera</button>
          <button onClick={onCapture}>Capture</button>
          <button onClick={onMultimedia}>Multimedia</button>
          <button onClick={onRTMP}>RTMP</button>
        </div>
        <div id="right-controls">
          <button id="start-stream-button" onClick={onStartStreaming}>Start Streaming</button>
        </div>
      </div>
      <button id="open-secondary-btn" onClick={openSecondaryWindow}>Mở cửa sổ hiệu ứng phụ</button>
      <button id="mirror-secondary-btn" onClick={mirrorSecondary}>Mirror Secondary Video</button>
      <div className="control-section">
        <h4>Effects</h4>
        <div className="button-grid effect-buttons">
          {effects.map((effect) => (
            <button key={effect} onClick={() => applyEffect(effect)}>{effect}</button>
          ))}
          <button id="toggle-background-btn" style={backgroundBtnStyle} onClick={toggleBackground}>{backgroundBtnText}</button>
        </div>
      </div>
      <div className="control-section">
        <h4>Sound Animation 🔊</h4>
        <div className="button-grid sound-buttons">
          {sounds.map((sound) => (
            <button key={sound.value} onClick={() => playSound(sound.value)}>{sound.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Styles
const style = document.createElement('style');
style.innerHTML = `
body {
  font-family: sans-serif;
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
}
#video-preview {
  flex-grow: 1;
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5em;
  border-bottom: 1px solid #ccc;
}
#main-controls {
  padding: 10px;
  background-color: #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#left-controls button,
#right-controls button {
  padding: 8px 15px;
  margin: 0 5px;
  cursor: pointer;
}
#start-stream-button {
  background-color: #ffcc00;
  border: none;
  font-weight: bold;
}
#applied-effect {
  margin-top: 10px;
  font-style: italic;
  color: #555;
  text-align: center;
}
`;
document.head.appendChild(style);
