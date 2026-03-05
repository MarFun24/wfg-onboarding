// =============================================================================
// WFG Onboarding Step Definitions
// =============================================================================
// Source of truth for all licensing and training step content.
// The React app renders these directly — GHL only tracks completion state.
//
// To update step content: edit this file and redeploy.
// To update completion tracking: that flows through n8n → GHL.
//
// Source: WFG Onboarding Process Validation PDF
// Last updated: 2026-02-19
// =============================================================================

// -----------------------------------------------------------------------------
// US Licensing Steps (11 steps)
// -----------------------------------------------------------------------------
const US_LICENSING_STEPS = [
  {
    step_id: 'l1',
    step_number: 1,
    step_title: 'Sign & Pay Your Membership Agreement',
    step_description: 'Complete and pay for your Associate Membership Agreement.',
    instructions: [
      'Go to www.wfglaunch.com',
      'Click on Sign Up',
      'Type in your personal information accurately',
      'Review and sign the Associate Membership Agreement',
      'Ensure all details match your government-issued ID',
      'Pay the membership fee using your credit card',
      'Keep your payment confirmation for your records',
      'Notify your trainer once complete'
    ],
    resources: 'Your trainer, your ID, your credit card, and your Recruiter code — www.wfglaunch.com',
    timeline_guidance: '10 mins',
    days_from_start: 1
  },
  {
    step_id: 'l2',
    step_number: 2,
    step_title: 'Register for Your Online Course',
    step_description: 'Sign up for the Life & Health pre-licensing course.',
    instructions: [
      'Go to your WFG Launch webpage (www.wfglaunch.com)',
      'Go to the Licensing section',
      'Pick your licensing provider',
      'Sign up and pay for the course',
      'Save your login credentials'
    ],
    resources: 'Your trainer and your credit card — www.wfglaunch.com',
    timeline_guidance: '5 mins',
    days_from_start: 5
  },
  {
    step_id: 'l3',
    step_number: 3,
    step_title: 'Complete Your Pre-Licensing Course',
    step_description: 'Study and pass the pre-licensing course.',
    instructions: [
      'Study and learn the material thoroughly',
      'Complete all course modules and reading materials',
      'Review practice exams to prepare',
      'Pass the course with the required score',
      'Download your course completion certificate'
    ],
    resources: 'The training course material',
    timeline_guidance: '7 days',
    days_from_start: 10
  },
  {
    step_id: 'l4',
    step_number: 4,
    step_title: 'Book Your State Exam',
    step_description: 'Book a time to write the exam.',
    instructions: [
      'First, create an account at www.pearsonvue.com/tx/insurance',
      'Fill in your information and submit',
      'Register for a test before scheduling the examination',
      'On the right side, click Create an Account',
      'Pick exam: General Lines Life, Accident & Health: INS-TX-LAH05',
      'Select your preferred date and testing location'
    ],
    resources: 'Your ID and credit card — www.pearsonvue.com/tx/insurance',
    timeline_guidance: '10 mins',
    days_from_start: 11
  },
  {
    step_id: 'l5',
    step_number: 5,
    step_title: 'Complete Your State Exam',
    step_description: 'Write your state exam.',
    instructions: [
      'Go to the test centre on your scheduled date',
      'Bring your valid government-issued photo ID',
      'Arrive early to check in and get settled',
      'Complete all exam sections within the time limit',
      'Review your preliminary results'
    ],
    resources: 'Your government-issued photo ID',
    timeline_guidance: 'Exam 2HRS: 150 Questions, Min. Score: 70%',
    days_from_start: 26
  },
  {
    step_id: 'l6',
    step_number: 6,
    step_title: 'Complete Your Fingerprints',
    step_description: 'Do your state fingerprint check.',
    instructions: [
      'Go to a fingerprint centre near you',
      'Visit https://www.identogo.com/locations/texas to find a location',
      'Bring your valid government-issued photo ID',
      'Have your fingerprints taken'
    ],
    resources: 'https://www.identogo.com/locations/texas',
    timeline_guidance: '10 mins',
    days_from_start: 31
  },
  {
    step_id: 'l7',
    step_number: 7,
    step_title: 'Create Account With Sircon',
    step_description: 'Create account with Sircon to apply for license.',
    instructions: [
      'Visit www.sircon.com',
      'Create a new username and password',
      'Complete your professional profile',
      'Save your login credentials securely'
    ],
    resources: 'www.sircon.com',
    timeline_guidance: '10 mins',
    days_from_start: 32
  },
  {
    step_id: 'l8',
    step_number: 8,
    step_title: 'Apply For Your State License',
    step_description: 'Apply to get your state license.',
    instructions: [
      'Go to www.sircon.com',
      'Click New Insurance → Resident → Individual',
      'Enter your email, last name, and SSN',
      'Select preparer then click applicant',
      'Select Texas → payment method',
      'License type → Insurance Producer → Life, Accident & Health',
      'Continue to answer the questions and pay the application fee'
    ],
    resources: 'www.sircon.com',
    timeline_guidance: '30 mins',
    days_from_start: 33
  },
  {
    step_id: 'l9',
    step_number: 9,
    step_title: 'Sign Your WFG Agent Agreement',
    step_description: 'Sign the official WFG Agent Agreement.',
    instructions: [
      'Go to www.wfglaunch.com',
      'Click LICENSING (BLUE COLUMN)',
      'View process → Start licensing process → View WFG Agreement',
      'Start Application process → OK',
      'Enter your state life license number → Verify',
      'Complete Docusign and pay fee ($40)',
      'Wait for SMD approval and background check'
    ],
    resources: 'Your trainer — www.wfglaunch.com',
    timeline_guidance: '10 mins',
    days_from_start: 36
  },
  {
    step_id: 'l10',
    step_number: 10,
    step_title: 'Complete AML and LTC Tests',
    step_description: 'Do the AML and LTC tests.',
    instructions: [
      'Go to www.mywfg.com',
      'Click Menu → Licensing & Appointments → Licensing',
      'Go to Continuing Education',
      'Pick your provider',
      'Complete the Anti-Money Laundering course and exam',
      'Complete the Long Term Care course and exam'
    ],
    resources: 'www.mywfg.com',
    timeline_guidance: '10 hours',
    days_from_start: 41
  },
  {
    step_id: 'l11',
    step_number: 11,
    step_title: 'Get Appointed By Carriers',
    step_description: 'Be appointed by carriers to sell their products.',
    instructions: [
      'Log into www.mywfg.com',
      'Click on Menu → Licensing & Appointments → Appointments',
      'Go to Carrier Appointments → Life & Disability',
      'Select Non-NY Life',
      'Select the specific carrier you want to be appointed with',
      'Complete the appointment process for each carrier'
    ],
    resources: 'www.mywfg.com',
    timeline_guidance: '20 mins',
    days_from_start: 45
  }
];

