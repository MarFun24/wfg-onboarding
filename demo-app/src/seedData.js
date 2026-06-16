// =============================================================================
// Demo Seed Data
// =============================================================================
// Sample admin + recruits used to populate the in-browser data store on first
// load. Dates are computed relative to "today" so progress/health looks
// realistic whenever the demo is run. This stands in for what GoHighLevel held
// in production — there is no CRM here.
// =============================================================================

// ISO date string for N days ago
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const nowIso = () => new Date().toISOString();

// Fixed tokens so the demo links are stable across reseeds.
export const DEMO_ADMIN_TOKEN = 'admin_demo00000000000000000';
export const DEMO_RECRUIT_TOKENS = {
  sarah: 'demorecruit0sarah0chen00000000001',
  michael: 'demorecruit0michael0rodrigz000002',
  emily: 'demorecruit0emily0thompson0000003',
  david: 'demorecruit0david0park00000000004',
  priya: 'demorecruit0priya0patel0000000005',
};

const json = (arr) => JSON.stringify(arr);

// Records mirror the GHL custom-object shape the app was built against:
// { id, createdAt, properties: { ...fields } }
export function makeSeedRecords() {
  return [
    // ---- Admin (Jorge sees all recruits) ----
    {
      id: 'rec_admin_jorge',
      createdAt: nowIso(),
      properties: {
        full_name: 'Jorge Martinez',
        email: 'jorge@wfgdemo.com',
        phone: '+1 604 555 0100',
        role: 'admin',
        onboarding_token: DEMO_ADMIN_TOKEN,
        country: 'Canada',
        state: 'British Columbia',
        start_date: daysAgo(120),
        recruiter_name: 'Jorge Martinez',
        upline_office: 'WFG Vancouver',
        recruit_stage: 'active_onboarding',
        completed_licensing_steps: '[]',
        completed_training_steps: '[]',
      },
    },

    // ---- Recruits ----
    {
      id: 'rec_sarah_chen',
      createdAt: nowIso(),
      properties: {
        full_name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        phone: '+1 604 555 0111',
        role: 'recruit',
        onboarding_token: DEMO_RECRUIT_TOKENS.sarah,
        country: 'Canada',
        state: 'British Columbia',
        start_date: daysAgo(25),
        recruiter_name: 'Jorge Martinez',
        upline_office: 'WFG Vancouver',
        recruit_stage: 'active_onboarding',
        completed_licensing_steps: json(['l1', 'l2', 'l3', 'l4']),
        completed_training_steps: json(['t1', 't2']),
      },
    },
    {
      id: 'rec_michael_rodriguez',
      createdAt: nowIso(),
      properties: {
        full_name: 'Michael Rodriguez',
        email: 'michael.rodriguez@example.com',
        phone: '+1 512 555 0122',
        role: 'recruit',
        onboarding_token: DEMO_RECRUIT_TOKENS.michael,
        country: 'United States',
        state: 'Texas',
        start_date: daysAgo(42),
        recruiter_name: 'Jorge Martinez',
        upline_office: 'WFG Vancouver',
        recruit_stage: 'active_onboarding',
        completed_licensing_steps: json(['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8']),
        completed_training_steps: json(['t1', 't2', 't3', 't4']),
      },
    },
    {
      id: 'rec_emily_thompson',
      createdAt: nowIso(),
      properties: {
        full_name: 'Emily Thompson',
        email: 'emily.thompson@example.com',
        phone: '+1 416 555 0133',
        role: 'recruit',
        onboarding_token: DEMO_RECRUIT_TOKENS.emily,
        country: 'Canada',
        state: 'Ontario',
        start_date: daysAgo(4),
        recruiter_name: 'Jorge Martinez',
        upline_office: 'WFG Vancouver',
        recruit_stage: 'active_onboarding',
        completed_licensing_steps: '[]',
        completed_training_steps: '[]',
      },
    },
    {
      id: 'rec_david_park',
      createdAt: nowIso(),
      properties: {
        full_name: 'David Park',
        email: 'david.park@example.com',
        phone: '+1 415 555 0144',
        role: 'recruit',
        onboarding_token: DEMO_RECRUIT_TOKENS.david,
        country: 'United States',
        state: 'California',
        start_date: daysAgo(75),
        recruiter_name: 'Jorge Martinez',
        upline_office: 'WFG Vancouver',
        recruit_stage: 'active_onboarding',
        completed_licensing_steps: json(['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9', 'l10', 'l11']),
        completed_training_steps: json(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']),
      },
    },
    {
      id: 'rec_priya_patel',
      createdAt: nowIso(),
      properties: {
        full_name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '+1 403 555 0155',
        role: 'recruit',
        onboarding_token: DEMO_RECRUIT_TOKENS.priya,
        country: 'Canada',
        state: 'Alberta',
        // Started long ago with little progress -> surfaces "Overdue" health
        start_date: daysAgo(60),
        recruiter_name: 'Jorge Martinez',
        upline_office: 'WFG Vancouver',
        recruit_stage: 'active_onboarding',
        completed_licensing_steps: json(['l1', 'l2']),
        completed_training_steps: json(['t1']),
      },
    },
  ];
}
