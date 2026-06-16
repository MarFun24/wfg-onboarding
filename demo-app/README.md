# WFG Onboarding Tracker — Self-Contained Demo

A standalone clone of the WFG Onboarding Tracker for demos and meetings.

**It is completely unattached to the production app, the GoHighLevel CRM, and
n8n.** The entire automation/data layer runs in your browser, so the only thing
you need to demo it is `npm install && npm run dev`.

## How it differs from production

| | Production | This demo |
|---|---|---|
| Frontend | React/Vite | Same React/Vite UI (copied verbatim) |
| Automation layer | 6 n8n workflows | `src/demoBackend.js` (in-browser) |
| Data store | GoHighLevel CRM | Seeded `localStorage` |
| Network calls | Live n8n webhooks | Intercepted locally — **no network** |

The UI code (`WFGOnboardingApp.jsx`, `AdminDashboard.jsx`, `stepDefinitions.js`)
is an unmodified copy of production. The only new pieces are:

- **`src/demoBackend.js`** — intercepts the four `/webhook/...` calls the app
  makes and serves them from `localStorage`. This is the in-repo replacement
  for the n8n + GHL backend.
- **`src/seedData.js`** — the sample admin + recruits loaded on first run.
- **`src/main.jsx`** — installs the demo backend before the app mounts.

## Quick start

```bash
cd demo-app
npm install
npm run dev
```

The app opens at `http://localhost:5173`. Append a `?token=...` to open a
specific view (see links below).

## Demo links

The store is pre-seeded. **Jorge** is an admin who can see every recruit.

### Admin dashboard
```
http://localhost:5173/?token=admin_demo00000000000000000
```

### Recruit views
| Recruit | Country | Progress | Link |
|---|---|---|---|
| Sarah Chen | Canada (BC) | Early-mid | `?token=demorecruit0sarah0chen00000000001` |
| Michael Rodriguez | USA (TX) | Well underway | `?token=demorecruit0michael0rodrigz000002` |
| Emily Thompson | Canada (ON) | Just started | `?token=demorecruit0emily0thompson0000003` |
| David Park | USA (CA) | Nearly done | `?token=demorecruit0david0park00000000004` |
| Priya Patel | Canada (AB) | Behind (overdue) | `?token=demorecruit0priya0patel0000000005` |

Prefix each recruit token with `http://localhost:5173/?token=`.

## Resetting the demo

Step toggles, new recruits, and removals persist in `localStorage`. To wipe
everything back to the seed data, run this in the browser console:

```js
resetDemoData(); location.reload();
```

(or clear site data / use a private window).

## Deploying as a static site

```bash
npm run build      # outputs to dist/
npm run preview    # serve the build locally
```

`dist/` is a fully static bundle — host it anywhere (Vercel, Netlify, S3, etc.).
No environment variables, no backend, no CRM.
