import React from 'react'
import ReactDOM from 'react-dom/client'
import WFGOnboardingApp from './WFGOnboardingApp.jsx'
import './index.css'

// Get recruit ID from URL parameters (production) or use hardcoded values (development)
const getRecruitInfo = () => {
  // Check URL parameters first (for production deployment)
  const urlParams = new URLSearchParams(window.location.search);
  const recruitId = urlParams.get('recruit_id') || urlParams.get('id');
  const recruitEmail = urlParams.get('recruit_email') || urlParams.get('email');
  
  // If URL params exist, use them
  if (recruitId || recruitEmail) {
    return { recruitId, recruitEmail };
  }
  
  // Otherwise fall back to development values
  // Replace these with actual values for local testing
  return {
    recruitId: 'YOUR_RECRUIT_ID', // Replace with actual ID for testing
    recruitEmail: 'YOUR_RECRUIT_EMAIL' // Or use email for testing
  };
};

const { recruitId, recruitEmail } = getRecruitInfo();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WFGOnboardingApp 
      initialRecruitId={recruitId}
      initialRecruitEmail={recruitEmail}
    />
  </React.StrictMode>,
)