// -----------------------------------------------------------------------------
// Canada Licensing Steps (13 steps)
// -----------------------------------------------------------------------------
const CANADA_LICENSING_STEPS = [
  {
    step_id: 'l1',
    step_number: 1,
    step_title: 'Sign & Pay Your Membership Agreement',
    step_description: 'Complete and pay for your Associate Membership Agreement.',
    instructions: [
      'Go to www.wfglaunch.com',
      'Click on Sign Up',
      'Type in your personal information accurately',
      'Review and sign the Associate Membership Agreement',
      'Ensure all details match your government-issued ID',
      'Pay the membership fee using your credit card',
      'Keep your payment confirmation for your records',
      'Notify your trainer once complete'
    ],
    resources: 'Your trainer, your ID, your credit card, and your Recruiter code — www.wfglaunch.com',
    timeline_guidance: '10 mins',
    days_from_start: 1
  },
  {
    step_id: 'l2',
    step_number: 2,
    step_title: 'Register for Your Online Course',
    step_description: 'Register for the HLLQP course through Olivers.',
    instructions: [
      'Go to www.wfglaunch.com — create a profile if you have not already',
      'Click on Create Password',
      'Your agent code will be in the email you received when you joined — ask your trainer if you cannot find it',
      'Click on Licensing, scroll down and click on Olivers (this is the course provider)',
      'Create an account with Olivers',
      'After signing in, click the top-right red button to do an identity check',
      'You can use your computer camera for the photo — make sure the name matches your ID exactly'
    ],
    resources: 'www.wfglaunch.com — Olivers course provider',
    timeline_guidance: '20 mins',
    days_from_start: 5
  },
  {
    step_id: 'l3',
    step_number: 3,
    step_title: 'Complete Your HLLQP Course',
    step_description: 'Study and pass the HLLQP pre-licensing course.',
    instructions: [
      'Exams for the modules are all open book — 20 or 30 questions, multiple choice, 60% to pass',
      'You have 3 chances to pass each module — if you fail three times on any module, you must restart the entire course from the beginning (and pay again)',
      'Study the material using reading, videos, and/or flashcards',
      'The mock exams are a huge help — go through them a few times to get a feel for the questions',
      'Get familiar with the layout of each section so you can quickly reference material during the open-book exam'
    ],
    resources: 'The training course material — Olivers platform',
    timeline_guidance: '14 days',
    days_from_start: 19
  },
  {
    step_id: 'l4',
    step_number: 4,
    step_title: 'Create a Provincial Licensing Account',
    step_description: 'Create account with Insurance Council of BC to apply for license.',
    instructions: [
      'Sign up for an account at www.insurancecouncilofbc.com',
      'You must provide a service address and a mailing address',
      'Service address: use the Burnaby office — Unit 201, 3665 Kingsway, Vancouver BC, V5R 5W2',
      'Mailing address: use your home address'
    ],
    resources: 'www.insurancecouncilofbc.com',
    timeline_guidance: '10 mins',
    days_from_start: 21
  },
  {
    step_id: 'l5',
    step_number: 5,
    step_title: 'Book Your Provincial Exam',
    step_description: 'Book a time to write your provincial exams.',
    instructions: [
      'Log into your ICBC online portal account',
      'Select "Register/Manage my LLQP exams"',
      'Choose "Life and accident and sickness" as your exam category',
      'Follow the steps to enter your exam registrant information and upload a copy of your government-issued photo ID',
      'Wait up to 3 business days for the Exams team to review and approve your registration',
      'Once you receive the verification email, log back in to schedule and pay for your exams',
      'If you have not heard back within 3 business days, contact the Exams Team at 604-695-2006 or examinations@insurancecouncilofbc.com'
    ],
    resources: 'www.insurancecouncilofbc.com',
    timeline_guidance: '10 mins (plus up to 3 business days for approval)',
    days_from_start: 23
  },
  {
    step_id: 'l6',
    step_number: 6,
    step_title: 'Complete Your Provincial Exam',
    step_description: 'Write your provincial exams.',
    instructions: [
      'Go to the exam location on your scheduled date',
      'Bring your valid government-issued photo ID',
      'Write the exams',
      'Refer to your email confirmation for location and time details'
    ],
    resources: 'Refer to email confirmation',
    timeline_guidance: '1 day',
    days_from_start: 28
  },
  {
    step_id: 'l7',
    step_number: 7,
    step_title: 'Create Your CIPR Number',
    step_description: 'Register for your CIPR (Canadian Insurance Participant Registry) number.',
    instructions: [
      'Create your CIPR number — your trainer will guide you through the process',
      'Save your CIPR number for future licensing steps'
    ],
    resources: 'Your trainer',
    timeline_guidance: '10 mins',
    days_from_start: 29
  },
  {
    step_id: 'l8',
    step_number: 8,
    step_title: 'Complete Your Background Check',
    step_description: 'Complete your background check through Triton Canada.',
    instructions: [
      'Go to https://secure.tritoncanada.ca/v/public/landing/InsuranceCouncilofBritishColumbi/home',
      'Complete the background check application',
      'Provide all required personal information accurately',
      'Pay any associated fees',
      'Save your confirmation for your records'
    ],
    resources: 'https://secure.tritoncanada.ca/v/public/landing/InsuranceCouncilofBritishColumbi/home',
    timeline_guidance: '30 mins',
    days_from_start: 30
  },
  {
    step_id: 'l9',
    step_number: 9,
    step_title: 'Complete Your Anti-Money Laundering Exam & Ethics',
    step_description: 'Complete the Anti-Money Laundering and Canadian Ethics exams.',
    instructions: [
      'Go to your Olivers account under My Courses',
      'Complete the Anti-Money Laundering course and exam',
      'Complete the Canadian Ethics course and exam',
      'There is no charge for these courses but they must be done before you can apply for your personal license',
      'After passing, download a copy of the Certificate of Completion for both — you will need these later'
    ],
    resources: 'www.wfglaunch.com — Olivers platform',
    timeline_guidance: '2 hours',
    days_from_start: 32
  },
  {
    step_id: 'l10',
    step_number: 10,
    step_title: 'Sign Your WFG Agent Agreement',
    step_description: 'Sign the WFG Agent Agreement to transition from wfglaunch to mywfg.',
    instructions: [
      'Go to www.wfglaunch.com',
      'Click LICENSING (BLUE COLUMN)',
      'View process → Start licensing process → View WFG Agreement',
      'Start Application process → OK',
      'Enter your SIN number → Verify',
      'Complete Docusign and pay fee ($40)',
      'Wait for SMD approval and background check'
    ],
    resources: 'Your trainer — www.wfglaunch.com',
    timeline_guidance: '10 mins',
    days_from_start: 34
  },
  {
    step_id: 'l11',
    step_number: 11,
    step_title: 'IVARI E-CONTRACTING',
    step_description: 'Complete the Ivari e-contracting application process.',
    instructions: [
      'Sign into www.mywfg.com → MENU → LICENSING & APPOINTMENTS → LICENSING → IVARI ECONTRACTING',
      'Prepare your exam marks (find the emails you received when you passed your provincials — screenshot or convert to PDF)',
      'Prepare your Criminal Record Check from Triton Canada',
      'Use your local Branch Address (Burnaby/Kingsway office: Unit 201, 3665 Kingsway, Vancouver BC, V5R 5W2) — IMPORTANT: You must include "Unit 201" or your e-contracting will be delayed',
      'Start the Docusign application — ask your trainer for your Marketing Director name, code, and email',
      'Fill out OBA (Outside Business Activities) honestly — include all employment and self-employment activity',
      'Questions 36-41 Regulatory Compliance: answer no, no, yes, yes, yes, yes. In the additional information section, write "requesting E&O now"',
      'Question 42: Province → British Columbia, Check → Accident and Sickness & Life, Applying for → New Licence',
      'Download the IVARI signed e-contracting application and email it to your SMD at wfg.impactvancouver@gmail.com',
      'Wait for Ivari approval email — if approved, save your acceptance letter and E&O insurance copy; let your trainer know either way',
      'If more than 7 business days have passed without hearing back, email wfgcontracting@ivari.ca with your AGENT code and the date your paperwork was submitted, requesting a follow-up. CC wfg.impactvancouver@gmail.com'
    ],
    resources: 'www.mywfg.com — Triton Canada background check — Your trainer for Marketing Director details',
    timeline_guidance: '45 mins (plus processing time for approval)',
    days_from_start: 37
  },
  {
    step_id: 'l12',
    step_number: 12,
    step_title: 'Apply For Your Provincial License',
    step_description: 'Apply to get your provincial license.',
    instructions: [
      'Log in to your ICBC Portal',
      'Go to Main Menu → LICENSES → Apply for a Personal License',
      'Select Personal License Application — A&S',
      'Ask your trainer for the required Supervisory Form',
      'Complete the application and submit',
      'Once license is APPROVED, email a copy of the certificate to WFGApprovedLicense@ivari.ca AND wfgcanadalicensing@transamerica.com',
      'Include your AGENT CODE in the subject line and CC your trainer/SMD'
    ],
    resources: 'www.insurancecouncilofbc.com',
    timeline_guidance: '45 mins',
    days_from_start: 42
  },
  {
    step_id: 'l13',
    step_number: 13,
    step_title: 'Get Appointed By Carriers',
    step_description: 'Be able to sell different products by different carriers.',
    instructions: [
      'Yamila will provide you with the PDF registration form for each carrier',
      'For IA: Go to https://iaa.secureweb.inalco.com/mkmwpvp5 and click "Need a secure access" to register',
      'For Ivari: Go to www.ivari.ca and register with your wfgmail email — Branch Code: 9915',
      'Complete the appointment process for each carrier',
      'Notify your trainer once appointments are confirmed'
    ],
    resources: 'https://iaa.secureweb.inalco.com/mkmwpvp5 — www.ivari.ca (Branch Code: 9915) — Yamila for carrier registration PDFs',
    timeline_guidance: '30 mins',
    days_from_start: 47
  }
];

