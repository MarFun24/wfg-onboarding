import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Clock, ChevronDown, ChevronUp,
  BookOpen, GraduationCap, Calendar, Award, ExternalLink,
  Mail, Phone, MapPin, User, Target, CheckCheck, Shield,
  ArrowRight, Zap, Star, TrendingUp, Briefcase
} from 'lucide-react';
import AdminDashboard from './AdminDashboard.jsx';

// Configuration
const CONFIG = {
  n8nBaseUrl: import.meta.env.VITE_N8N_BASE_URL || 'https://mfunston.app.n8n.cloud',
  webhooks: {
    getData: '/webhook/wfg-app-get-recruit-data',
    updateStep: '/webhook/wfg-app-step-update'
  }
};

// Normalize step data from API to handle GHL field name mismatches and type coercion
const normalizeStep = (step) => ({
  ...step,
  description: step.description || step.step_description || '',
  step_number: typeof step.step_number === 'number' ? step.step_number : parseInt(step.step_number, 10) || 0,
  is_completed: step.is_completed === true || step.is_completed === 'true',
  instructions: Array.isArray(step.instructions)
    ? step.instructions
    : typeof step.instructions === 'string'
      ? (() => { try { const parsed = JSON.parse(step.instructions); return Array.isArray(parsed) ? parsed : [step.instructions]; } catch { return step.instructions.split('\n').filter(i => i.trim()); } })()
      : [],
  status: ['Completed', 'On Track', 'Due Soon', 'Overdue'].includes(step.status) ? step.status : 'On Track',
});

// Normalize the full recruit API response
const normalizeRecruitResponse = (data) => ({
  ...data,
  licensing_steps: (data.licensing_steps || []).map(normalizeStep),
  training_steps: (data.training_steps || []).map(normalizeStep),
});

