# GoHighLevel (GHL) Setup Guide

Complete setup instructions for the WFG Onboarding system.
This covers everything you need to configure in GHL so the
n8n workflows and the React app work end-to-end.

---

## Overview: How the system uses GHL

```
Admin fills form in app
  → n8n "Recruit Creation Handler" webhook
    → Creates a GHL Contact (with token + custom fields)
    → Creates Licensing_Step records (custom object)
    → Creates Training_Step records (custom object)
    → Returns token to the app

Recruit opens link with ?token=xxx
  → n8n "Get Recruit Data" webhook
    → Looks up GHL Contact by onboarding_token custom field
    → Fetches their Licensing_Step + Training_Step records
    → Returns formatted data to the app

Admin opens link with ?token=yyy
  → n8n "Get Recruit Data" webhook
    → Looks up GHL Contact by token, sees role = admin
    → Fetches all recruits under that admin
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

## Step 2: Create Contact Custom Fields

Go to **Settings → Custom Fields** (under the Contacts section).

Create the following custom fields. **After creating each one, note the Field ID** — GHL assigns each field a UUID like `kYZqR8...`. You'll need these IDs for the n8n workflow.

### Recruit identification & access

| Field Name           | Field Key (for reference) | Type         | Notes                                      |
|----------------------|---------------------------|--------------|---------------------------------------------|
| Onboarding Token     | `onboarding_token`        | **Text**     | The 32-char unique access token             |
| Role                 | `role`                    | **Dropdown** | Options: `recruit`, `admin`                 |

### Recruit profile data

| Field Name           | Field Key (for reference) | Type         | Notes                                      |
|----------------------|---------------------------|--------------|---------------------------------------------|
| Country              | `country`                 | **Dropdown** | Options: `United States`, `Canada`          |
| State/Province       | `state_province`          | **Text**     | e.g., "Texas", "British Columbia"           |
| Start Date           | `start_date`              | **Date**     | When the recruit's onboarding began         |
| Recruiter Name       | `recruiter_name`          | **Text**     | Name of the trainer/recruiter               |
| Upline Office        | `upline_office`           | **Text**     | e.g., "Kingsway Office"                     |

### Status tracking fields

| Field Name           | Field Key (for reference) | Type         | Notes                                      |
|----------------------|---------------------------|--------------|---------------------------------------------|
| Recruit Stage        | `recruit_stage`           | **Dropdown** | Options: `Active Onboarding`, `Completed`, `Inactive` |
| Licensing Status     | `licensing_status`        | **Dropdown** | Options: `Not Started`, `In Progress`, `Completed`   |
| Training Status      | `training_status`         | **Dropdown** | Options: `Not Started`, `In Progress`, `Completed`   |
| Timeline Health      | `timeline_health`         | **Dropdown** | Options: `On Track`, `Due Soon`, `Overdue`            |

**Total: 11 custom fields**

---

## Step 3: Record Your Custom Field IDs

After creating all fields, go back to **Settings → Custom Fields** and click on each field to see its internal ID. Record them here:

```
onboarding_token  →  ____________________________
role              →  ____________________________
country           →  ____________________________
state_province    →  ____________________________
start_date        →  ____________________________
recruiter_name    →  ____________________________
upline_office     →  ____________________________
recruit_stage     →  ____________________________
licensing_status  →  ____________________________
training_status   →  ____________________________
timeline_health   →  ____________________________
```

> **Tip:** In GHL, you can also find custom field IDs via the API:
> `GET https://rest.gohighlevel.com/v1/custom-fields/`
> This returns all custom fields with their IDs.

---

## Step 4: Update n8n Workflow with Real Field IDs

Open the **"WFG - Recruit Creation Handler v2"** workflow in n8n and update these nodes:

### Node: "Create Contact in GHL"

Find the JSON body and replace the placeholder keys with your real field IDs:

```json
"customField": {
  "YOUR_ONBOARDING_TOKEN_FIELD_ID": "{{ $json.token }}",
  "YOUR_COUNTRY_FIELD_ID": "{{ $json.country }}",
  "YOUR_STATE_PROVINCE_FIELD_ID": "{{ $json.state_province }}",
  "YOUR_START_DATE_FIELD_ID": "{{ $json.start_date }}",
  "YOUR_RECRUITER_NAME_FIELD_ID": "{{ $json.recruiter_name }}",
  "YOUR_UPLINE_OFFICE_FIELD_ID": "{{ $json.upline_office }}"
}
```

