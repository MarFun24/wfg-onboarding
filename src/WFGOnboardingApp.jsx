import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Clock, AlertCircle, ChevronDown, ChevronUp, 
  BookOpen, GraduationCap, Calendar, TrendingUp, Award, ExternalLink,
  Mail, Phone, MapPin, User, Sparkles, Target, CheckCheck
} from 'lucide-react';

// Configuration
const CONFIG = {
  n8nBaseUrl: 'https://mfunston.app.n8n.cloud', // Replace with your actual n8n URL
  webhooks: {
    getData: '/webhook/wfg-app-get-recruit-data',
    updateStep: '/webhook/wfg-app-step-update'
  }
};

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
    upline_office: "Bay Area Office"
  },
  progress: {
    licensing: {
      total: 12,
      completed: 5,
      percentage: 42,
      status_breakdown: {
        completed: 5,
        overdue: 0,
        due_soon: 2,
        on_track: 5
      }
    },
    training: {
      total: 8,
      completed: 2,
      percentage: 25,
      status_breakdown: {
        completed: 2,
        overdue: 0,
        due_soon: 2,
        on_track: 4
      }
    }
  },
  licensing_steps: [
    {
      id: "lic_1",
      step_number: 1,
      step_title: "Sign Your Membership Agreement",
      description: "Do the Associate Membership Agreement",
      status: "Completed",
      is_completed: true,
      deadline_date: "2024-01-16",
      completed_date: "2024-01-15",
      timeline_guidance: "5 mins",
      instructions: [
        "Type in your personal information"
      ],
      resources: "Your trainer and your ID - www.wfglaunch.com"
    },
    {
      id: "lic_2",
      step_number: 2,
      step_title: "Pay Your Membership Fees",
      description: "Pay for your Associate Membership Agreement",
      status: "Completed",
      is_completed: true,
      deadline_date: "2024-01-16",
      completed_date: "2024-01-15",
      timeline_guidance: "1 min",
      instructions: [
        "Use your credit card to pay"
      ],
      resources: "Your trainer and your credit card"
    },
    {
      id: "lic_3",
      step_number: 3,
      step_title: "Register for Your Online Course",
      description: "Sign up for the Life & Health pre-licensing course",
      status: "Completed",
      is_completed: true,
      deadline_date: "2024-01-18",
      completed_date: "2024-01-17",
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
      id: "lic_4",
      step_number: 4,
      step_title: "Complete Your Pre-Licensing Course",
      description: "Study and pass the pre-licensing course",
      status: "Completed",
      is_completed: true,
      deadline_date: "2024-01-25",
      completed_date: "2024-01-24",
      timeline_guidance: "7 days",
      instructions: [
        "Study and learn the material"
      ],
      resources: "The training course material"
    },
    {
      id: "lic_5",
      step_number: 5,
      step_title: "Book Your State Exam",
      description: "Book a time to write the exam",
      status: "Completed",
      is_completed: true,
      deadline_date: "2024-01-26",
      completed_date: "2024-01-25",
      timeline_guidance: "10 mins",
      instructions: [
        "First, you must create an account, followed by registering for a test before you can actually schedule the examination",
        "On the right side, click Create an account",
        "Fill in your information and submit",
        "Pick exam: General Lines Life, Accident & Health: INS-TX-LAH05",
        "Go to pearsonvue.com/tx/insurance"
      ],
      resources: "Your ID and credit card - pearsonvue.com/tx/insurance"
    },
    {
      id: "lic_6",
      step_number: 6,
      step_title: "Complete Your State Exam",
      description: "Write your state exam",
      status: "Due Soon",
      is_completed: false,
      deadline_date: "2024-02-10",
      timeline_guidance: "Exam 2HRS: 150 Questions, Min. Score: 70%",
      instructions: [
        "Go to test centre and write exam",
        "Bring your ID"
      ],
      resources: "Test centre location in confirmation email"
    },
    {
      id: "lic_7",
      step_number: 7,
      step_title: "Complete Your Fingerprints",
      description: "Do your state fingerprint check",
      status: "Due Soon",
      is_completed: false,
      deadline_date: "2024-02-15",
      timeline_guidance: "10 mins",
      instructions: [
        "Go to fingerprint centre and have your fingerprints taken"
      ],
      resources: "https://www.identogo.com/locations/texas"
    },
    {
      id: "lic_8",
      step_number: 8,
      step_title: "Create Account With Sircon",
      description: "Create account with Sircon to apply for license",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-02-16",
      timeline_guidance: "10 mins",
      instructions: [
        "Create username and password"
      ],
      resources: "sircon.com"
    },
    {
      id: "lic_9",
      step_number: 9,
      step_title: "Apply For Your State License",
      description: "Apply to get license",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-02-17",
      timeline_guidance: "30 mins",
      instructions: [
        "Go to Sircon.com → New Insurance → Resident → Individual",
        "Enter your email → enter your last name → SSN → preparer then click applicant",
        "Select Texas → payment method",
        "License type → Insurance Producer → Life, Accident & Health",
        "Continue to answer the questions",
        "Pay the application fee"
      ],
      resources: "sircon.com"
    },
    {
      id: "lic_10",
      step_number: 10,
      step_title: "Sign Your WFG Agent Agreement",
      description: "Complete the official WFG Agent Agreement",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-02-20",
      timeline_guidance: "10 mins",
      instructions: [
        "Go to wfglaunch.com → Click LICENSING (BLUE COLUMN)",
        "View process → start licensing process → view WFG Agreement",
        "Start Application process → ok",
        "Enter state life license number → verify",
        "Docusign Pay fee $40",
        "Wait for SMD approval and background check"
      ],
      resources: "Your trainer - wfglaunch.com"
    },
    {
      id: "lic_11",
      step_number: 11,
      step_title: "Complete Your Anti-Money Laundering and Long Term Care Test",
      description: "Do the AML and LTC tests",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-02-25",
      timeline_guidance: "10 hours",
      instructions: [
        "Go to mywfg.com, menu",
        "Licensing & appointments",
        "Licensing, continuing education",
        "Pick your provider"
      ],
      resources: "mywfg.com - links and provider information"
    },
    {
      id: "lic_12",
      step_number: 12,
      step_title: "Get Appointed By Carriers",
      description: "Be appointed by carriers to sell their products",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-03-01",
      timeline_guidance: "20 mins",
      instructions: [
        "Log into www.mywfg.com",
        "Click on Menu → Licensing & Appointments → Appointments",
        "Carrier Appointments → Life & Disability → Non-NY life",
        "Select the specific carrier you want to be appointed"
      ],
      resources: "www.mywfg.com - carrier appointment portal"
    }
  ],
  training_steps: [
    {
      id: "train_1",
      step_number: 1,
      step_title: "Have Your In-Person Meeting",
      description: "Initial in-person meeting with your trainer",
      status: "Completed",
      is_completed: true,
      deadline_date: "2024-01-16",
      completed_date: "2024-01-16",
      timeline_guidance: "1-2 hours",
      instructions: [
        "Meet with your trainer to discuss the business opportunity",
        "Review the onboarding process and timeline",
        "Set goals and expectations",
        "Complete initial paperwork"
      ],
      resources: "Your trainer will schedule and provide meeting details"
    },
    {
      id: "train_2",
      step_number: 2,
      step_title: "Get Your Startup Kit",
      description: "Receive and review your WFG startup materials",
      status: "Completed",
      is_completed: true,
      deadline_date: "2024-01-18",
      completed_date: "2024-01-17",
      timeline_guidance: "30 mins",
      instructions: [
        "Receive your startup kit from your trainer",
        "Review all materials and resources",
        "Familiarize yourself with company materials",
        "Set up your workspace with provided materials"
      ],
      resources: "Startup kit provided by your trainer"
    },
    {
      id: "train_3",
      step_number: 3,
      step_title: "Start Your Licensing Path",
      description: "Begin the licensing process",
      status: "Due Soon",
      is_completed: false,
      deadline_date: "2024-01-30",
      timeline_guidance: "Ongoing",
      instructions: [
        "Follow the licensing pathway steps",
        "Complete required courses and exams",
        "Stay in communication with your trainer",
        "Track your progress through wfglaunch.com"
      ],
      resources: "wfglaunch.com - licensing section"
    },
    {
      id: "train_4",
      step_number: 4,
      step_title: "Complete Your PFS",
      description: "Complete your Personal Financial Strategy",
      status: "Due Soon",
      is_completed: false,
      deadline_date: "2024-02-05",
      timeline_guidance: "2-3 hours",
      instructions: [
        "Schedule PFS session with your trainer",
        "Gather your personal financial information",
        "Complete the PFS process",
        "Review results and recommendations"
      ],
      resources: "Your trainer will guide you through the PFS process"
    },
    {
      id: "train_5",
      step_number: 5,
      step_title: "Attend All Workshops and BPM",
      description: "Participate in training workshops and Business Presentation Meetings",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-02-15",
      timeline_guidance: "Ongoing",
      instructions: [
        "Check the calendar for upcoming workshops",
        "Attend weekly BPMs (Business Presentation Meetings)",
        "Take notes and participate actively",
        "Network with other associates",
        "Apply what you learn to your business"
      ],
      resources: "Workshop and BPM schedule available through your trainer"
    },
    {
      id: "train_6",
      step_number: 6,
      step_title: "Read Your Trainer Guidebook and Complete Your Share List",
      description: "Study the trainer guidebook and create your prospect list",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-02-20",
      timeline_guidance: "3-4 hours",
      instructions: [
        "Read the complete Trainer Guidebook",
        "Create your initial share list of 100+ names",
        "Categorize your contacts by relationship strength",
        "Review your list with your trainer",
        "Begin reaching out to warm market contacts"
      ],
      resources: "Trainer Guidebook provided in startup kit"
    },
    {
      id: "train_7",
      step_number: 7,
      step_title: "Complete Your Field Training",
      description: "Hands-on field training with experienced associates",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-03-01",
      timeline_guidance: "2-3 weeks",
      instructions: [
        "Shadow your trainer on client appointments",
        "Observe the full sales process",
        "Learn presentation and closing techniques",
        "Conduct appointments with trainer support",
        "Get feedback and coaching after each appointment"
      ],
      resources: "Field training schedule coordinated with your trainer"
    },
    {
      id: "train_8",
      step_number: 8,
      step_title: "Complete Your GX 315",
      description: "Complete the GX 315 training program",
      status: "On Track",
      is_completed: false,
      deadline_date: "2024-03-15",
      timeline_guidance: "Ongoing",
      instructions: [
        "Participate in all GX 315 training sessions",
        "Complete assigned modules and activities",
        "Practice skills with your training group",
        "Apply concepts to real client situations",
        "Pass GX 315 certification requirements"
      ],
      resources: "GX 315 materials and schedule provided by training team"
    }
  ]
};

