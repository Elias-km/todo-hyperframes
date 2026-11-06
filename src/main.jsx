import './i18n/i18n.js';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { bootstrapTodos } from './bootstrap.js';
import './global.css';

const initialTodos = bootstrapTodos();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App initialTodos={initialTodos} />
  </StrictMode>
);
