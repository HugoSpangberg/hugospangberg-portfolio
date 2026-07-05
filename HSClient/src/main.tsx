import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './features/admin/admin.scss';
import './styles/globals.scss';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