// Mock data for demo/fallback
const MOCK_DATA = {
  success: true,
  recruit: {
    id: "demo_recruit_001",
    full_name: "Jorge Maldonado",
    email: "jorge.maldonado@wfg.com",
    phone: "(555) 789-4321",
    country: "United States",
    state_province: "Texas",
    start_date: "2024-01-15",
    recruit_stage: "Active Onboarding",
    timeline_health: "On Track",
    licensing_status: "In Progress",
    training_status: "In Progress",
    recruiter_name: "Jorge Maldonado",
    upline_office: "Houston Office"
  },
  progress: {
    licensing: {
      total: 12,
      completed: 5,
      percentage: 42,
      status_breakdown: { completed: 5, overdue: 0, due_soon: 2, on_track: 5 }
    },
    training: {
      total: 8,
      completed: 2,
      percentage: 25,
      status_breakdown: { completed: 2, overdue: 0, due_soon: 2, on_track: 4 }
    }
  },
  licensing_steps: [
    {
      id: "lic_1", step_number: 1,
      step_title: "Sign Your Membership Agreement",
      description: "Do the Associate Membership Agreement",
      status: "Completed", is_completed: true,
      deadline_date: "2024-01-16", completed_date: "2024-01-15",
      timeline_guidance: "5 mins",
      instructions: ["Type in your personal information"],
      resources: "Your trainer and your ID - www.wfglaunch.com"
    },
    {
      id: "lic_2", step_number: 2,
      step_title: "Pay Your Membership Fees",
      description: "Pay for your Associate Membership Agreement",
      status: "Completed", is_completed: true,
      deadline_date: "2024-01-16", completed_date: "2024-01-15",
      timeline_guidance: "1 min",
      instructions: ["Use your credit card to pay"],
      resources: "Your trainer and your credit card"
    },
    {
      id: "lic_3", step_number: 3,
      step_title: "Register for Your Online Course",
      description: "Sign up for the Life & Health pre-licensing course",
      status: "Completed", is_completed: true,
      deadline_date: "2024-01-18", completed_date: "2024-01-17",
      timeline_guidance: "5 mins",
      instructions: [
        "Go to your WFG Launch webpage",
        "Go to licensing",
        "Pick your licensing provider",
        "Sign up and pay for the course"
      ],
      resources: "Your trainer and your credit card - wfglaunch.com"
    },
    {
      id: "lic_4", step_number: 4,
      step_title: "Complete Your Pre-Licensing Course",
      description: "Study and pass the pre-licensing course",
      status: "Completed", is_completed: true,
      deadline_date: "2024-01-25", completed_date: "2024-01-24",
      timeline_guidance: "7 days",
      instructions: ["Study and learn the material"],
      resources: "The training course material"
    },
    {
      id: "lic_5", step_number: 5,
      step_title: "Book Your State Exam",
      description: "Book a time to write the exam",
      status: "Completed", is_completed: true,
      deadline_date: "2024-01-26", completed_date: "2024-01-25",
      timeline_guidance: "10 mins",
      instructions: [
        "Create an account at pearsonvue.com/tx/insurance",
        "On the right side, click Create an account",
        "Fill in your information and submit",
        "Register for a test and schedule your examination",
        "Pick exam: General Lines Life, Accident & Health: INS-TX-LAH05"
      ],
      resources: "Your ID and credit card - pearsonvue.com/tx/insurance"
    },
    {
      id: "lic_6", step_number: 6,
      step_title: "Complete Your State Exam",
      description: "Write your state exam",
      status: "Due Soon", is_completed: false,
      deadline_date: "2024-02-10",
      timeline_guidance: "Exam 2HRS: 150 Questions, Min. Score: 70%",
      instructions: [
        "Go to test centre and write exam",
        "Bring your ID"
      ],
      resources: "Refer to your confirmation email for test centre location"
    },
    {
      id: "lic_7", step_number: 7,
      step_title: "Complete Your Fingerprints",
      description: "Do your state fingerprint check",
      status: "Due Soon", is_completed: false,
      deadline_date: "2024-02-15",
      timeline_guidance: "10 mins",
      instructions: ["Go to fingerprint centre and have your fingerprints taken"],
      resources: "https://www.identogo.com/locations/texas"
    },
    {
      id: "lic_8", step_number: 8,
      step_title: "Create Account With Sircon",
      description: "Create account with Sircon to apply for license",
      status: "On Track", is_completed: false,
      deadline_date: "2024-02-16",
      timeline_guidance: "10 mins",
      instructions: ["Create username and password"],
      resources: "sircon.com"
    },
    {
      id: "lic_9", step_number: 9,
      step_title: "Apply For Your State License",
      description: "Apply to get license",
      status: "On Track", is_completed: false,
      deadline_date: "2024-02-17",
      timeline_guidance: "30 mins",
      instructions: [
        "Go to Sircon.com \u2192 New Insurance \u2192 Resident \u2192 Individual",
        "Enter your email \u2192 enter your last name \u2192 SSN \u2192 preparer then click applicant",
        "Select Texas \u2192 payment method",
        "License type \u2192 Insurance Producer \u2192 Life, Accident & Health",
        "Continue to answer the questions",
        "Pay the application fee"
      ],
      resources: "sircon.com"
    },
    {
      id: "lic_10", step_number: 10,
      step_title: "Sign Your WFG Agent Agreement",
      description: "Complete the official WFG Agent Agreement",
      status: "On Track", is_completed: false,
      deadline_date: "2024-02-20",
      timeline_guidance: "10 mins",
      instructions: [
        "Go to wfglaunch.com \u2192 Click LICENSING (BLUE COLUMN)",
        "View process \u2192 start licensing process \u2192 view WFG Agreement",
        "Start Application process \u2192 ok",
        "Enter state life license number \u2192 verify",
        "Docusign Pay fee $40",
        "Wait for SMD approval and background check"
      ],
      resources: "Your trainer - wfglaunch.com"
    },
    {
      id: "lic_11", step_number: 11,
      step_title: "Complete Your Anti-Money Laundering and Long Term Care Test",
      description: "Do the AML and LTC tests",
      status: "On Track", is_completed: false,
      deadline_date: "2024-02-25",
      timeline_guidance: "10 hours",
      instructions: [
        "Go to mywfg.com",
        "Click Menu",
        "Go to Licensing & Appointments",
        "Select Licensing, then Continuing Education",
        "Pick your provider"
      ],
      resources: "mywfg.com"
    },
    {
      id: "lic_12", step_number: 12,
      step_title: "Get Appointed By Carriers",
      description: "Be appointed by carriers to sell their products",
      status: "On Track", is_completed: false,
      deadline_date: "2024-03-01",
      timeline_guidance: "20 mins",
      instructions: [
        "Log into www.mywfg.com",
        "Click on Menu \u2192 Licensing & Appointments \u2192 Appointments",
        "Carrier Appointments \u2192 Life & Disability \u2192 Non-NY life",
        "Select the specific carrier you want to be appointed"
      ],
      resources: "www.mywfg.com"
    }
  ],
  training_steps: [
    {
      id: "train_1", step_number: 1,
      step_title: "Meet Spouse/Influential Person",
      description: "In home meeting, campaign introduction",
      status: "Completed", is_completed: true,
      deadline_date: "2024-01-16", completed_date: "2024-01-16",
      timeline_guidance: "24-48 hours",
      instructions: [
        "Learn how to introduce your trainer",
        "Learn how to tell your story",
        "Take notes on how to do the campaign introduction"
      ],
      resources: "Campaign introduction, notebook, uniform, survey card"
    },
    {
      id: "train_2", step_number: 2,
      step_title: "Get Your Startup Kit",
      description: "Go through all materials in the startup kit",
      status: "Completed", is_completed: true,
      deadline_date: "2024-01-18", completed_date: "2024-01-17",
      timeline_guidance: "1 day",
      instructions: [
        "Trainer to go through and explain all the materials",
        "Read Moment of Truth",
        "Read Saving Your Future book",
        "Read first 100 pages of the System Builder"
      ],
      resources: "Your trainer, startup kit"
    },
    {
      id: "train_3", step_number: 3,
      step_title: "Start Your Licensing Path",
      description: "Start pre-licensing",
      status: "Due Soon", is_completed: false,
      deadline_date: "2024-01-30",
      timeline_guidance: "Set up in first meeting, licensing 30 days",
      instructions: [
        "Start the pre-licensing journey",
        "Set up a gmail account (e.g. firstnamelastinitiawfg@gmail.com)",
        "Set up WSB account with new gmail address"
      ],
      resources: "Pre-licensing material, worldsystembuilder.com, gmail.com"
    },
    {
      id: "train_4", step_number: 4,
      step_title: "Complete Your PFS",
      description: "Go through your own personal financial strategy",
      status: "Due Soon", is_completed: false,
      deadline_date: "2024-02-05",
      timeline_guidance: "24-48 hours",
      instructions: [
        "Meeting with your trainer",
        "Go through client appointment 1, 2 and 3"
      ],
      resources: "Your trainer, PFS sheet, blue flip chart, accounts in Canada/3 circle 3 box (USA), Saving Your Future book, diversification and DCA"
    },
    {
      id: "train_5", step_number: 5,
      step_title: "Attend All Workshops and BPM",
      description: "Attend all 6 workshops",
      status: "On Track", is_completed: false,
      deadline_date: "2024-02-15",
      timeline_guidance: "30 days",
      instructions: [
        "Attend BPM on Tuesday/Wednesday nights and Saturday mornings",
        "Attend Webinar Tuesday morning",
        "Attend workshops throughout the week"
      ],
      resources: "Your trainer, worldsystembuilder.com/workshop, worldsystembuilder.com/meetings"
    },
    {
      id: "train_6", step_number: 6,
      step_title: "Complete Your Trainer Guidebook and Your Share List",
      description: "Go through top 5 reasons, vision & mission, daily activities and actions",
      status: "On Track", is_completed: false,
      deadline_date: "2024-02-20",
      timeline_guidance: "30 days",
      instructions: ["Work with your trainer to build a share list"],
      resources: "Trainer Guidebook, your trainer, trainer manual"
    },
    {
      id: "train_7", step_number: 7,
      step_title: "Complete Your Field Training",
      description: "Go out to the field and book appointments",
      status: "On Track", is_completed: false,
      deadline_date: "2024-03-01",
      timeline_guidance: "30 days",
      instructions: [
        "Go through share list with trainer",
        "Book campaign introductions and/or client appointment 1"
      ],
      resources: "Trainer Guidebook, your trainer"
    },
    {
      id: "train_8", step_number: 8,
      step_title: "Complete Your GX 315",
      description: "Complete 3 recruits and 15,000 points",
      status: "On Track", is_completed: false,
      deadline_date: "2024-03-15",
      timeline_guidance: "30 days",
      instructions: [
        "Go through 30 contacts",
        "Complete 10 campaign introductions/client appointments"
      ],
      resources: "Your trainer, trainer guidebook"
    }
  ]
};