### Node: "Update Recruit to Active Onboarding"

Same thing — replace placeholder keys:

```json
"customField": {
  "YOUR_RECRUIT_STAGE_FIELD_ID": "Active Onboarding",
  "YOUR_LICENSING_STATUS_FIELD_ID": "Not Started",
  "YOUR_TRAINING_STATUS_FIELD_ID": "Not Started",
  "YOUR_TIMELINE_HEALTH_FIELD_ID": "On Track"
}
```

---

## Step 5: Create Custom Objects

GHL Custom Objects store the licensing and training step records.
Go to **Settings → Custom Objects** (requires a plan that supports Custom Objects).

### Custom Object 1: `Licensing_Step`

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

### Custom Object 2: `Training_Step`

Create a custom object called **Training_Step** with the **exact same fields** as Licensing_Step above.

> **Important:** After creating the custom objects, verify the API endpoint by checking GHL's custom objects documentation for your account. The workflow uses:
> - `POST https://rest.gohighlevel.com/v1/custom-objects/Licensing_Step`
> - `POST https://rest.gohighlevel.com/v1/custom-objects/Training_Step`
>
> If your GHL version uses a different URL pattern (like `/v2/objects/`), update the HTTP Request nodes in n8n accordingly.

---

## Step 6: Create the Admin Contact

The admin/trainer needs a GHL contact record too, so they can access the dashboard.

1. Go to **Contacts → Create Contact** in GHL
2. Fill in the admin's details:
   - **First Name / Last Name**: The trainer's name
   - **Email**: Their email
3. Set custom fields:
   - `role` → `admin`
   - `onboarding_token` → Generate a token for them (any unique string, e.g., `admin-mfunston-a8b3c9d2e1f4...`)
   - `upline_office` → Their office name (e.g., "Kingsway Office")
   - `recruiter_name` → Their own name
4. Add the tag: `wfg-admin`

The admin accesses the dashboard at:
```
https://your-app-domain.com/?token=admin-mfunston-a8b3c9d2e1f4...
```

---

## Step 7: Build the "Get Recruit Data" n8n Workflow

This is the workflow that the app calls to load data. It needs to:

### For recruit tokens:

```
Webhook (POST /webhook/wfg-app-get-recruit-data)
  → Search GHL contacts where onboarding_token = token from request body
  → If no match → respond { success: false, error: "Invalid token" }
  → If role = "recruit":
    → Fetch Licensing_Step records where recruit_id = contact.id
    → Fetch Training_Step records where recruit_id = contact.id
    → Calculate progress (completed / total for each track)
    → Determine current step (first non-completed step)
    → Calculate timeline_health based on deadline_date vs today
    → Respond with formatted recruit data
```

### For admin tokens:

```
  → If role = "admin":
    → Search GHL contacts where recruiter_name = admin's name
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

**Look up contact by custom field (token):**
```
POST https://rest.gohighlevel.com/v1/contacts/search/
Body: {
  "query": "",
  "filters": [{
    "field": "YOUR_ONBOARDING_TOKEN_FIELD_ID",
    "operator": "eq",
    "value": "the-token-from-request"
  }]
}
```

> **Note:** GHL v1 search/filter by custom field can be limited.
> Alternative approach: Use the GHL v2 API (`POST /v2/contacts/search`)
> which has better custom field filtering support.
> You may need a separate v2 API key (OAuth-based) for this.

**Fetch custom object records by recruit_id:**
```
GET https://rest.gohighlevel.com/v1/custom-objects/Licensing_Step?recruit_id={contact_id}
GET https://rest.gohighlevel.com/v1/custom-objects/Training_Step?recruit_id={contact_id}
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
| Create recruit contact | POST | `/v1/contacts/` |
| Update recruit status | PUT | `/v1/contacts/{id}` |
| Look up contact by token | POST | `/v1/contacts/search/` (or v2) |
| Create licensing step | POST | `/v1/custom-objects/Licensing_Step` |
| Create training step | POST | `/v1/custom-objects/Training_Step` |
| Fetch steps by recruit | GET | `/v1/custom-objects/Licensing_Step?recruit_id={id}` |
| List custom field IDs | GET | `/v1/custom-fields/` |
