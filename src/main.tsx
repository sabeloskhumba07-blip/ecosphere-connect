import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { pwaService } from './services/pwaService';
import { storageService } from './services/storageService';

// Initialize PWA services
Promise.all([
  pwaService.init(),
  storageService.init()
]).then(() => {
  console.log('PWA services initialized successfully');
}).catch(error => {
  console.warn('PWA initialization warning:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);