// -----------------------------------------------------------------------------
// Training Steps (8 steps — same for US and Canada)
// Note: Training descriptions are placeholders pending official content
//       from Jorge and Liz. Titles confirmed accurate from Miro board.
// -----------------------------------------------------------------------------
const TRAINING_STEPS = [
  {
    step_id: 't1',
    step_number: 1,
    step_title: 'Meet Spouse/Influential Person',
    step_description: "Meet the spouse or influential person in the recruit's life.",
    instructions: [
      'Book your meeting using our Calendly link: https://calendly.com/PLACEHOLDER-UPDATE-ME',
      'This meeting requires approximately 3 hours to fully onboard the new agent',
      'Prepare questions about the business opportunity',
      'Do the campaign introduction for the spouse/influential person — take notes on how the trainer is doing the presentation',
      'Go through personal business goals in the trainer guidebook',
      'Set up a Gmail address in this format: firstnamelastinitial@gmail.com (e.g., jorgemwfg@gmail.com) — this should be done by the new agent before the meeting'
    ],
    resources: 'Your trainer — meeting agenda template available from your upline — Book here: https://calendly.com/PLACEHOLDER-UPDATE-ME',
    timeline_guidance: '24-48 hours',
    days_from_start: 1
  },
  {
    step_id: 't2',
    step_number: 2,
    step_title: 'Get Your Startup Kit',
    step_description: 'Receive and review all materials in your new agent startup package.',
    instructions: [
      'Your startup kit will be given to you during the Step 1 meeting with your trainer',
      'Review all included training materials',
      'Set up your account with WSB (World System Builder)',
      'Organize your client presentation tools',
      'Assigned reading: Moment of Truth, Saving Your Future, and the first 98 pages of The System Builder — Moment of Truth must be read right away; the others should be completed by the end of the week (preferably before the next training meeting)'
    ],
    resources: 'Startup kit contents checklist in your trainer guidebook',
    timeline_guidance: '1 day',
    days_from_start: 3
  },
  {
    step_id: 't3',
    step_number: 3,
    step_title: 'Start Your Licensing Path',
    step_description: 'Begin working through the Licensing pathway steps concurrently.',
    instructions: [
      'Switch to the Licensing tab in the onboarding planner',
      'Begin with Step 1: Sign Your Membership Agreement',
      'Work through licensing steps while continuing training',
      'Keep your trainer updated on licensing progress'
    ],
    resources: 'See Licensing pathway in the onboarding planner for detailed steps',
    timeline_guidance: '30 days',
    days_from_start: 15
  },
  {
    step_id: 't4',
    step_number: 4,
    step_title: 'Complete Your PFS',
    step_description: 'Finish your Personal Financial Strategy session and documentation.',
    instructions: [
      'Book your PFS session using our Calendly link: https://calendly.com/PLACEHOLDER-UPDATE-ME',
      'Gather your personal financial documents',
      'Complete the full PFS analysis process',
      'Review your own financial plan and protection gaps'
    ],
    resources: 'PFS workbook and forms in your startup kit — Book here: https://calendly.com/PLACEHOLDER-UPDATE-ME',
    timeline_guidance: '24-48 hours',
    days_from_start: 21
  },
  {
    step_id: 't5',
    step_number: 5,
    step_title: 'Attend All Workshops and BPM',
    step_description: 'Participate in all required workshops and Business Presentation Meetings.',
    instructions: [
      'Log in to your WSB dashboard to book workshops: https://worldsystembuilder.com/wsb-member-login/',
      'Get the workshop and BPM schedule from your trainer',
      'Attend all Saturday training workshops',
      'Attend weekly BPM meetings consistently',
      'Take notes and participate actively in all sessions'
    ],
    resources: 'Workshop calendar available in team communications — WSB Dashboard: https://worldsystembuilder.com/wsb-member-login/',
    timeline_guidance: 'Ongoing — attend all scheduled events for first 90 days',
    days_from_start: 31
  },
  {
    step_id: 't6',
    step_number: 6,
    step_title: 'Complete Trainer Guidebook & Share List',
    step_description: 'Study the trainer guidebook and build your initial prospect list.',
    instructions: [
      'Go through the trainer guidebook with your trainer',
      'Complete all exercises in the guidebook',
      'Build your prospect list with your trainer — aim for at least 100 names',
      'Categorize contacts by relationship and priority'
    ],
    resources: 'Share list template in your startup kit',
    timeline_guidance: '30 days',
    days_from_start: 36
  },
  {
    step_id: 't7',
    step_number: 7,
    step_title: 'Complete Your Field Training',
    step_description: 'Shadow experienced agents and complete hands-on client appointments.',
    instructions: [
      'Schedule field training sessions with your trainer',
      'Observe at least 5 client appointments',
      'Conduct 3 supervised appointments yourself',
      'Debrief with your trainer after each session',
      'For best results, the first 10 meetings should be completed in the first week'
    ],
    resources: 'Field training log sheet from your trainer',
    timeline_guidance: '30 days',
    days_from_start: 45
  },
  {
    step_id: 't8',
    step_number: 8,
    step_title: 'Complete Your GX 315',
    step_description: 'Finish the GX 315 advanced training certification program.',
    instructions: [
      'Register for the GX 315 program',
      'Refer to the trainer manual for instructions on how to complete GX',
      'Complete all online modules and assessments',
      'Track your progress using the GX Monitoring Sheet: /gx-monitoring-sheet.pdf',
      'Attend any required live training sessions',
      'Pass the final certification exam'
    ],
    resources: 'Trainer manual — GX Monitoring Sheet: /gx-monitoring-sheet.pdf',
    timeline_guidance: '30 days',
    days_from_start: 60
  }
];

