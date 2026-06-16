import React from 'react'
import ReactDOM from 'react-dom/client'
import WFGOnboardingApp from './WFGOnboardingApp.jsx'
import './index.css'
import { installDemoBackend } from './demoBackend'

// Install the in-repo demo backend (intercepts the app's n8n webhook calls and
// serves them from seeded localStorage) BEFORE the app mounts and fires its
// first request. No n8n, no CRM, no network.
installDemoBackend();

// Read token from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const isAdmin = token ? token.startsWith('admin_') : false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WFGOnboardingApp token={token} isAdmin={isAdmin} />
  </React.StrictMode>,
)