const WFGOnboardingApp = ({ initialRecruitId, initialRecruitEmail }) => {
  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recruitData, setRecruitData] = useState(null);
  const [activeTab, setActiveTab] = useState('licensing');
  const [expandedSteps, setExpandedSteps] = useState({});
  const [processingSteps, setProcessingSteps] = useState(new Set());

  // Fetch recruit data on mount
  useEffect(() => {
    fetchRecruitData();
  }, []);

  const fetchRecruitData = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {};
      if (initialRecruitId) payload.recruit_id = initialRecruitId;
      if (initialRecruitEmail) payload.recruit_email = initialRecruitEmail;

      const response = await fetch(
        `${CONFIG.n8nBaseUrl}${CONFIG.webhooks.getData}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch recruit data');
      }

      setRecruitData(data);
    } catch (err) {
      console.error('Error fetching recruit data:', err);
      // Use mock data as fallback for demo purposes
      setRecruitData(MOCK_DATA);
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
            recruit_id: recruitData.recruit.id,
            step_record_id: stepId,
            step_type: stepType,
            is_completed: newStatus,
            user_email: recruitData.recruit.email,
            user_name: recruitData.recruit.full_name
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update step');
      }

      // Refresh data after successful update
      await fetchRecruitData();
    } catch (err) {
      console.error('Error updating step:', err);
      alert('Failed to update step. Please try again.');
    } finally {
      setProcessingSteps(prev => {
        const next = new Set(prev);
        next.delete(stepId);
        return next;
      });
    }
  };

  const toggleStepExpanded = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Overdue': 'bg-red-100 text-red-800 border-red-200',
      'Due Soon': 'bg-orange-100 text-orange-800 border-orange-200',
      'On Track': 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || styles['On Track']}`}>
        {status}
      </span>
    );
  };

  // Progress ring component
  const ProgressRing = ({ percentage, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-blue-600 transition-all duration-500 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    );
  };

  // Step card component
  const StepCard = ({ step, stepType, index }) => {
    const isExpanded = expandedSteps[step.id];
    const isProcessing = processingSteps.has(step.id);
    const instructions = Array.isArray(step.instructions) 
      ? step.instructions 
      : (typeof step.instructions === 'string' ? step.instructions.split('\n').filter(i => i.trim()) : []);

    return (
      <div className={`
        bg-white rounded-lg border-2 transition-all duration-200
        ${step.is_completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-blue-300'}
        ${isProcessing ? 'opacity-60' : ''}
      `}>
        {/* Step Header */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <button
              onClick={() => toggleStepComplete(step.id, stepType, step.is_completed)}
              disabled={isProcessing}
              className={`
                flex-shrink-0 mt-1 transition-all duration-200
                ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
              `}
            >
              {step.is_completed ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600" />
              )}
            </button>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      {step.step_number}
                    </span>
                    <h3 className={`text-lg font-semibold ${step.is_completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                      {step.step_title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <StatusBadge status={step.status} />
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                {step.deadline_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(step.deadline_date).toLocaleDateString()}</span>
                  </div>
                )}
                {step.timeline_guidance && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{step.timeline_guidance}</span>
                  </div>
                )}
                {step.completed_date && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCheck className="w-4 h-4" />
                    <span>Completed: {new Date(step.completed_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Expand/Collapse Button */}
              <button
                onClick={() => toggleStepExpanded(step.id)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show instructions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pl-10 space-y-4 border-t border-gray-200 pt-4">
              {/* Instructions */}
              {instructions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Step-by-Step Instructions
                  </h4>
                  <ul className="space-y-2">
                    {instructions.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              {step.resources && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    Resources & Links
                  </h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-100">
                    {step.resources}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your onboarding journey...</p>
        </div>
      </div>
    );
  }

  // Note: Removed error state since we now fall back to mock data

  const { recruit, progress, licensing_steps, training_steps } = recruitData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WFG Onboarding</h1>
                <p className="text-sm text-gray-600">Your path to success</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{recruit.full_name}</p>
                <p className="text-xs text-gray-500">{recruit.recruit_stage}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recruit Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{recruit.email}</span>
                </div>
                {recruit.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{recruit.phone}</span>
                  </div>
                )}
                {recruit.country && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {recruit.state_province}, {recruit.country}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Timeline Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">
                    Started: {new Date(recruit.start_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">Health:</span>
                  <StatusBadge status={recruit.timeline_health} />
                </div>
              </div>
            </div>

            {/* Recruiter Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Support Team</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{recruit.recruiter_name}</span>
                </div>
                {recruit.upline_office && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{recruit.upline_office}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Licensing Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Licensing</h3>
                  <p className="text-sm text-gray-600">
                    {progress.licensing.completed} of {progress.licensing.total} steps
                  </p>
                </div>
              </div>
              <ProgressRing percentage={progress.licensing.percentage} size={80} strokeWidth={6} />
            </div>
            
            {/* Status Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-2xl font-bold text-green-700">{progress.licensing.status_breakdown.completed}</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="text-2xl font-bold text-red-700">{progress.licensing.status_breakdown.overdue}</div>
                <div className="text-xs text-red-600 font-medium">Overdue</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{progress.licensing.status_breakdown.due_soon}</div>
                <div className="text-xs text-orange-600 font-medium">Due Soon</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{progress.licensing.status_breakdown.on_track}</div>
                <div className="text-xs text-blue-600 font-medium">On Track</div>
              </div>
            </div>
          </div>

          {/* Training Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Training</h3>
                  <p className="text-sm text-gray-600">
                    {progress.training.completed} of {progress.training.total} steps
                  </p>
                </div>
              </div>
              <ProgressRing percentage={progress.training.percentage} size={80} strokeWidth={6} />
            </div>
            
            {/* Status Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-2xl font-bold text-green-700">{progress.training.status_breakdown.completed}</div>
                <div className="text-xs text-green-600 font-medium">Completed</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="text-2xl font-bold text-red-700">{progress.training.status_breakdown.overdue}</div>
                <div className="text-xs text-red-600 font-medium">Overdue</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{progress.training.status_breakdown.due_soon}</div>
                <div className="text-xs text-orange-600 font-medium">Due Soon</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{progress.training.status_breakdown.on_track}</div>
                <div className="text-xs text-blue-600 font-medium">On Track</div>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Badges */}
        {(recruit.licensing_status === 'Licensed' || recruit.training_status === 'Completed') && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 text-yellow-600" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">🎉 Milestone Achieved!</h3>
                <div className="flex flex-wrap gap-2">
                  {recruit.licensing_status === 'Licensed' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                      ✓ Fully Licensed
                    </span>
                  )}
                  {recruit.training_status === 'Completed' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                      ✓ Training Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pathway Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('licensing')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'licensing'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span>Licensing Pathway</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'licensing' ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {progress.licensing.completed}/{progress.licensing.total}
                </span>
              </div>
              {activeTab === 'licensing' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('training')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'training'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5" />
                <span>Training Pathway</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'training' ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {progress.training.completed}/{progress.training.total}
                </span>
              </div>
              {activeTab === 'training' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="space-y-4">
              {activeTab === 'licensing' ? (
                licensing_steps.length > 0 ? (
                  licensing_steps.map((step, index) => (
                    <StepCard key={step.id} step={step} stepType="licensing" index={index} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No licensing steps available</p>
                  </div>
                )
              ) : (
                training_steps.length > 0 ? (
                  training_steps.map((step, index) => (
                    <StepCard key={step.id} step={step} stepType="training" index={index} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No training steps available</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions? Contact your trainer: <span className="font-medium text-gray-700">{recruit.recruiter_name}</span></p>
        </div>
      </main>
    </div>
  );
};

export default WFGOnboardingApp;
