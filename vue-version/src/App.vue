<template>
  <div id="app">
    <div id="video-preview">
      Video Preview Area
      <div id="applied-effect">{{ appliedEffectText }}</div>
    </div>
    <div id="main-controls">
      <div id="left-controls">
        <button @click="onCamera">Camera</button>
        <button @click="onCapture">Capture</button>
        <button @click="onMultimedia">Multimedia</button>
        <button @click="onRTMP">RTMP</button>
      </div>
      <div id="right-controls">
        <button id="start-stream-button" @click="onStartStreaming">Start Streaming</button>
      </div>
    </div>
    <button id="open-secondary-btn" @click="openSecondaryWindow">Mở cửa sổ hiệu ứng phụ</button>
    <button id="mirror-secondary-btn" @click="mirrorSecondary">Mirror Secondary Video</button>
    <div class="control-section">
      <h4>Effects</h4>
      <div class="button-grid effect-buttons">
        <button v-for="effect in effects" :key="effect" @click="applyEffect(effect)">{{ effect }}</button>
        <button id="toggle-background-btn" :style="backgroundBtnStyle" @click="toggleBackground">{{ backgroundBtnText }}</button>
      </div>
    </div>
    <div class="control-section">
      <h4>Sound Animation 🔊</h4>
      <div class="button-grid sound-buttons">
        <button v-for="sound in sounds" :key="sound.label" @click="playSound(sound.value)">{{ sound.label }}</button>
      </div>
    </div>
    <!-- Component MediaPipe (secondary window) sẽ được mở riêng, không nhúng ở đây -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const effects = ['Blur', 'Pixelate', 'Sepia', 'Invert']
const sounds = [
  { label: '👏', value: 'Applause' },
  { label: '💨', value: 'ColdWind' },
  { label: '🐦', value: 'Crow' },
  { label: '😂', value: 'Laugh' }
]
const appliedEffectText = ref('No effect applied')
const isBackgroundRemovalEnabled = ref(true)

const backgroundBtnText = computed(() => isBackgroundRemovalEnabled.value ? 'Hide Background' : 'Show Background')
const backgroundBtnStyle = computed(() => ({ backgroundColor: isBackgroundRemovalEnabled.value ? '#4CAF50' : '#FF5722' }))

function applyEffect(effect) {
  appliedEffectText.value = `Applied Effect: ${effect}`
  // Gửi IPC nếu chạy trong Electron
  window?.ipcRenderer?.send?.('apply-effect', effect)
}
function playSound(sound) {
  window?.ipcRenderer?.send?.('play-sound', sound)
}
function openSecondaryWindow() {
  window?.ipcRenderer?.send?.('open-secondary-window')
}
function mirrorSecondary() {
  window?.ipcRenderer?.send?.('toggle-mirror-secondary')
}
function toggleBackground() {
  isBackgroundRemovalEnabled.value = !isBackgroundRemovalEnabled.value
  window?.ipcRenderer?.send?.('toggle-background-removal', isBackgroundRemovalEnabled.value)
}
function onCamera() {}
function onCapture() {}
function onMultimedia() {}
function onRTMP() {}
function onStartStreaming() {}

// Lắng nghe update-effect từ main process (nếu chạy trong Electron)
if (window?.ipcRenderer) {
  window.ipcRenderer.on('update-effect', (event, effectName) => {
    appliedEffectText.value = `Applied Effect: ${effectName}`
  })
}
</script>

<style scoped>
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
</style>