const WFGOnboardingApp = ({ token, isAdmin }) => {
  if (isAdmin) return <AdminDashboard token={token} />;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recruitData, setRecruitData] = useState(null);
  const [activeTab, setActiveTab] = useState('licensing');
  const [expandedSteps, setExpandedSteps] = useState({});
  const [processingSteps, setProcessingSteps] = useState(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  // In dev/demo mode (no token), use mock data immediately
  const isDemoMode = !token;

  useEffect(() => { fetchRecruitData(); }, []);

  const fetchRecruitData = async () => {
    if (isDemoMode) {
      setRecruitData(MOCK_DATA);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(
        `${CONFIG.n8nBaseUrl}${CONFIG.webhooks.getData}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }), signal: controller.signal }
      );
      clearTimeout(timeout);
      if (response.status >= 500) throw new Error('server_error');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      let data;
      try { data = await response.json(); } catch { throw new Error('bad_response'); }
      if (!data.success) throw new Error(data.error || 'Failed to fetch recruit data');
      if (!data.recruit || !data.licensing_steps) throw new Error('bad_response');
      setRecruitData(normalizeRecruitResponse(data));
    } catch (err) {
      console.error('Error fetching recruit data:', err);
      if (err.name === 'AbortError') {
        setError('The request timed out. Please check your internet connection and try again.');
      } else if (err.message === 'server_error') {
        setError('The server encountered an error. Please try again in a few minutes.');
      } else if (err.message === 'bad_response') {
        setError('We received an unexpected response. Please try again or contact your trainer.');
      } else {
        setError('We couldn\u2019t find your onboarding record. Please check your link and try again, or contact your trainer for a new one.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStepComplete = async (stepId, stepType, currentStatus) => {
    if (processingSteps.has(stepId)) return;
    const newStatus = !currentStatus;
    setProcessingSteps(prev => new Set([...prev, stepId]));
    try {
      const response = await fetch(
        `${CONFIG.n8nBaseUrl}${CONFIG.webhooks.updateStep}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            recruit_id: recruitData.recruit.id, step_record_id: stepId,
            step_type: stepType, is_completed: newStatus,
            user_email: recruitData.recruit.email, user_name: recruitData.recruit.full_name
          })
        }
      );
      if (!response.ok) throw new Error('Failed to update step');
      await fetchRecruitData();
    } catch (err) {
      console.error('Error updating step:', err);
      alert('Failed to update step. Please try again.');
    } finally {
      setProcessingSteps(prev => { const next = new Set(prev); next.delete(stepId); return next; });
    }
  };

  const toggleStepExpanded = (stepId) => {
    setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  // --- Circular Progress Ring ---
  const ProgressRing = ({ percentage, size = 80, strokeWidth = 6, color = '#3b82f6' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    );
  };

  // --- Status Badge ---
  const StatusBadge = ({ status, size = 'default' }) => {
    const config = {
      'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
      'Overdue': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', ring: 'ring-red-500/20' },
      'Due Soon': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
      'On Track': { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', ring: 'ring-sky-500/20' }
    };
    const s = config[status] || config['On Track'];
    const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ring-1 ${sizeClasses} ${s.bg} ${s.text} ${s.ring}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        {status}
      </span>
    );
  };

  // --- Step Card ---
  const StepCard = ({ step, stepType, index }) => {
    const isExpanded = expandedSteps[step.id];
    const isProcessing = processingSteps.has(step.id);
    const instructions = Array.isArray(step.instructions)
      ? step.instructions
      : (typeof step.instructions === 'string' ? step.instructions.split('\n').filter(i => i.trim()) : []);

    const isLicensing = stepType === 'licensing';
    const hasDetails = instructions.length > 0 || step.resources;

    // Find the next uncompleted step to highlight it
    const allSteps = stepType === 'licensing' ? recruitData.licensing_steps : recruitData.training_steps;
    const firstIncompleteIdx = allSteps.findIndex(s => !s.is_completed);
    const isNextStep = !step.is_completed && index === firstIncompleteIdx;

    // --- Compact row for incomplete, non-expanded steps ---
    if (!step.is_completed && !isExpanded) {
      return (
        <div
          className={`group relative rounded-xl transition-all duration-300 overflow-hidden cursor-pointer ${
            isNextStep
              ? 'glass-card-elevated ring-2 ring-offset-1 ' + (isLicensing ? 'ring-blue-500/30' : 'ring-violet-500/30')
              : 'bg-white border border-slate-200/80 hover:border-slate-300'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => hasDetails && toggleStepExpanded(step.id)}
        >
          {isNextStep && (
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${isLicensing ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-violet-500 to-violet-400'}`} />
          )}
          <div className="px-4 py-3 sm:px-5 flex items-center gap-3">
            {/* Checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleStepComplete(step.id, stepType, step.is_completed); }}
              disabled={isProcessing}
              className="flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              {isNextStep ? (
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                  isLicensing ? 'border-blue-400 bg-blue-50' : 'border-violet-400 bg-violet-50'
                }`}>
                  <Circle className={`w-3.5 h-3.5 ${isLicensing ? 'text-blue-300' : 'text-violet-300'}`} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-slate-200 group-hover:border-slate-300 flex items-center justify-center bg-white">
                  <Circle className="w-3.5 h-3.5 text-transparent" />
                </div>
              )}
            </button>

            {/* Pathway dot (all view) + Step number + title */}
            {activeTab === 'all' && (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isLicensing ? 'bg-blue-500' : 'bg-violet-500'}`} />
            )}
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold flex-shrink-0 ${
              isLicensing ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
            }`}>
              {step.step_number}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 truncate flex-1">
              {step.step_title}
            </h3>

            {/* Right side: due date + status + chevron */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {step.deadline_date && (
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Due {new Date(step.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              <StatusBadge status={step.status} size="sm" />
              {hasDetails && (
                <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
              )}
            </div>
          </div>
        </div>
      );
    }

    // --- Full card for completed steps or expanded incomplete steps ---
    return (
      <div
        className={`group relative rounded-2xl transition-all duration-300 overflow-hidden ${
          step.is_completed
            ? 'bg-slate-50/50 border border-slate-200/60'
            : isNextStep
              ? 'glass-card-elevated ring-2 ring-offset-2 ' + (isLicensing ? 'ring-blue-500/30' : 'ring-violet-500/30')
              : 'bg-white border border-slate-200/80'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isNextStep && (
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${isLicensing ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-violet-500 to-violet-400'}`} />
        )}

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={() => toggleStepComplete(step.id, stepType, step.is_completed)}
              disabled={isProcessing}
              className="flex-shrink-0 mt-0.5 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              {step.is_completed ? (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/25">
                  <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              ) : isNextStep ? (
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isLicensing ? 'border-blue-400 bg-blue-50' : 'border-violet-400 bg-violet-50'
                }`}>
                  <Circle className={`w-4 h-4 ${isLicensing ? 'text-blue-300' : 'text-violet-300'}`} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-slate-300 flex items-center justify-center transition-colors bg-white">
                  <Circle className="w-4 h-4 text-transparent" />
                </div>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className={`flex items-start justify-between gap-3 mb-1 ${!step.is_completed && isExpanded ? 'cursor-pointer' : ''}`}
                onClick={() => { if (!step.is_completed && isExpanded) toggleStepExpanded(step.id); }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold tracking-tight ${
                      step.is_completed
                        ? 'bg-slate-200 text-slate-500'
                        : isLicensing ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {step.step_number}
                    </span>
                    <h3 className={`text-[15px] font-semibold leading-snug ${
                      step.is_completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'
                    }`}>
                      {step.step_title}
                    </h3>
                  </div>
                  <p className={`text-sm leading-relaxed ml-[34px] ${step.is_completed ? 'text-slate-400' : 'text-slate-500'}`}>
                    {step.description}
                  </p>
                </div>
                <div className="flex-shrink-0 mt-0.5 flex items-center gap-2">
                  <StatusBadge status={step.status} size="sm" />
                  {!step.is_completed && isExpanded && (
                    <ChevronUp className="w-4 h-4 text-slate-300 hover:text-slate-400 transition-colors" />
                  )}
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 ml-[34px]">
                {step.deadline_date && !step.is_completed && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due {new Date(step.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
                {step.timeline_guidance && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{step.timeline_guidance}</span>
                  </div>
                )}
                {step.completed_date && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Completed {new Date(step.completed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Expanded content (for incomplete expanded steps) */}
          {!step.is_completed && isExpanded && (
            <div className="mt-5 ml-12 animate-fadeIn">
              <div className={`rounded-xl p-5 ${isLicensing ? 'bg-blue-50/50 border border-blue-100/80' : 'bg-violet-50/50 border border-violet-100/80'}`}>
                {instructions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Instructions
                    </h4>
                    <ol className="space-y-2.5">
                      {instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                          <span className={`flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5 ${
                            isLicensing ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {step.resources && (
                  <div className={instructions.length > 0 ? 'mt-4 pt-4 border-t border-dashed ' + (isLicensing ? 'border-blue-200/60' : 'border-violet-200/60') : ''}>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      Resources
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.resources}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Loading State (Skeleton) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white/80 border-b border-slate-200/60 h-16" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 h-28 animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-[72px] h-[72px] bg-slate-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-16 bg-slate-100 rounded" />
                    <div className="h-6 w-12 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !recruitData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Link not recognized</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {error || 'Something went wrong loading your data.'}
          </p>
          <button
            onClick={() => { setError(null); fetchRecruitData(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { recruit, progress, licensing_steps, training_steps } = recruitData;
  const totalCompleted = progress.licensing.completed + progress.training.completed;
  const totalSteps = progress.licensing.total + progress.training.total;
  const overallPercentage = Math.round((totalCompleted / totalSteps) * 100);

  // Build the step list based on active tab
  const getActiveSteps = () => {
    if (activeTab === 'licensing') return licensing_steps;
    if (activeTab === 'training') return training_steps;
    // 'all' tab: merge both, sorted by due date
    return [
      ...licensing_steps.map(s => ({ ...s, _pathway: 'licensing' })),
      ...training_steps.map(s => ({ ...s, _pathway: 'training' })),
    ].sort((a, b) => {
      const dateA = a.deadline_date ? new Date(a.deadline_date) : new Date('9999-12-31');
      const dateB = b.deadline_date ? new Date(b.deadline_date) : new Date('9999-12-31');
      return dateA - dateB;
    });
  };
  const activeSteps = getActiveSteps();
  const activeProgress = activeTab === 'licensing' ? progress.licensing
    : activeTab === 'training' ? progress.training
    : { total: totalSteps, completed: totalCompleted, percentage: overallPercentage };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HEADER ===== */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">WFG Onboarding</h1>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Agent Progress Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{recruit.full_name}</p>
                <p className="text-[11px] text-slate-400 mt-1">{recruit.upline_office}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-blue-500/25 ring-2 ring-white">
                {recruit.full_name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ===== HERO SECTION ===== */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Welcome back</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {recruit.full_name.split(' ')[0]}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <StatusBadge status={recruit.timeline_health} />
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(recruit.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {recruit.recruit_stage}
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {recruit.state_province}
                </span>
                <span className="text-slate-200">|</span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {recruit.recruiter_name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== PROGRESS OVERVIEW CARDS (clickable navigation) ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Overall Progress */}
          <button
            onClick={() => setActiveTab('all')}
            className={`glass-card-elevated rounded-2xl p-6 flex items-center gap-5 text-left transition-all duration-200 cursor-pointer ${
              activeTab === 'all' ? 'ring-2 ring-slate-900/20 ring-offset-1' : 'hover:ring-1 hover:ring-slate-300'
            }`}
          >
            <div className="relative flex-shrink-0">
              <ProgressRing percentage={overallPercentage} size={72} strokeWidth={5} color="#0f172a" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold text-slate-900">{overallPercentage}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Overall</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{totalCompleted}/{totalSteps}</p>
              <p className="text-xs text-slate-400 mt-1">steps completed</p>
            </div>
          </button>

          {/* Licensing Progress */}
          <button
            onClick={() => setActiveTab('licensing')}
            className={`glass-card-elevated rounded-2xl p-6 flex items-center gap-5 text-left transition-all duration-200 cursor-pointer ${
              activeTab === 'licensing' ? 'ring-2 ring-blue-500/30 ring-offset-1' : 'hover:ring-1 hover:ring-slate-300'
            }`}
          >
            <div className="relative flex-shrink-0">
              <ProgressRing percentage={progress.licensing.percentage} size={72} strokeWidth={5} color="#3b82f6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Licensing</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{progress.licensing.completed}/{progress.licensing.total}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress.licensing.percentage}%` }} />
                </div>
                <span className="text-[10px] font-bold text-blue-600">{progress.licensing.percentage}%</span>
              </div>
            </div>
          </button>

          {/* Training Progress */}
          <button
            onClick={() => setActiveTab('training')}
            className={`glass-card-elevated rounded-2xl p-6 flex items-center gap-5 text-left transition-all duration-200 cursor-pointer ${
              activeTab === 'training' ? 'ring-2 ring-violet-500/30 ring-offset-1' : 'hover:ring-1 hover:ring-slate-300'
            }`}
          >
            <div className="relative flex-shrink-0">
              <ProgressRing percentage={progress.training.percentage} size={72} strokeWidth={5} color="#8b5cf6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Training</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{progress.training.completed}/{progress.training.total}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-16 bg-slate-100 rounded-full h-1.5">
                  <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${progress.training.percentage}%` }} />
                </div>
                <span className="text-[10px] font-bold text-violet-600">{progress.training.percentage}%</span>
              </div>
            </div>
          </button>
        </div>

        {/* ===== MILESTONE BANNER ===== */}
        {(recruit.licensing_status === 'Licensed' || recruit.training_status === 'Completed') && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 p-6 mb-8" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="flex items-center gap-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center flex-shrink-0 shadow-sm">
                <Award className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">Milestone Achieved!</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recruit.licensing_status === 'Licensed' && (
                    <span className="px-3 py-1 bg-white/70 backdrop-blur text-amber-800 rounded-full text-xs font-bold shadow-sm">
                      Fully Licensed
                    </span>
                  )}
                  {recruit.training_status === 'Completed' && (
                    <span className="px-3 py-1 bg-white/70 backdrop-blur text-amber-800 rounded-full text-xs font-bold shadow-sm">
                      Training Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEPS LIST ===== */}
        <div className="glass-card-elevated rounded-2xl overflow-hidden">
          {/* Content Header */}
          <div className="px-5 sm:px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeTab === 'all' ? 'All' : activeTab === 'licensing' ? 'Licensing' : 'Training'} Steps
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  {activeProgress.completed} of {activeProgress.total} completed
                </p>
              </div>
              {activeTab === 'all' && (
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Licensing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    Training
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Steps List - Active (incomplete) */}
          <div className="px-4 sm:px-5 pb-5 space-y-3">
            {(() => {
              const incompleteSteps = activeSteps.filter(s => !s.is_completed);
              const completedSteps = activeSteps.filter(s => s.is_completed);

              // Determine the stepType for a given step
              const getStepType = (step) => {
                if (activeTab === 'all') return step._pathway;
                return activeTab;
              };

              return (
                <>
                  {incompleteSteps.length > 0 ? (
                    incompleteSteps.map((step) => {
                      const stepType = getStepType(step);
                      // For 'all' view, look up index from the original array
                      const sourceSteps = stepType === 'licensing' ? licensing_steps : training_steps;
                      const origIndex = sourceSteps.findIndex(s => s.id === step.id);
                      return (
                        <StepCard key={step.id} step={step} stepType={stepType} index={origIndex} />
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-300" />
                      <p className="text-sm font-semibold text-slate-500">All steps completed!</p>
                      <p className="text-xs text-slate-400 mt-1">Great work on this pathway.</p>
                    </div>
                  )}

                  {/* Completed Steps - Collapsible */}
                  {completedSteps.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="w-full flex items-center gap-3 py-3 px-1 group"
                      >
                        <div className="flex-1 h-px bg-slate-200" />
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-slate-500 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{completedSteps.length} completed</span>
                          {showCompleted ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 h-px bg-slate-200" />
                      </button>

                      {showCompleted && (
                        <div className="space-y-2 animate-fadeIn">
                          {completedSteps.map((step) => {
                            const stepType = getStepType(step);
                            const sourceSteps = stepType === 'licensing' ? licensing_steps : training_steps;
                            const origIndex = sourceSteps.findIndex(s => s.id === step.id);
                            return (
                              <StepCard key={step.id} step={step} stepType={stepType} index={origIndex} />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="mt-10 pb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <span>Questions? Contact</span>
            <span className="font-semibold text-slate-500">{recruit.recruiter_name}</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-500">{recruit.email}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WFGOnboardingApp;
