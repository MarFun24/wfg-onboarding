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
      setError(err.message);
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-t-4 border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Unable to Load Data</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchRecruitData}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
