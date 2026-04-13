import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { notify } from './services/notifications';

if (typeof window !== 'undefined') {
  window.alert = ((message?: unknown) => {
    const text = typeof message === 'string' ? message : 'Action completed.';
    notify(text, 'info');
  }) as typeof window.alert;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
