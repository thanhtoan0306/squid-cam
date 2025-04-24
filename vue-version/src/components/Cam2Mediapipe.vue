<template>
  <div>
    <video ref="video" id="video" autoplay playsinline style="display: none"></video>
    <canvas ref="canvas" id="canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
let isBackgroundRemovalEnabled = false
const video = ref(null)
const canvas = ref(null)
let selfieSegmentation = null
let ctx = null

onMounted(async () => {
  // Load MediaPipe Selfie Segmentation
  await loadMediaPipeScript()
  selfieSegmentation = new window.SelfieSegmentation({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
  })
  selfieSegmentation.setOptions({
    modelSelection: 1,
    selfieMode: true
  })
  selfieSegmentation.onResults((results) => {
    const c = canvas.value
    const v = video.value
    if (!c || !v) return
    c.width = v.videoWidth
    c.height = v.videoHeight
    ctx = c.getContext('2d')
    ctx.clearRect(0, 0, c.width, c.height)
    if (isBackgroundRemovalEnabled) {
      ctx.drawImage(results.segmentationMask, 0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'source-in'
      ctx.drawImage(results.image, 0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.drawImage(results.image, 0, 0, c.width, c.height)
    }
  })
  // Listen for background removal toggle from Electron
  if (window?.ipcRenderer) {
    window.ipcRenderer.on('toggle-background-removal', (event, enabled) => {
      isBackgroundRemovalEnabled = enabled
    })
  }
  await startWebcam()
  processFrame()
})

function loadMediaPipeScript() {
  return new Promise((resolve) => {
    if (window.SelfieSegmentation) return resolve()
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js'
    script.crossOrigin = 'anonymous'
    script.onload = resolve
    document.head.appendChild(script)
  })
}
async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 360, height: 640 },
    })
    video.value.srcObject = stream
    video.value.play()
  } catch (err) {
    console.error('Error accessing webcam:', err)
  }
}
async function processFrame() {
  if (video.value && video.value.readyState === video.value.HAVE_ENOUGH_DATA) {
    await selfieSegmentation.send({ image: video.value })
  }
  requestAnimationFrame(processFrame)
}
</script>

<style scoped>
#canvas {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  background: #000;
}
</style>
