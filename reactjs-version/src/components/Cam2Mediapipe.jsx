import React, { useRef, useEffect } from 'react';

export default function Cam2Mediapipe() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let selfieSegmentation = null;
  let isBackgroundRemovalEnabled = false;

  useEffect(() => {
    // Load MediaPipe script
    function loadMediaPipeScript() {
      return new Promise((resolve) => {
        if (window.SelfieSegmentation) return resolve();
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js';
        script.crossOrigin = 'anonymous';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 360, height: 640 },
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    }
    async function processFrame() {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        await selfieSegmentation.send({ image: videoRef.current });
      }
      requestAnimationFrame(processFrame);
    }
    async function init() {
      await loadMediaPipeScript();
      selfieSegmentation = new window.SelfieSegmentation({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`,
      });
      selfieSegmentation.setOptions({
        modelSelection: 1,
        selfieMode: true,
      });
      selfieSegmentation.onResults((results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isBackgroundRemovalEnabled) {
          ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-in';
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
        } else {
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        }
      });
      // Listen for background removal toggle
      if (window?.ipcRenderer) {
        window.ipcRenderer.on('toggle-background-removal', (event, enabled) => {
          isBackgroundRemovalEnabled = enabled;
        });
      }
      await startWebcam();
      processFrame();
    }
    init();
    // Cleanup listeners
    return () => {
      if (window?.ipcRenderer?.removeAllListeners) {
        window.ipcRenderer.removeAllListeners('toggle-background-removal');
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} id="video" autoPlay playsInline style={{ display: 'none' }}></video>
      <canvas ref={canvasRef} id="canvas"></canvas>
    </div>
  );
}

// Styles
const style = document.createElement('style');
style.innerHTML = `
#canvas {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  background: #000;
}
`;
document.head.appendChild(style);
