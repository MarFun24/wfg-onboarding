import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, Clock, ChevronDown, ChevronUp,
  GraduationCap, Target, Shield, Mail, MessageCircle,
  Phone, MapPin, Search, Calendar, Activity, AlertTriangle,
  CheckCircle2, BarChart3, ArrowUpRight, UserPlus, X, Copy, Loader2, Link
} from 'lucide-react';
import { getLicensingSteps, getTrainingSteps, mergeStepsWithCompletion } from './stepDefinitions';

// Configuration
const CONFIG = {
  n8nBaseUrl: import.meta.env.VITE_N8N_BASE_URL || 'https://mfunston.app.n8n.cloud',
  webhooks: {
    getData: '/webhook/wfg-app-get-recruit-data',
    createRecruit: '/webhook/wfg-recruit-created'
  }
};

// Normalize admin recruit data, computing progress from local step definitions
const normalizeAdminRecruit = (r) => {
  // Default country to 'canada' if missing (WFG is Vancouver-based)
  const country = r.country || 'canada';

  // Default role to 'recruit' if missing
  const role = r.role || 'recruit';

  // Parse completion arrays from recruit record
  let completedLicensing = {};
  let completedTraining = {};
  try {
    const lcArr = JSON.parse(r.completed_licensing_steps || '[]');
    lcArr.forEach(id => { completedLicensing[id] = { is_completed: true }; });
  } catch(e) {}
  try {
    const trArr = JSON.parse(r.completed_training_steps || '[]');
    trArr.forEach(id => { completedTraining[id] = { is_completed: true }; });
  } catch(e) {}

  // Get step definitions and merge with completion data
  const licensingSteps = mergeStepsWithCompletion(
    getLicensingSteps(country, r.start_date),
    completedLicensing
  );
  const trainingSteps = mergeStepsWithCompletion(
    getTrainingSteps(r.start_date),
    completedTraining
  );

  const licensingCompleted = licensingSteps.filter(s => s.is_completed).length;
  const trainingCompleted = trainingSteps.filter(s => s.is_completed).length;

  // Find first incomplete step in each pathway
  const currentLicensingStep = licensingSteps.find(s => !s.is_completed) || licensingSteps[licensingSteps.length - 1];
  const currentTrainingStep = trainingSteps.find(s => !s.is_completed) || trainingSteps[trainingSteps.length - 1];

  // Compute days since start
  const startDate = r.start_date ? new Date(r.start_date) : new Date();
  const daysSinceStart = isNaN(startDate.getTime()) ? 0 : Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));

  // Use API-provided progress if available (transition period), otherwise compute locally
  const hasApiProgress = r.licensing_progress && r.licensing_progress.total > 0;

  return {
    ...r,
    country,
    role,
    days_since_start: hasApiProgress
      ? (typeof r.days_since_start === 'number' ? r.days_since_start : parseInt(r.days_since_start, 10) || daysSinceStart)
      : daysSinceStart,
    licensing_progress: {
      total: licensingSteps.length,
      completed: licensingCompleted,
      percentage: licensingSteps.length > 0 ? Math.round((licensingCompleted / licensingSteps.length) * 100) : 0,
    },
    training_progress: {
      total: trainingSteps.length,
      completed: trainingCompleted,
      percentage: trainingSteps.length > 0 ? Math.round((trainingCompleted / trainingSteps.length) * 100) : 0,
    },
    current_licensing_step: {
      step_number: currentLicensingStep?.step_number || 1,
      step_title: currentLicensingStep?.step_title || '',
    },
    current_training_step: {
      step_number: currentTrainingStep?.step_number || 1,
      step_title: currentTrainingStep?.step_title || '',
    },
    timeline_health: ['On Track', 'Due Soon', 'Overdue'].includes(r.timeline_health) ? r.timeline_health : 'On Track',
  };
};
// --- Reusable Sub-components ---

const ProgressRing = ({ percentage, size = 80, strokeWidth = 6, color = '#3b82f6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out" />
    </svg>
  );
};

