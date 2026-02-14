import React from 'react'
import ReactDOM from 'react-dom/client'
import WFGOnboardingApp from './WFGOnboardingApp.jsx'
import './index.css'

// Read token from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const isAdmin = token ? token.startsWith('admin_') : false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WFGOnboardingApp token={token} isAdmin={isAdmin} />
  </React.StrictMode>,
)
