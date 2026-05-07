// Vercel Speed Insights initialization for vanilla JavaScript
// This script injects Speed Insights tracking to monitor web performance metrics

(function() {
  // Initialize Speed Insights queue before the library loads
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };
  
  // Load the Speed Insights script
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  script.onerror = function() {
    // Fallback: If the Vercel CDN script is not available (e.g., in development),
    // silently fail without breaking the application
    console.debug('Speed Insights script could not be loaded. This is expected in local development.');
  };
  
  document.head.appendChild(script);
})();
