import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';
import './index.css';
import './store';
import App from './app/App';
import { registerCoreSearchProviders } from './services/searchProviders';
import { zodEsErrorMap } from './lib/zod-locale';

z.setErrorMap(zodEsErrorMap);
registerCoreSearchProviders();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento raíz #root');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