const StatusBadge = ({ status, size = 'default' }) => {
  const config = {
    'On Track': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
    'Due Soon': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-500/20' },
    'Overdue': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', ring: 'ring-red-500/20' },
    'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
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

const cleanPhone = (phone) => phone.replace(/\D/g, '');

// --- Pipeline Chart: which licensing step are recruits on ---
const PipelineChart = ({ recruits }) => {
  // Use max step count across all recruits (12 for US, 13 for Canada)
  const maxStepNum = Math.max(...recruits.map(r => r.licensing_progress.total), 12);
  const steps = Array.from({ length: maxStepNum }, (_, i) => {
    const stepNum = i + 1;
    const count = recruits.filter(r => r.current_licensing_step.step_number === stepNum).length;
    return { stepNum, count };
  });
  const maxCount = Math.max(...steps.map(s => s.count), 1);
  const stepLabels = [
    'Membership', 'Pay Fees', 'Register Course', 'Pre-Licensing', 'Book Exam', 'Exam',
    'Background', 'Account Setup', 'Apply License', 'WFG Agreement', 'AML/Ethics', 'Carriers', 'Carriers'
  ];

  return (
    <div className="space-y-2">
      {steps.map(({ stepNum, count }) => (
        <div key={stepNum} className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{stepNum}</span>
          <div className="flex-1 h-6 bg-slate-50 rounded-lg overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg transition-all duration-700 ease-out flex items-center"
              style={{ width: count > 0 ? `${Math.max((count / maxCount) * 100, 8)}%` : '0%' }}
            >
              {count > 0 && (
                <span className="text-[10px] font-bold text-white pl-2">{count}</span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-slate-400 w-20 truncate hidden sm:block">{stepLabels[stepNum - 1]}</span>
        </div>
      ))}
    </div>
  );
};

// --- Scatter Plot: licensing vs training progress ---
const ProgressScatter = ({ recruits }) => {
  const width = 320;
  const height = 240;
  const pad = { top: 20, right: 20, bottom: 35, left: 35 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const healthColor = {
    'On Track': '#10b981',
    'Due Soon': '#f59e0b',
    'Overdue': '#ef4444'
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => (
        <React.Fragment key={v}>
          <line
            x1={pad.left} y1={pad.top + plotH - (v / 100) * plotH}
            x2={pad.left + plotW} y2={pad.top + plotH - (v / 100) * plotH}
            stroke="#f1f5f9" strokeWidth="1"
          />
          <line
            x1={pad.left + (v / 100) * plotW} y1={pad.top}
            x2={pad.left + (v / 100) * plotW} y2={pad.top + plotH}
            stroke="#f1f5f9" strokeWidth="1"
          />
        </React.Fragment>
      ))}

      {/* Axis labels */}
      <text x={pad.left + plotW / 2} y={height - 4} textAnchor="middle" className="text-[9px]" fill="#94a3b8">Licensing %</text>
      <text x={8} y={pad.top + plotH / 2} textAnchor="middle" className="text-[9px]" fill="#94a3b8" transform={`rotate(-90, 8, ${pad.top + plotH / 2})`}>Training %</text>

      {/* Tick labels */}
      {[0, 50, 100].map(v => (
        <React.Fragment key={`tick-${v}`}>
          <text x={pad.left + (v / 100) * plotW} y={pad.top + plotH + 14} textAnchor="middle" className="text-[8px]" fill="#cbd5e1">{v}</text>
          <text x={pad.left - 6} y={pad.top + plotH - (v / 100) * plotH + 3} textAnchor="end" className="text-[8px]" fill="#cbd5e1">{v}</text>
        </React.Fragment>
      ))}

      {/* Diagonal guide (balanced progress) */}
      <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

      {/* Recruit dots */}
      {recruits.map((r) => {
        const cx = pad.left + (r.licensing_progress.percentage / 100) * plotW;
        const cy = pad.top + plotH - (r.training_progress.percentage / 100) * plotH;
        const color = healthColor[r.timeline_health] || '#10b981';
        return (
          <g key={r.id}>
            <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.2} />
            <circle cx={cx} cy={cy} r={4} fill={color} className="transition-all duration-500" />
            <title>{`${r.full_name}: ${r.licensing_progress.percentage}% licensing, ${r.training_progress.percentage}% training`}</title>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#cbd5e1" strokeWidth="1" />
      <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#cbd5e1" strokeWidth="1" />
    </svg>
  );
};

// --- Step Dot Timeline ---
const StepDots = ({ total, completed, color = 'blue' }) => {
  const colorClasses = color === 'blue'
    ? { filled: 'bg-blue-500', empty: 'bg-slate-200' }
    : { filled: 'bg-violet-500', empty: 'bg-slate-200' };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i < completed ? colorClasses.filled : colorClasses.empty
          }`}
        />
      ))}
    </div>
  );
};

// --- Recruit Accordion Row ---
const RecruitRow = ({ recruit, isExpanded, onToggle }) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const overallPct = Math.round(
    ((recruit.licensing_progress.completed + recruit.training_progress.completed) /
     (recruit.licensing_progress.total + recruit.training_progress.total)) * 100
  );
  const onboardingLink = recruit.onboarding_token
    ? `${window.location.origin}${window.location.pathname}?token=${recruit.onboarding_token}`
    : null;
  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (!onboardingLink) return;
    navigator.clipboard.writeText(onboardingLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
      isExpanded ? 'border-slate-300 shadow-sm' : 'border-slate-200/80 hover:border-slate-300'
    }`}>
      {/* Collapsed header */}
      <div
        className="px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
          recruit.timeline_health === 'Overdue' ? 'bg-gradient-to-br from-red-500 to-red-600'
          : recruit.timeline_health === 'Due Soon' ? 'bg-gradient-to-br from-amber-500 to-amber-600'
          : 'bg-gradient-to-br from-blue-600 to-violet-600'
        }`}>
          {recruit.full_name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">{recruit.full_name}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-slate-400">{recruit.state_province}</span>
            <span className="text-slate-200">|</span>
            <span className="text-[11px] text-slate-400">{overallPct}% complete</span>
          </div>
        </div>

        {/* Mini progress bars */}
        <div className="hidden sm:flex flex-col gap-1.5 w-24 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${recruit.licensing_progress.percentage}%` }} />
            </div>
            <span className="text-[9px] font-bold text-blue-600 w-7 text-right">{recruit.licensing_progress.percentage}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${recruit.training_progress.percentage}%` }} />
            </div>
            <span className="text-[9px] font-bold text-violet-600 w-7 text-right">{recruit.training_progress.percentage}%</span>
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={recruit.timeline_health} size="sm" />

          {/* Message buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {recruit.phone && (
              <a
                href={`sms:${cleanPhone(recruit.phone)}`}
                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                title="Text message"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              </a>
            )}
            <a
              href={`mailto:${recruit.email}?subject=WFG%20Onboarding%20Check-in`}
              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors"
              title="Send email"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
            </a>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-300" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 animate-fadeIn border-t border-slate-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Licensing column */}
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/60">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Licensing</h5>
                <span className="ml-auto text-xs font-bold text-blue-600">{recruit.licensing_progress.completed}/{recruit.licensing_progress.total}</span>
              </div>
              <StepDots total={recruit.licensing_progress.total} completed={recruit.licensing_progress.completed} color="blue" />
              <div className="mt-3 bg-white/80 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Step</p>
                <p className="text-sm font-semibold text-slate-800">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 mr-1.5">
                    {recruit.current_licensing_step.step_number}
                  </span>
                  {recruit.current_licensing_step.step_title}
                </p>
              </div>
            </div>

            {/* Training column */}
            <div className="bg-violet-50/50 rounded-xl p-4 border border-violet-100/60">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-violet-600" />
                <h5 className="text-xs font-bold text-violet-700 uppercase tracking-wider">Training</h5>
                <span className="ml-auto text-xs font-bold text-violet-600">{recruit.training_progress.completed}/{recruit.training_progress.total}</span>
              </div>
              <StepDots total={recruit.training_progress.total} completed={recruit.training_progress.completed} color="violet" />
              <div className="mt-3 bg-white/80 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Step</p>
                <p className="text-sm font-semibold text-slate-800">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold bg-violet-100 text-violet-700 mr-1.5">
                    {recruit.current_training_step.step_number}
                  </span>
                  {recruit.current_training_step.step_title}
                </p>
              </div>
            </div>
          </div>

          {/* Contact + meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Started {new Date(recruit.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Last active {recruit.last_activity}</span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Day {recruit.days_since_start}</span>
          </div>

          {/* Onboarding link */}
          {onboardingLink && (
            <div className="mt-3 flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-200/80">
              <Link className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <code className="flex-1 text-[11px] text-slate-500 truncate">{onboardingLink}</code>
              <button
                onClick={handleCopyLink}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  linkCopied
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {linkCopied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Link</>}
              </button>
            </div>
          )}

          {/* Mobile message buttons */}
          <div className="flex sm:hidden items-center gap-2 mt-4 pt-3 border-t border-slate-100">
            {recruit.phone && (
              <a
                href={`sms:${cleanPhone(recruit.phone)}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Text
              </a>
            )}
            <a
              href={`mailto:${recruit.email}?subject=WFG%20Onboarding%20Check-in`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
            {recruit.phone && (
              <a
                href={`tel:${cleanPhone(recruit.phone)}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- US States + Canadian Provinces for dropdown ---
const REGIONS = {
  'United States': [
    'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia',
    'Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland',
    'Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
    'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
    'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
  ],
  'Canada': [
    'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia',
    'Ontario','Prince Edward Island','Quebec','Saskatchewan','Northwest Territories','Nunavut','Yukon'
  ]
};

// --- Add Admin Modal ---
const generateAdminToken = (length = 26) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return `admin_${token}`;
};

const AddAdminModal = ({ isOpen, onClose, onSuccess, admin }) => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    upline_office: admin?.office || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValid = form.full_name.trim() && form.email.trim() && isValidEmail(form.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setResult(null);
    const token = generateAdminToken();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      // Build properties, only including non-empty values
      const properties = { full_name: form.full_name.trim(), email: form.email.trim(), role: 'admin', onboarding_token: token };
      if (form.upline_office.trim()) properties.upline_office = form.upline_office.trim();

      const response = await fetch(`${CONFIG.n8nBaseUrl}/webhook/ghl-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 'v2', method: 'POST',
          endpoint: 'objects/custom_objects.recruits/records',
          data: { locationId: 'ig2lyOlMvCuYK8K9sOyb', properties }
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const record = data?.body?.record || data?.record;
      if (record?.id) {
        const link = `${window.location.origin}${window.location.pathname}?token=${token}`;
        setResult({ success: true, token, link });
      } else {
        throw new Error('Admin creation failed — the record may not have been saved. Try again with fewer fields.');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      setResult({ success: false, error: err.name === 'AbortError' ? 'Request timed out. Please try again.' : (err.message || 'Something went wrong.') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => { if (result?.link) navigator.clipboard.writeText(result.link); };
  const handleDone = () => { onSuccess(); onClose(); };

  if (!isOpen) return null;

  const inputClass = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={!submitting ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Add New Admin</h3>
          </div>
          <button onClick={onClose} disabled={submitting} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {result?.success ? (
          <div className="px-6 py-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Admin Created</h4>
            <p className="text-sm text-slate-500 mb-5">{form.full_name} now has admin access.</p>
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Dashboard Link</p>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <code className="flex-1 text-xs text-slate-600 truncate">{result.link}</code>
                <button onClick={handleCopyLink} className="flex-shrink-0 w-8 h-8 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors" title="Copy link">
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Send this link to the new admin to access their dashboard.</p>
            </div>
            <button onClick={handleDone} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {result?.error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {result.error}
              </div>
            )}
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="e.g. Jane Smith" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="jane@example.com" className={inputClass} required />
              {form.email && !isValidEmail(form.email) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid email address.</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Office</label>
              <input type="text" value={form.upline_office} onChange={(e) => handleChange('upline_office', e.target.value)} placeholder="e.g. WFG Vancouver" className={inputClass} />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={!isValid || submitting}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating Admin...</>
                ) : (
                  <><Shield className="w-4 h-4" /> Add Admin</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Add Recruit Modal ---
const AddRecruitModal = ({ isOpen, onClose, onSuccess, admin }) => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: 'United States',
    state_province: '',
    start_date: new Date().toISOString().split('T')[0],
    recruiter_name: admin?.name || '',
    upline_office: admin?.office || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, token, error }

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'country') updated.state_province = '';
      return updated;
    });
  };

  const isValid = form.full_name.trim() && form.email.trim() && form.country && form.state_province && form.start_date;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(
        `${CONFIG.n8nBaseUrl}${CONFIG.webhooks.createRecruit}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), signal: controller.signal }
      );
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && data.token) {
        const link = `${window.location.origin}${window.location.pathname}?token=${data.token}`;
        setResult({ success: true, token: data.token, link });
      } else if (data.success) {
        setResult({ success: true, token: null, link: null });
      } else {
        throw new Error(data.error || 'Failed to create recruit');
      }
    } catch (err) {
      console.error('Error creating recruit:', err);
      setResult({ success: false, error: err.name === 'AbortError' ? 'Request timed out. Please try again.' : (err.message || 'Something went wrong.') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (result?.link) {
      navigator.clipboard.writeText(result.link);
    }
  };

  const handleDone = () => {
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  const regions = REGIONS[form.country] || [];
  const inputClass = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={!submitting ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Add New Recruit</h3>
          </div>
          <button onClick={onClose} disabled={submitting} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Success State */}
        {result?.success ? (
          <div className="px-6 py-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">Recruit Created</h4>
            <p className="text-sm text-slate-500 mb-5">{form.full_name} has been added to the system.</p>
            {result.link ? (
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Onboarding Link</p>
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <code className="flex-1 text-xs text-slate-600 truncate">{result.link}</code>
                  <button onClick={handleCopyLink} className="flex-shrink-0 w-8 h-8 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors" title="Copy link">
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Send this link to the recruit to access their onboarding tracker.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 mb-6">The n8n workflow will generate and email their onboarding link.</p>
            )}
            <button onClick={handleDone} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Error banner */}
            {result?.error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {result.error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="e.g. Maria Santos" className={inputClass} required />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="maria@email.com" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="(555) 123-4567" className={inputClass} />
              </div>
            </div>

            {/* Country + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Country *</label>
                <select value={form.country} onChange={(e) => handleChange('country', e.target.value)} className={inputClass}>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{form.country === 'Canada' ? 'Province' : 'State'} *</label>
                <select value={form.state_province} onChange={(e) => handleChange('state_province', e.target.value)} className={inputClass} required>
                  <option value="">Select...</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" value={form.start_date} onChange={(e) => handleChange('start_date', e.target.value)} className={inputClass} required />
            </div>

            {/* Pre-filled fields (read-only context) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Recruiter</label>
                <input type="text" value={form.recruiter_name} onChange={(e) => handleChange('recruiter_name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Office</label>
                <input type="text" value={form.upline_office} onChange={(e) => handleChange('upline_office', e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating Recruit...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Add Recruit</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Find Link Modal ---
const FindLinkModal = ({ isOpen, onClose, recruits }) => {
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const results = q.length > 0
    ? recruits.filter(r =>
        r.full_name.toLowerCase().includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q))
      )
    : [];

  const handleCopy = (recruit) => {
    if (!recruit.onboarding_token) return;
    const link = `${window.location.origin}${window.location.pathname}?token=${recruit.onboarding_token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(recruit.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <Link className="w-4.5 h-4.5 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Find Onboarding Link</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-colors"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {q.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Start typing to search.</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No results found matching "{query}".</p>
          ) : (
            <div className="space-y-2">
              {results.map(r => {
                const link = r.onboarding_token
                  ? `${window.location.origin}${window.location.pathname}?token=${r.onboarding_token}`
                  : null;
                const isCopied = copiedId === r.id;
                return (
                  <div key={r.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{r.full_name}</p>
                        <p className="text-[11px] text-slate-400">{r.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {r.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-semibold">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-semibold">
                            <Users className="w-2.5 h-2.5" /> Recruit
                          </span>
                        )}
                        <StatusBadge status={r.timeline_health} size="sm" />
                      </div>
                    </div>
                    {link ? (
                      <div className="flex items-center gap-2 mt-2">
                        {r.role === 'admin' && <Shield className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                        <code className="flex-1 text-[11px] text-slate-500 truncate bg-white rounded-lg px-2.5 py-1.5 border border-slate-200">{link}</code>
                        <button
                          onClick={() => handleCopy(r)}
                          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {isCopied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-2">No onboarding link available.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN ADMIN DASHBOARD COMPONENT =====
const AdminDashboard = ({ token }) => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRecruits, setExpandedRecruits] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddRecruit, setShowAddRecruit] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showFindLink, setShowFindLink] = useState(false);

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
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
      if (!data.success) throw new Error(data.error || 'Failed to fetch admin data');
      if (!data.admin || !Array.isArray(data.recruits)) throw new Error('bad_response');
      setAdminData({
        ...data,
        recruits: data.recruits.map(normalizeAdminRecruit),
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
      if (err.name === 'AbortError') {
        setError('The request timed out. Please check your internet connection and try again.');
      } else if (err.message === 'server_error') {
        setError('The server encountered an error. Please try again in a few minutes.');
      } else if (err.message === 'bad_response') {
        setError('We received an unexpected response from the server. Please try again.');
      } else {
        setError('Could not load dashboard data. Please check your link or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRecruit = (id) => {
    setExpandedRecruits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Loading (Skeleton) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white/80 border-b border-slate-200/60 h-16" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 h-32 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
                <div className="h-8 w-12 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-64 animate-pulse" />
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 h-64 animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error || !adminData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Dashboard unavailable</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{error || 'Something went wrong.'}</p>
          <button onClick={() => { setError(null); fetchAdminData(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { admin, recruits } = adminData;

  // --- Computed stats ---
  const totalRecruits = recruits.length;
  const avgCompletion = Math.round(
    recruits.reduce((sum, r) => {
      const total = r.licensing_progress.total + r.training_progress.total;
      const completed = r.licensing_progress.completed + r.training_progress.completed;
      return sum + (completed / total) * 100;
    }, 0) / totalRecruits
  );
  const onTrackCount = recruits.filter(r => r.timeline_health === 'On Track').length;
  const atRiskCount = recruits.filter(r => r.timeline_health === 'Due Soon').length;
  const overdueCount = recruits.filter(r => r.timeline_health === 'Overdue').length;
  const avgDays = Math.round(recruits.reduce((sum, r) => sum + r.days_since_start, 0) / totalRecruits);

  // --- Filter & sort recruits ---
  let filtered = recruits.filter(r => {
    const matchesSearch = r.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHealth = filterHealth === 'all' || r.timeline_health === filterHealth;
    return matchesSearch && matchesHealth;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'completion': {
        const aPct = (a.licensing_progress.completed + a.training_progress.completed) / (a.licensing_progress.total + a.training_progress.total);
        const bPct = (b.licensing_progress.completed + b.training_progress.completed) / (b.licensing_progress.total + b.training_progress.total);
        return bPct - aPct;
      }
      case 'health': {
        const order = { 'Overdue': 0, 'Due Soon': 1, 'On Track': 2 };
        return (order[a.timeline_health] ?? 2) - (order[b.timeline_health] ?? 2);
      }
      case 'recent': {
        return b.days_since_start - a.days_since_start;
      }
      default:
        return a.full_name.localeCompare(b.full_name);
    }
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HEADER ===== */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none">WFG Onboarding</h1>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Trainer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{admin.name}</p>
                <p className="text-[11px] text-slate-400 mt-1">{admin.role}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-amber-500/25 ring-2 ring-white">
                {admin.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ===== HERO ===== */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Welcome back</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {admin.name.split(' ')[0]}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddRecruit(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Recruit
              </button>
              <button
                onClick={() => setShowAddAdmin(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm shadow-amber-500/25"
              >
                <Shield className="w-3.5 h-3.5" />
                Add Admin
              </button>
              <button
                onClick={() => setShowFindLink(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm shadow-violet-500/25"
              >
                <Link className="w-3.5 h-3.5" />
                Find Link
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20">
                <Shield className="w-3.5 h-3.5" />
                {admin.role}
              </span>
            </div>
          </div>
        </div>

        {/* ===== KPI CARDS ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Recruits */}
          <div className="glass-card-elevated rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Recruits</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{totalRecruits}</p>
            <p className="text-[11px] text-slate-400 mt-1">{admin.office}</p>
          </div>

          {/* Average Completion */}
          <div className="glass-card-elevated rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Completion</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <ProgressRing percentage={avgCompletion} size={48} strokeWidth={4} color="#10b981" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-slate-900">{avgCompletion}%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">across all<br/>recruits</p>
            </div>
          </div>

          {/* Health Distribution */}
          <div className="glass-card-elevated rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health</span>
            </div>
            <div className="flex items-center gap-1 mb-2.5 h-3 rounded-full overflow-hidden">
              {onTrackCount > 0 && <div className="bg-emerald-500 h-full rounded-l-full transition-all duration-700" style={{ width: `${(onTrackCount / totalRecruits) * 100}%` }} />}
              {atRiskCount > 0 && <div className="bg-amber-400 h-full transition-all duration-700" style={{ width: `${(atRiskCount / totalRecruits) * 100}%` }} />}
              {overdueCount > 0 && <div className="bg-red-500 h-full rounded-r-full transition-all duration-700" style={{ width: `${(overdueCount / totalRecruits) * 100}%` }} />}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{onTrackCount}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{atRiskCount}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{overdueCount}</span>
            </div>
          </div>

          {/* Avg Days */}
          <div className="glass-card-elevated rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Time</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{avgDays}</p>
            <p className="text-[11px] text-slate-400 mt-1">days in pipeline</p>
          </div>
        </div>

        {/* ===== CHARTS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Pipeline Chart */}
          <div className="glass-card-elevated rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Licensing Pipeline</h3>
              <span className="text-[10px] text-slate-400 ml-auto">Where recruits are now</span>
            </div>
            <PipelineChart recruits={recruits} />
          </div>

          {/* Scatter Plot */}
          <div className="glass-card-elevated rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Progress Balance</h3>
              <span className="text-[10px] text-slate-400 ml-auto">Licensing vs Training</span>
            </div>
            <ProgressScatter recruits={recruits} />
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />On Track</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />At Risk</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Overdue</span>
            </div>
          </div>
        </div>

        {/* ===== RECRUIT LIST ===== */}
        <div className="glass-card-elevated rounded-2xl overflow-hidden">
          {/* List header */}
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Your Recruits</h3>
                <p className="text-sm text-slate-400">{filtered.length} of {totalRecruits} shown</p>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
                />
              </div>
            </div>

            {/* Filters + Sort */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Health filters */}
              {[
                { key: 'all', label: 'All' },
                { key: 'On Track', label: 'On Track' },
                { key: 'Due Soon', label: 'At Risk' },
                { key: 'Overdue', label: 'Overdue' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterHealth(key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                    filterHealth === key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}

              <span className="text-slate-200 mx-1 hidden sm:inline">|</span>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="name">Sort: Name</option>
                <option value="completion">Sort: Completion</option>
                <option value="health">Sort: Health</option>
                <option value="recent">Sort: Days in Pipeline</option>
              </select>
            </div>
          </div>

          {/* Recruit rows */}
          <div className="p-4 sm:p-5 space-y-3">
            {filtered.length > 0 ? (
              filtered.map(recruit => (
                <RecruitRow
                  key={recruit.id}
                  recruit={recruit}
                  isExpanded={expandedRecruits[recruit.id]}
                  onToggle={() => toggleRecruit(recruit.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">No recruits match your filters</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="mt-10 pb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <span>WFG Onboarding Tracker</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-500">{admin.office}</span>
          </div>
        </div>
      </main>

      <AddRecruitModal
        isOpen={showAddRecruit}
        onClose={() => setShowAddRecruit(false)}
        onSuccess={() => fetchAdminData()}
        admin={admin}
      />
      <AddAdminModal
        isOpen={showAddAdmin}
        onClose={() => setShowAddAdmin(false)}
        onSuccess={() => fetchAdminData()}
        admin={admin}
      />
      <FindLinkModal
        isOpen={showFindLink}
        onClose={() => setShowFindLink(false)}
        recruits={recruits}
      />
    </div>
  );
};

export default AdminDashboard;
