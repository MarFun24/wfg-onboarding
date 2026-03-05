import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Clock, ChevronDown, ChevronUp,
  BookOpen, GraduationCap, Calendar, Award, ExternalLink,
  Mail, Phone, MapPin, User, Target, CheckCheck, Shield,
  ArrowRight, Zap, Star, TrendingUp, Briefcase, Lock
} from 'lucide-react';
import AdminDashboard from './AdminDashboard.jsx';
import { getLicensingSteps, getTrainingSteps, mergeStepsWithCompletion } from './stepDefinitions';

// Auto-linkify: convert URLs and email addresses in text to clickable links
const Linkify = ({ children }) => {
  if (typeof children !== 'string') return children;
  // Match URLs (with or without protocol) and email addresses
  const urlRegex = /(https?:\/\/[^\s,)]+|www\.[^\s,)]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts = children.split(urlRegex);
  const matches = children.match(urlRegex) || [];
  if (matches.length === 0) return children;

  const result = [];
  parts.forEach((part, i) => {
    result.push(part);
    if (i < matches.length) {
      const match = matches[i];
      const isEmail = match.includes('@') && !match.startsWith('http');
      const href = isEmail ? `mailto:${match}` : (match.startsWith('http') ? match : `https://${match}`);
      result.push(
        <a key={i} href={href} target={isEmail ? undefined : '_blank'} rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800 break-all">
          {match}
        </a>
      );
    }
  });
  return <>{result}</>;
};

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

