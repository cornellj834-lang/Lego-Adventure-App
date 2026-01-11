import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("LEGO Build Adventure: Initializing application...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("LEGO Build Adventure: CRITICAL ERROR - Mount point '#root' not found in DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("LEGO Build Adventure: React mount triggered successfully.");
  } catch (error) {
    console.error("LEGO Build Adventure: React mount failed:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #D11013; font-family: 'Fredoka', sans-serif; background: #FEF3C7; height: 100vh;">
        <h1 style="font-size: 2rem;">Oh No!</h1>
        <p style="font-size: 1.2rem;">The LEGO blocks are stuck. Please try refreshing!</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #0055BF; color: white; border: none; border-radius: 10px; font-weight: bold; margin-top: 20px; cursor: pointer;">Refresh Page</button>
      </div>
    `;
  }
}