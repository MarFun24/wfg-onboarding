import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, Clock, ChevronDown, ChevronUp,
  GraduationCap, Target, Shield, Mail, MessageCircle,
  Phone, MapPin, Search, Calendar, Activity, AlertTriangle,
  CheckCircle2, BarChart3, ArrowUpRight
} from 'lucide-react';

// Configuration
const CONFIG = {
  n8nBaseUrl: 'https://mfunston.app.n8n.cloud',
  webhooks: {
    getData: '/webhook/wfg-app-get-recruit-data'
  }
};

// Mock admin data for demo
const MOCK_ADMIN_DATA = {
  success: true,
  admin: {
    name: "Jorge Maldonado",
    role: "Administrator",
    office: "Houston Office"
  },
  recruits: [
    {
      id: "rec_001", full_name: "Maria Santos", email: "maria.santos@email.com", phone: "(555) 123-4567",
      state_province: "Texas", start_date: "2024-01-10", timeline_health: "On Track",
      licensing_progress: { total: 12, completed: 9, percentage: 75 },
      training_progress: { total: 8, completed: 6, percentage: 75 },
      current_licensing_step: { step_number: 10, step_title: "Sign Your WFG Agent Agreement" },
      current_training_step: { step_number: 7, step_title: "Complete Your Field Training" },
      days_since_start: 33, last_activity: "2 hours ago"
    },
    {
      id: "rec_002", full_name: "David Chen", email: "david.chen@email.com", phone: "(555) 234-5678",
      state_province: "California", start_date: "2024-01-15", timeline_health: "On Track",
      licensing_progress: { total: 12, completed: 7, percentage: 58 },
      training_progress: { total: 8, completed: 5, percentage: 63 },
      current_licensing_step: { step_number: 8, step_title: "Create Account With Sircon" },
      current_training_step: { step_number: 6, step_title: "Complete Your Trainer Guidebook" },
      days_since_start: 28, last_activity: "1 day ago"
    },
    {
      id: "rec_003", full_name: "Ashley Williams", email: "ashley.w@email.com", phone: "(555) 345-6789",
      state_province: "Florida", start_date: "2024-01-05", timeline_health: "Due Soon",
      licensing_progress: { total: 12, completed: 5, percentage: 42 },
      training_progress: { total: 8, completed: 3, percentage: 38 },
      current_licensing_step: { step_number: 6, step_title: "Complete Your State Exam" },
      current_training_step: { step_number: 4, step_title: "Complete Your PFS" },
      days_since_start: 38, last_activity: "3 days ago"
    },
    {
      id: "rec_004", full_name: "Marcus Johnson", email: "m.johnson@email.com", phone: "(555) 456-7890",
      state_province: "Texas", start_date: "2023-12-20", timeline_health: "Overdue",
      licensing_progress: { total: 12, completed: 4, percentage: 33 },
      training_progress: { total: 8, completed: 2, percentage: 25 },
      current_licensing_step: { step_number: 5, step_title: "Book Your State Exam" },
      current_training_step: { step_number: 3, step_title: "Start Your Licensing Path" },
      days_since_start: 54, last_activity: "5 days ago"
    },
    {
      id: "rec_005", full_name: "Priya Patel", email: "priya.patel@email.com", phone: "(555) 567-8901",
      state_province: "New York", start_date: "2024-01-20", timeline_health: "On Track",
      licensing_progress: { total: 12, completed: 6, percentage: 50 },
      training_progress: { total: 8, completed: 4, percentage: 50 },
      current_licensing_step: { step_number: 7, step_title: "Complete Your Fingerprints" },
      current_training_step: { step_number: 5, step_title: "Attend All Workshops and BPM" },
      days_since_start: 23, last_activity: "6 hours ago"
    },
    {
      id: "rec_006", full_name: "James Rivera", email: "j.rivera@email.com", phone: "(555) 678-9012",
      state_province: "Arizona", start_date: "2024-02-01", timeline_health: "On Track",
      licensing_progress: { total: 12, completed: 3, percentage: 25 },
      training_progress: { total: 8, completed: 2, percentage: 25 },
      current_licensing_step: { step_number: 4, step_title: "Complete Your Pre-Licensing Course" },
      current_training_step: { step_number: 3, step_title: "Start Your Licensing Path" },
      days_since_start: 11, last_activity: "Today"
    },
    {
      id: "rec_007", full_name: "Sarah Kim", email: "sarah.kim@email.com", phone: "(555) 789-0123",
      state_province: "Washington", start_date: "2024-01-08", timeline_health: "Due Soon",
      licensing_progress: { total: 12, completed: 6, percentage: 50 },
      training_progress: { total: 8, completed: 2, percentage: 25 },
      current_licensing_step: { step_number: 7, step_title: "Complete Your Fingerprints" },
      current_training_step: { step_number: 3, step_title: "Start Your Licensing Path" },
      days_since_start: 35, last_activity: "2 days ago"
    },
    {
      id: "rec_008", full_name: "Carlos Mendez", email: "carlos.m@email.com", phone: "(555) 890-1234",
      state_province: "Texas", start_date: "2023-12-28", timeline_health: "On Track",
      licensing_progress: { total: 12, completed: 11, percentage: 92 },
      training_progress: { total: 8, completed: 7, percentage: 88 },
      current_licensing_step: { step_number: 12, step_title: "Get Appointed By Carriers" },
      current_training_step: { step_number: 8, step_title: "Complete Your GX 315" },
      days_since_start: 46, last_activity: "1 hour ago"
    }
  ]
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
  const steps = Array.from({ length: 12 }, (_, i) => {
    const stepNum = i + 1;
    const count = recruits.filter(r => r.current_licensing_step.step_number === stepNum).length;
    return { stepNum, count };
  });
  const maxCount = Math.max(...steps.map(s => s.count), 1);
  const stepLabels = [
    'Membership', 'Pay Fees', 'Register Course', 'Pre-Licensing', 'Book Exam', 'State Exam',
    'Fingerprints', 'Sircon', 'Apply License', 'WFG Agreement', 'AML/LTC', 'Carriers'
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
  const overallPct = Math.round(
    ((recruit.licensing_progress.completed + recruit.training_progress.completed) /
     (recruit.licensing_progress.total + recruit.training_progress.total)) * 100
  );

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

// ===== MAIN ADMIN DASHBOARD COMPONENT =====
const AdminDashboard = ({ token }) => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRecruits, setExpandedRecruits] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHealth, setFilterHealth] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const isDemoMode = token === 'admin_demo';

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    if (isDemoMode) {
      setAdminData(MOCK_ADMIN_DATA);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${CONFIG.n8nBaseUrl}${CONFIG.webhooks.getData}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch admin data');
      setAdminData(data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Could not load dashboard data. Please check your link or try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecruit = (id) => {
    setExpandedRecruits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
            <div className="absolute inset-0 rounded-full border-[3px] border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-500 font-medium text-sm">Loading dashboard...</p>
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
            <span className="inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20">
              <Shield className="w-3.5 h-3.5" />
              {admin.role}
            </span>
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
    </div>
  );
};

export default AdminDashboard;
