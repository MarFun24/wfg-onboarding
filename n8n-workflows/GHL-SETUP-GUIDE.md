# GoHighLevel (GHL) Setup Guide

Complete setup instructions for the WFG Onboarding system.
This covers everything you need to configure in GHL so the
n8n workflows and the React app work end-to-end.

---

## Architecture: Hybrid Contact + Recruit Object

The system uses **two GHL records per person**:

- **Contact** — the standard GHL contact (name, email, phone, tags)
- **Recruit** — a custom object linked to the Contact via `contact_id`,
  holding all onboarding-specific fields (token, state, start_date, status, etc.)

```
Admin fills form in app
  → n8n "Recruit Creation Handler" webhook
    → Creates a GHL Contact (name, email, phone)
    → Creates a Recruit custom object (token, state, status, linked to contact)
    → Creates Licensing_Step records (custom object)
    → Creates Training_Step records (custom object)
    → Returns token to the app

Recruit opens link with ?token=xxx
  → n8n "Get Recruit Data" webhook
    → Looks up Recruit object by onboarding_token
    → Fetches their Licensing_Step + Training_Step records
    → Returns formatted data to the app

Admin opens link with ?token=yyy
  → n8n "Get Recruit Data" webhook
    → Looks up Recruit object by token, sees role = admin
    → Fetches all recruits where recruiter_name matches
    → Returns admin dashboard data to the app
```

---

## Step 1: API Key

1. Go to **Settings → Business Profile → API Keys** (or **Settings → API Keys** depending on your GHL version)
2. Copy your **API Key** (v1 key, starts with `eyJ...`)
3. In n8n, go to **Credentials → HighLevel account** (ID: `5HNWFt9sVTlmfFXH`)
4. Paste the API key there

> The API key needs permissions for: Contacts (read/write), Custom Objects (read/write), Custom Fields (read)

---

## Step 2: Contact Object (built-in)

The GHL **Contact** stores basic person info only. No custom fields needed.
The workflow creates contacts with:

