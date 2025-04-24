// Main JS to import and connect components
import './components/Webcam.html';
import './components/Header.html';
import './components/Footer.html';
import './components/Controls.html';

// Load HTML components into containers
function loadComponent(containerId, filePath) {
  fetch(filePath)
    .then(res => res.text())
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
    });
}

document.addEventListener('DOMContentLoaded', function() {
  loadComponent('header-container', './components/Header.html');
  loadComponent('controls-container', './components/Controls.html');
  loadComponent('webcam-container', './components/Webcam.html');
  loadComponent('footer-container', './components/Footer.html');

  // Example: Add event listeners for webcam controls here
  document.addEventListener('click', function(e) {
    if (e.target.id === 'start-btn') {
      // TODO: Start webcam logic
      alert('Start Webcam');
    } else if (e.target.id === 'stop-btn') {
      // TODO: Stop webcam logic
      alert('Stop Webcam');
    }
  });
});
