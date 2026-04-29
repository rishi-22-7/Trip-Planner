/*
  main.jsx – Application entry point.
  Mounts the React app into the #root div and renders the global
  react-hot-toast <Toaster /> so any component can trigger notifications.
*/
import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import { Toaster }     from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Global toast container – position and styling configured here once */}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontSize: '14px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        },
        success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
      }}
    />
  </StrictMode>
);
