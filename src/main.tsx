import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/// Browser-only Vite entry point for the punch-through app.
const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Missing root element.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
