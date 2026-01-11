import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("LEGO: Script execution started...");

const mountApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error("LEGO: Could not find root element.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("LEGO: Successfully mounted App.");
  } catch (error) {
    console.error("LEGO: Error during mounting:", error);
    container.innerHTML = `<div style="padding:20px; text-align:center;"><h1>LEGO Error</h1><p>${error}</p></div>`;
  }
};

// Start mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}