- `firstName`, `lastName` (split from the form's `full_name`)
- `email`
- `phone`
- `tags`: `["wfg-recruit"]` (and `"active-onboarding"` added after setup completes)

---

## Step 3: Recruit Custom Object

This is where all onboarding-specific data lives.
Go to **Settings → Custom Objects** and create (or verify) a **Recruit** object.

These fields should exist on the Recruit object:

### Identification & linking

| Field Name           | Field Key           | Type         | Notes                                      |
|----------------------|---------------------|--------------|---------------------------------------------|
| Contact ID           | `contact_id`        | **Text**     | Links to the GHL Contact record             |
| Full Name            | `full_name`         | **Text**     | Recruit's full name                         |
| Email                | `email`             | **Text**     | Recruit's email                             |
| Phone                | `phone`             | **Text**     | Recruit's phone (optional)                  |
| Onboarding Token     | `onboarding_token`  | **Text**     | The 32-char unique access token             |
| Role                 | `role`              | **Dropdown** | Options: `recruit`, `admin`                 |

### Profile data

| Field Name           | Field Key           | Type         | Notes                                      |
|----------------------|---------------------|--------------|---------------------------------------------|
| Country              | `country`           | **Dropdown** | Options: `United States`, `Canada`          |
| State                | `state`             | **Text**     | e.g., "Texas", "British Columbia"           |
| Start Date           | `start_date`        | **Date**     | When the recruit's onboarding began         |
| Recruiter Name       | `recruiter_name`    | **Text**     | Name of the trainer/recruiter               |
| Upline Office        | `upline_office`     | **Text**     | e.g., "Kingsway Office"                     |

### Status tracking

| Field Name           | Field Key           | Type         | Notes                                      |
|----------------------|---------------------|--------------|---------------------------------------------|
| Recruit Stage        | `recruit_stage`     | **Dropdown** | Options: `Active Onboarding`, `Completed`, `Inactive` |
| Licensing Status     | `licensing_status`  | **Dropdown** | Options: `Not Started`, `In Progress`, `Completed`   |
| Training Status      | `training_status`   | **Dropdown** | Options: `Not Started`, `In Progress`, `Completed`   |
| Timeline Health      | `timeline_health`   | **Dropdown** | Options: `On Track`, `Due Soon`, `Overdue`            |

**Total: 15 fields on the Recruit object**

> **Note:** The field key `state` (not `state_province`) matches what you've
> already set up. The n8n workflow maps the form's `state_province` → `state`.

---

## Step 4: Verify Field Keys in the Workflow

Since the Recruit custom object uses field keys directly (not UUIDs like Contact
custom fields), the workflow should work as-is if your Recruit object field
keys match these names:

```
contact_id, full_name, email, phone, onboarding_token, role,
country, state, start_date, recruiter_name, upline_office,
recruit_stage, licensing_status, training_status, timeline_health
```

If any field key differs in your GHL setup, update the "Create Recruit Record
in GHL" node's JSON body to match.

> **Tip:** You can verify field keys via the API:
> `GET https://rest.gohighlevel.com/v1/custom-fields/`
> or check the Recruit object definition in Settings → Custom Objects.

---

## Step 5: Licensing_Step and Training_Step Custom Objects

In addition to the Recruit object, you need two more custom objects for step tracking.
Go to **Settings → Custom Objects** (requires a plan that supports Custom Objects).

### Custom Object: `Licensing_Step`

Create a custom object called **Licensing_Step** with these fields:

| Field Name          | Type        | Notes                                        |
|---------------------|-------------|----------------------------------------------|
| recruit_id          | **Text**    | Links to the GHL contact ID                  |
| step_id             | **Text**    | e.g., "l1", "l2", ... "l12" or "l13"         |
| step_number         | **Number**  | 1 through 12 (US) or 13 (Canada)             |
| step_title          | **Text**    | e.g., "Sign Your Membership Agreement"       |
| step_description    | **Text**    | Short description of the step                |
| instructions        | **Text**    | JSON string: array of instruction strings    |
| resources           | **Text**    | URLs and reference materials                 |
| timeline_guidance   | **Text**    | e.g., "5 mins", "7 days"                     |
| deadline_date       | **Date**    | Calculated from start_date + days_from_start |
| days_from_start     | **Number**  | Days after start_date this step is due       |
| is_completed        | **Checkbox**| Whether the recruit has finished this step   |
| status              | **Dropdown**| Options: `On Track`, `Due Soon`, `Overdue`, `Completed` |

### Custom Object: `Training_Step`

Create a custom object called **Training_Step** with the **exact same fields** as Licensing_Step above.

> **Important:** After creating the custom objects, verify the API endpoint by checking GHL's custom objects documentation for your account. The workflow uses:
> - `POST https://rest.gohighlevel.com/v1/custom-objects/Licensing_Step`
> - `POST https://rest.gohighlevel.com/v1/custom-objects/Training_Step`
>
> If your GHL version uses a different URL pattern (like `/v2/objects/`), update the HTTP Request nodes in n8n accordingly.

---

## Step 6: Create the Admin Record

The admin/trainer needs both a Contact and a Recruit record (with `role: admin`).

1. **Create a Contact** in GHL:
   - First Name / Last Name, Email
   - Tag: `wfg-admin`

2. **Create a Recruit record** linked to that contact:
   - `contact_id` → the admin's Contact ID
   - `full_name` → their name
   - `role` → `admin`
   - `onboarding_token` → a unique string (e.g., `admin-mfunston-a8b3c9d2e1f4`)
   - `upline_office` → their office name (e.g., "Kingsway Office")
   - `recruiter_name` → their own name

The admin accesses the dashboard at:
```
https://your-app-domain.com/?token=admin-mfunston-a8b3c9d2e1f4
```

---

## Step 7: Build the "Get Recruit Data" n8n Workflow

This is the workflow that the app calls to load data. It needs to:

### For recruit tokens:

```
Webhook (POST /webhook/wfg-app-get-recruit-data)
  → Search Recruit custom objects where onboarding_token = token from request
  → If no match → respond { success: false, error: "Invalid token" }
  → If role = "recruit":
    → Fetch Licensing_Step records where recruit_id = recruit.id
    → Fetch Training_Step records where recruit_id = recruit.id
    → Calculate progress (completed / total for each track)
    → Determine current step (first non-completed step)
    → Calculate timeline_health based on deadline_date vs today
    → Respond with formatted recruit data
```

### For admin tokens:

```
  → If role = "admin":
    → Search Recruit objects where recruiter_name = admin's name
      AND role = "recruit"
    → For each recruit, fetch their licensing + training steps
    → Calculate progress and health for each recruit
    → Respond with:
      {
        success: true,
        admin: { name, role, office },
        recruits: [ ... formatted recruit objects ... ]
      }
```

### Key GHL API calls this workflow needs:

**Look up Recruit by onboarding_token:**
```
GET https://rest.gohighlevel.com/v1/custom-objects/Recruit?onboarding_token={token}
```

> Since you're querying a custom object (not a Contact), you avoid the
> GHL v1 Contact search limitations. Custom object queries should support
> filtering by field value directly.

**Fetch step records by recruit_id:**
```
GET https://rest.gohighlevel.com/v1/custom-objects/Licensing_Step?recruit_id={recruit_id}
GET https://rest.gohighlevel.com/v1/custom-objects/Training_Step?recruit_id={recruit_id}
```

---

## Step 8: Configure the Welcome Email

The "Send Welcome Email" node in the workflow needs SMTP credentials.

**Option A: Use n8n's built-in SMTP**
1. Go to **Credentials** in n8n
2. Add SMTP credentials (your email provider's SMTP server)
3. Connect them to the "Send Welcome Email" node

**Option B: Swap for a GHL email action**
1. Replace the Email Send node with an HTTP Request node
2. Use GHL's email API: `POST https://rest.gohighlevel.com/v1/contacts/{id}/campaigns/emails`

**Option C: Swap for SendGrid / Mailgun**
1. Replace the Email Send node with a SendGrid or Mailgun node
2. Configure API credentials

**Don't forget:** Update the email template URL from `your-app-domain.com` to your actual deployed app URL.

---

## Step 9: Activate and Test

### Testing checklist:

1. **Activate the Recruit Creation Handler workflow** in n8n
2. **Open the admin dashboard** with the admin token
3. **Click "Add Recruit"** and fill in a test recruit
4. **Check GHL:**
   - New contact created with correct custom fields?
   - `onboarding_token` populated?
   - Licensing_Step records created (12 for US, 13 for Canada)?
   - Training_Step records created (8)?
   - Contact updated to "Active Onboarding"?
5. **Copy the onboarding link** from the success modal
6. **Open the link** in a new tab — does the recruit dashboard load?
7. **Check the admin dashboard** — does the new recruit appear?

### Common issues:

| Problem | Likely cause |
|---------|-------------|
| "Create Contact" fails with 422 | Custom field IDs don't match — double-check Step 4 |
| "Create Contact" fails with 401 | API key is wrong or expired — check Step 1 |
| Custom object creation fails | Custom object names don't match or plan doesn't support them |
| Token lookup returns nothing | The "Get Recruit Data" workflow isn't searching by the correct custom field ID |
| Recruit appears but with 0% progress | Step records weren't created, or the data retrieval workflow isn't fetching them |

---

## Quick Reference: All GHL Endpoints Used

| What | Method | Endpoint |
|------|--------|----------|
| Create contact (person) | POST | `/v1/contacts/` |
| Tag contact | PUT | `/v1/contacts/{id}` |
| Create recruit record | POST | `/v1/custom-objects/Recruit` |
| Look up recruit by token | GET | `/v1/custom-objects/Recruit?onboarding_token={token}` |
| Create licensing step | POST | `/v1/custom-objects/Licensing_Step` |
| Create training step | POST | `/v1/custom-objects/Training_Step` |
| Fetch steps by recruit | GET | `/v1/custom-objects/Licensing_Step?recruit_id={id}` |
| List custom field IDs | GET | `/v1/custom-fields/` |
