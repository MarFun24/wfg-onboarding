#!/usr/bin/env node

/**
 * Extract all registered user onboarding links from GHL via n8n proxy.
 *
 * Usage:
 *   node extract-user-links.js
 *   node extract-user-links.js --json          # output as JSON
 *   node extract-user-links.js --app-url URL   # override app base URL
 *
 * Environment:
 *   N8N_BASE_URL   – n8n instance base URL (default: https://mfunston.app.n8n.cloud)
 *   APP_BASE_URL   – deployed app URL for link construction (default: https://wfg-onboarding.vercel.app)
 */

const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://mfunston.app.n8n.cloud';
const GHL_LOCATION_ID = 'ig2lyOlMvCuYK9sOyb';

// Parse CLI flags
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const appUrlIdx = args.indexOf('--app-url');
const APP_BASE_URL = appUrlIdx !== -1 && args[appUrlIdx + 1]
  ? args[appUrlIdx + 1]
  : (process.env.APP_BASE_URL || 'https://wfg-onboarding.vercel.app');

async function fetchAllRecruitRecords() {
  const url = `${N8N_BASE_URL}/webhook/ghl-proxy`;

  // GHL v2 custom object record search
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: 'v2',
      method: 'GET',
      endpoint: `objects/custom_objects.recruits/records?locationId=${GHL_LOCATION_ID}&limit=100`,
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n proxy returned HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  // The proxy may wrap the GHL response in a "body" key
  const body = data.body || data;
  const records = body.records || body.data || body.results || [];

  return records;
}

function buildLink(token) {
  return `${APP_BASE_URL}/?token=${token}`;
}

function extractUserInfo(record) {
  // GHL custom object records store field values in "properties"
  const props = record.properties || record;

  return {
    id: record.id || props.id,
    full_name: props.full_name || 'Unknown',
    email: props.email || '',
    phone: props.phone || '',
    role: props.role || 'recruit',
    country: props.country || '',
    state: props.state || props.state_province || '',
    onboarding_token: props.onboarding_token || '',
    start_date: props.start_date || '',
    recruiter_name: props.recruiter_name || '',
    upline_office: props.upline_office || '',
    recruit_stage: props.recruit_stage || '',
  };
}

async function main() {
  console.error(`Fetching recruit records from ${N8N_BASE_URL} ...`);

  let records;
  try {
    records = await fetchAllRecruitRecords();
  } catch (err) {
    console.error(`Error fetching records: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(records) || records.length === 0) {
    console.error('No recruit records found.');
    process.exit(0);
  }

  const users = records.map(extractUserInfo).filter(u => u.onboarding_token);

  const admins = users.filter(u => u.role === 'admin');
  const recruits = users.filter(u => u.role !== 'admin');

  if (jsonOutput) {
    const output = users.map(u => ({
      ...u,
      link: buildLink(u.onboarding_token),
    }));
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // Pretty-print
  console.log(`\n${'='.repeat(80)}`);
  console.log(`  WFG Onboarding — Registered Users & Links`);
  console.log(`  App URL: ${APP_BASE_URL}`);
  console.log(`${'='.repeat(80)}\n`);

  if (admins.length > 0) {
    console.log(`--- ADMINS (${admins.length}) ---\n`);
    admins.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.full_name}`);
      if (u.email) console.log(`     Email:  ${u.email}`);
      if (u.upline_office) console.log(`     Office: ${u.upline_office}`);
      console.log(`     Link:   ${buildLink(u.onboarding_token)}`);
      console.log();
    });
  }

  if (recruits.length > 0) {
    console.log(`--- RECRUITS (${recruits.length}) ---\n`);
    recruits.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.full_name}`);
      if (u.email) console.log(`     Email:    ${u.email}`);
      if (u.country) console.log(`     Location: ${u.state ? u.state + ', ' : ''}${u.country}`);
      if (u.recruiter_name) console.log(`     Trainer:  ${u.recruiter_name}`);
      if (u.start_date) console.log(`     Started:  ${u.start_date}`);
      if (u.recruit_stage) console.log(`     Stage:    ${u.recruit_stage}`);
      console.log(`     Link:     ${buildLink(u.onboarding_token)}`);
      console.log();
    });
  }

  console.log(`${'='.repeat(80)}`);
  console.log(`  Total: ${users.length} users (${admins.length} admins, ${recruits.length} recruits)`);
  console.log(`${'='.repeat(80)}\n`);
}

main();