// -----------------------------------------------------------------------------
// Helper: Get steps for a country with computed deadlines
// -----------------------------------------------------------------------------

/**
 * Returns licensing steps for the given country with deadline_date computed
 * from the recruit's start_date.
 *
 * @param {string} country - 'canada' or 'united_states' (GHL key format)
 * @param {string} startDate - ISO date string (e.g. '2026-03-01')
 * @returns {Array} Steps with deadline_date added
 */
export function getLicensingSteps(country, startDate) {
  const normalized = (country || '').toLowerCase().replace(/\s+/g, '_');
  const steps = normalized === 'united_states' ? US_LICENSING_STEPS : CANADA_LICENSING_STEPS;
  const start = startDate ? new Date(startDate) : new Date();
  if (isNaN(start.getTime())) start.setTime(Date.now());
  return steps.map(step => {
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() + step.days_from_start);
    return {
      ...step,
      deadline_date: deadline.toISOString().split('T')[0]
    };
  });
}

/**
 * Returns training steps with deadline_date computed from start_date.
 * Training steps are the same for US and Canada.
 *
 * @param {string} startDate - ISO date string (e.g. '2026-03-01')
 * @returns {Array} Steps with deadline_date added
 */
export function getTrainingSteps(startDate) {
  const start = startDate ? new Date(startDate) : new Date();
  if (isNaN(start.getTime())) start.setTime(Date.now());
  return TRAINING_STEPS.map(step => {
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() + step.days_from_start);
    return {
      ...step,
      deadline_date: deadline.toISOString().split('T')[0]
    };
  });
}

