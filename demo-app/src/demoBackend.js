// =============================================================================
// Demo Backend — in-repo automation/data layer
// =============================================================================
// Replaces the production n8n webhooks (which talked to GoHighLevel) with a
// self-contained, in-browser implementation backed by localStorage. The React
// app is copied verbatim from production; we simply intercept the four
// `/webhook/...` calls it makes and serve them locally. No n8n, no CRM, no
// network — the whole demo runs from `npm run dev`.
//
// Routes handled (matched by URL path suffix):
//   POST /webhook/wfg-app-get-recruit-data   -> recruit OR admin payload
//   POST /webhook/wfg-app-step-update        -> toggle step / sub-step
//   POST /webhook/wfg-recruit-created        -> create recruit, return token
//   POST /webhook/ghl-proxy                  -> emulated GHL records API
//                                               (admin create / search / update)
// =============================================================================

import { makeSeedRecords } from './seedData.js';

const STORAGE_KEY = 'wfg_demo_records_v1';
const LOCATION_ID = 'demo-location';

// ---- Storage helpers --------------------------------------------------------

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) { /* fall through to seed */ }
  const seeded = makeSeedRecords();
  saveRecords(seeded);
  return seeded;
}

function saveRecords(records) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) { /* ignore */ }
}

// Reset the demo back to seed data (exposed on window for convenience).
export function resetDemoData() {
  const seeded = makeSeedRecords();
  saveRecords(seeded);
  return seeded;
}

function randId() {
  return 'rec_' + Math.random().toString(36).slice(2, 12);
}

function generateRecruitToken(length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

// ---- Shape helpers ----------------------------------------------------------

// Flatten a stored record's properties into the flat recruit object the app's
// data provider returned in production (state -> state_province).
function toFlatRecruit(rec) {
  const p = rec.properties || {};
  return {
    id: rec.id,
    full_name: p.full_name || '',
    email: p.email || '',
    phone: p.phone || '',
    role: p.role || 'recruit',
    onboarding_token: p.onboarding_token || '',
    country: p.country || 'canada',
    state_province: p.state || p.state_province || '',
    start_date: p.start_date || '',
    recruiter_name: p.recruiter_name || '',
    upline_office: p.upline_office || '',
    recruit_stage: p.recruit_stage || 'active_onboarding',
    completed_licensing_steps: p.completed_licensing_steps || '[]',
    completed_training_steps: p.completed_training_steps || '[]',
  };
}

function findByToken(records, token) {
  return records.find(r => (r.properties || {}).onboarding_token === token);
}

// ---- Route handlers ---------------------------------------------------------

function handleGetRecruitData(body) {
  const records = loadRecords();
  const token = body.token;
  const rec = findByToken(records, token);
  if (!rec) return { success: false, error: 'Invalid token' };

  const props = rec.properties || {};

  if (props.role === 'admin') {
    const recruits = records
      .filter(r => (r.properties || {}).role !== 'admin')
      .filter(r => (r.properties || {}).recruit_stage !== 'inactive')
      .map(toFlatRecruit);
    return {
      success: true,
      admin: {
        name: props.full_name || '',
        role: 'Admin',
        office: props.upline_office || '',
      },
      recruits,
    };
  }

  return { success: true, recruit: toFlatRecruit(rec) };
}

function handleStepUpdate(body) {
  const records = loadRecords();
  const { token, step_id, step_type, is_completed } = body;
  const rec = findByToken(records, token);
  if (!rec) return { success: false, error: 'Invalid token' };

  const field = step_type === 'training' ? 'completed_training_steps' : 'completed_licensing_steps';
  let arr = [];
  try { arr = JSON.parse(rec.properties[field] || '[]'); } catch (e) { arr = []; }

  if (is_completed) {
    if (!arr.includes(step_id)) arr.push(step_id);
  } else {
    arr = arr.filter(id => id !== step_id);
  }
  rec.properties[field] = JSON.stringify(arr);
  saveRecords(records);
  return { success: true };
}

function handleRecruitCreated(body) {
  const records = loadRecords();
  const token = generateRecruitToken();
  const rec = {
    id: randId(),
    createdAt: new Date().toISOString(),
    properties: {
      full_name: (body.full_name || '').trim(),
      email: (body.email || '').trim(),
      phone: (body.phone || '').trim(),
      role: 'recruit',
      onboarding_token: token,
      country: body.country || 'Canada',
      state: body.state_province || body.state || '',
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      recruiter_name: body.recruiter_name || '',
      upline_office: body.upline_office || '',
      recruit_stage: 'active_onboarding',
      completed_licensing_steps: '[]',
      completed_training_steps: '[]',
    },
  };
  records.push(rec);
  saveRecords(records);
  return { success: true, token };
}

// Emulate the GHL records API surface the admin dashboard pokes through the
// `ghl-proxy` webhook: create record, search all records, update a record.
function handleGhlProxy(body) {
  const records = loadRecords();
  const { method, endpoint, data } = body;
  const base = 'objects/custom_objects.recruits/records';

  // Create record (used for "Add Admin")
  if (endpoint === base && method === 'POST') {
    const rec = {
      id: randId(),
      createdAt: new Date().toISOString(),
      properties: { ...(data.properties || {}) },
    };
    records.push(rec);
    saveRecords(records);
    return { body: { record: rec } };
  }

  // Search all records (used for "Find Link", admin list, inactive list)
  if (endpoint === `${base}/search` && method === 'POST') {
    return { body: { records } };
  }

  // Update a record by id (used for remove / restore)
  const updateMatch = endpoint.match(new RegExp(`^${base}/(.+)$`));
  if (updateMatch && method === 'PUT') {
    const id = updateMatch[1];
    const rec = records.find(r => r.id === id);
    if (rec) {
      rec.properties = { ...rec.properties, ...(data.properties || {}) };
      saveRecords(records);
      return { body: { record: rec } };
    }
    return { body: {}, error: 'Record not found' };
  }

  return { body: {} };
}

// ---- Fetch interceptor ------------------------------------------------------

const ROUTES = [
  { match: '/webhook/wfg-app-get-recruit-data', handler: handleGetRecruitData },
  { match: '/webhook/wfg-app-step-update', handler: handleStepUpdate },
  { match: '/webhook/wfg-recruit-created', handler: handleRecruitCreated },
  { match: '/webhook/ghl-proxy', handler: handleGhlProxy },
];

function makeResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  };
}

function getPath(url) {
  try { return new URL(url, window.location.origin).pathname; }
  catch (e) { return typeof url === 'string' ? url : ''; }
}

// Install a fetch shim that routes the app's webhook calls to the local
// handlers and passes everything else through to the real fetch. Small
// artificial latency keeps the app's loading states visible during the demo.
export function installDemoBackend() {
  // Ensure the store is seeded on boot.
  loadRecords();
  if (typeof window !== 'undefined') {
    window.resetDemoData = resetDemoData;
  }

  const realFetch = window.fetch ? window.fetch.bind(window) : null;

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const path = getPath(url);
    const route = ROUTES.find(r => path.endsWith(r.match));

    if (!route) {
      if (realFetch) return realFetch(input, init);
      throw new Error(`No demo route and no real fetch for ${url}`);
    }

    let body = {};
    try { body = init.body ? JSON.parse(init.body) : {}; } catch (e) { body = {}; }

    await new Promise(res => setTimeout(res, 250));

    try {
      const payload = route.handler(body);
      return makeResponse(payload, 200);
    } catch (err) {
      console.error('[demoBackend] handler error:', err);
      return makeResponse({ success: false, error: 'demo_backend_error' }, 500);
    }
  };
}