const WFGOnboardingApp = ({ token, isAdmin }) => {
  if (isAdmin) return <AdminDashboard token={token} />;
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(!token ? 'no_token' : null);
  const [recruitData, setRecruitData] = useState(null);
  const [activeTab, setActiveTab] = useState('licensing');
  const [expandedSteps, setExpandedSteps] = useState({});
  const [processingSteps, setProcessingSteps] = useState(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { stepId, stepType, currentStatus, stepTitle }

  useEffect(() => { if (token) fetchRecruitData(); }, []);

  const fetchRecruitData = async () => {
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
      if (!data.recruit) throw new Error('bad_response');

      const recruit = data.recruit;

      // Default country to 'canada' if missing (WFG is Vancouver-based)
      const country = recruit.country || 'canada';

      // Parse completion arrays from recruit record
      let completedLicensing = {};
      let completedTraining = {};
      try {
        const lcArr = JSON.parse(recruit.completed_licensing_steps || '[]');
        lcArr.forEach(id => { completedLicensing[id] = { is_completed: true }; });
      } catch(e) {}
      try {
        const trArr = JSON.parse(recruit.completed_training_steps || '[]');
        trArr.forEach(id => { completedTraining[id] = { is_completed: true }; });
      } catch(e) {}

      // Get step definitions and merge with completion data
      // Prefer local definitions; fall back to API data only during transition
      let licensingSteps, trainingSteps;
      if (!data.licensing_steps || data.licensing_steps.length === 0) {
        licensingSteps = mergeStepsWithCompletion(
          getLicensingSteps(country, recruit.start_date),
          completedLicensing
        );
      } else {
        licensingSteps = data.licensing_steps.map(normalizeStep);
      }
      if (!data.training_steps || data.training_steps.length === 0) {
        trainingSteps = mergeStepsWithCompletion(
          getTrainingSteps(recruit.start_date),
          completedTraining
        );
      } else {
        trainingSteps = data.training_steps.map(normalizeStep);
      }

      // Compute progress from the merged steps
      const licensingCompleted = licensingSteps.filter(s => s.is_completed).length;
      const trainingCompleted = trainingSteps.filter(s => s.is_completed).length;
      const progress = {
        licensing: {
          total: licensingSteps.length,
          completed: licensingCompleted,
          percentage: licensingSteps.length > 0 ? Math.round((licensingCompleted / licensingSteps.length) * 100) : 0
        },
        training: {
          total: trainingSteps.length,
          completed: trainingCompleted,
          percentage: trainingSteps.length > 0 ? Math.round((trainingCompleted / trainingSteps.length) * 100) : 0
        }
      };

      setRecruitData({
        ...data,
        recruit: { ...recruit, country },
        licensing_steps: licensingSteps,
        training_steps: trainingSteps,
        progress
      });
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

  // Show confirmation modal before toggling a step
  const requestToggleStep = (stepId, stepType, currentStatus, stepTitle) => {
    if (processingSteps.has(stepId)) return;
    setConfirmModal({ stepId, stepType, currentStatus, stepTitle });
  };

  const confirmToggleStep = () => {
    if (!confirmModal) return;
    const { stepId, stepType, currentStatus } = confirmModal;
    setConfirmModal(null);
    toggleStepComplete(stepId, stepType, currentStatus);
  };

  const toggleStepComplete = async (stepId, stepType, currentStatus) => {
    if (processingSteps.has(stepId)) return;
    const newStatus = !currentStatus;
    setProcessingSteps(prev => new Set([...prev, stepId]));

    // Optimistic update: immediately reflect the change in local state
    setRecruitData(prev => {
      if (!prev) return prev;
      const stepsKey = stepType === 'licensing' ? 'licensing_steps' : 'training_steps';
      const updatedSteps = prev[stepsKey].map(s =>
        s.id === stepId ? { ...s, is_completed: newStatus, status: newStatus ? 'Completed' : (s._originalStatus || 'On Track') } : s
      );
      const completedCount = updatedSteps.filter(s => s.is_completed).length;
      return {
        ...prev,
        [stepsKey]: updatedSteps,
        progress: {
          ...prev.progress,
          [stepType]: {
            total: updatedSteps.length,
            completed: completedCount,
            percentage: updatedSteps.length > 0 ? Math.round((completedCount / updatedSteps.length) * 100) : 0
          }
        }
      };
    });

    try {
      const response = await fetch(
        `${CONFIG.n8nBaseUrl}${CONFIG.webhooks.updateStep}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            step_id: stepId,
            step_type: stepType,
            is_completed: newStatus
          })
        }
      );
      if (!response.ok) throw new Error('Failed to update step');
    } catch (err) {
      console.error('Error updating step:', err);
      // Revert optimistic update on failure
      await fetchRecruitData();
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

    // Sequential locking: only applies to licensing steps
    const isLocked = isLicensing && !step.is_completed && index > firstIncompleteIdx;

    // --- Compact row for incomplete, non-expanded steps ---
    if (!step.is_completed && (!isExpanded || isLocked)) {
      return (
        <div
          className={`group relative rounded-xl transition-all duration-300 overflow-hidden ${
            isLocked ? 'pointer-events-none opacity-50' : 'cursor-pointer'
          } ${
            isNextStep
              ? 'glass-card-elevated ring-2 ring-offset-1 ' + (isLicensing ? 'ring-blue-500/30' : 'ring-violet-500/30')
              : 'bg-white border border-slate-200/80 hover:border-slate-300'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => !isLocked && hasDetails && toggleStepExpanded(step.id)}
        >
          {isNextStep && (
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${isLicensing ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-gradient-to-r from-violet-500 to-violet-400'}`} />
          )}
          <div className="px-4 py-3 sm:px-5 flex items-center gap-3">
            {/* Checkbox or lock indicator */}
            {isLocked ? (
              <div className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-50">
                <Lock className="w-3.5 h-3.5 text-slate-300" />
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); requestToggleStep(step.id, stepType, step.is_completed, step.step_title); }}
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
            )}

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
              {hasDetails && !isLocked && (
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
              onClick={() => requestToggleStep(step.id, stepType, step.is_completed, step.step_title)}
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
                          <span><Linkify>{instruction}</Linkify></span>
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
                      <Linkify>{step.resources}</Linkify>
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
    const isNoToken = error === 'no_token';
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {isNoToken ? 'Welcome to WFG Onboarding' : 'Link not recognized'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {isNoToken
              ? 'To view your onboarding progress, please use the personalized link your trainer sent you.'
              : (error || 'Something went wrong loading your data.')}
          </p>
          {!isNoToken && (
            <button
              onClick={() => { setError(null); fetchRecruitData(); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Try again
            </button>
          )}
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

      {/* ===== CONFIRMATION MODAL ===== */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              {confirmModal.currentStatus ? (
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmModal.currentStatus ? 'Mark as incomplete?' : 'Mark as complete?'}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {confirmModal.stepTitle}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {confirmModal.currentStatus
                ? 'This will mark the step as not yet completed. You can always complete it again later.'
                : 'Are you sure you have completed this step? Make sure you\'ve finished all the instructions before marking it done.'}
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggleStep}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                  confirmModal.currentStatus
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {confirmModal.currentStatus ? 'Yes, undo' : 'Yes, I\'m done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WFGOnboardingApp;