/**
 * Merges static step definitions with completion data from GHL.
 * GHL completion records are keyed by step_id (e.g. 'l1', 't3').
 *
 * Also maps step_id → id and step_description → description so the output
 * matches the shape the existing React UI components expect.
 *
 * @param {Array} stepDefs - Step definitions from getLicensingSteps/getTrainingSteps
 * @param {Object} completionMap - { step_id: { is_completed, completed_date } }
 * @returns {Array} Steps with completion state merged in
 */
export function mergeStepsWithCompletion(stepDefs, completionMap = {}) {
  const now = new Date();
  return stepDefs.map(step => {
    const completion = completionMap[step.step_id] || {};
    const isCompleted = completion.is_completed || false;
    const deadlineDate = new Date(step.deadline_date);

    let status = 'On Track';
    if (isCompleted) {
      status = 'Completed';
    } else if (deadlineDate < now) {
      status = 'Overdue';
    } else {
      const daysUntilDeadline = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline <= 3) {
        status = 'Due Soon';
      }
    }

    return {
      ...step,
      id: step.step_id,
      description: step.step_description,
      is_completed: isCompleted,
      completed_date: completion.completed_date || null,
      status
    };
  });
}

// Raw exports for direct access if needed
export { US_LICENSING_STEPS, CANADA_LICENSING_STEPS, TRAINING_STEPS };
