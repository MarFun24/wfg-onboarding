# WFG Onboarding Tracker

A professional React application for tracking World Financial Group (WFG) recruit onboarding progress through licensing and training pathways.

![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

## Features

✨ **Professional UI/UX**
- Modern, clean interface with smooth animations
- Responsive design that works on all devices
- Color-coded status indicators
- Animated progress rings

📊 **Progress Tracking**
- Real-time licensing pathway progress
- Real-time training pathway progress
- Status breakdown (Completed, Overdue, Due Soon, On Track)
- Milestone achievement badges

✅ **Step Management**
- Expandable step cards with detailed instructions
- One-click step completion toggle
- Resource links and timeline guidance
- Completion date tracking

🔄 **Live Updates**
- Automatic data refresh after changes
- Processing indicators during updates
- Error handling with retry capability

## Tech Stack

- **React 18.2** - UI framework
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon system
- **n8n Workflows** - Backend automation and data management
- **GoHighLevel** - CRM and data storage

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.0 or higher
- npm 9.0 or higher
- Access to n8n workflows (URLs will be provided)
- A GoHighLevel account with custom objects configured

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/wfg-onboarding.git
cd wfg-onboarding
```

2. Install dependencies:
```bash
npm install
```

3. Configure your n8n URL:

Edit `src/WFGOnboardingApp.jsx` and update the CONFIG object (line 12):

```javascript
const CONFIG = {
  n8nBaseUrl: 'https://your-n8n-instance.com', // Update this!
  webhooks: {
    getData: '/webhook/wfg-app-get-recruit-data',
    updateStep: '/webhook/wfg-app-step-update'
  }
};
```

## Development

### Local Testing

For local development, you can hardcode a test recruit ID in `src/main.jsx` (lines 20-21):

```javascript
return {
  recruitId: 'YOUR_TEST_RECRUIT_ID',
  recruitEmail: 'test@example.com'
};
```

Then start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Click "Deploy"

### URL Parameters (Production)

In production, the app uses URL parameters to identify recruits:

```
https://your-app.vercel.app?recruit_id=ABC123
```

or

```
https://your-app.vercel.app?email=recruit@example.com
```

You can generate personalized links for each recruit using their ID or email.

## Project Structure

```
wfg-onboarding/
├── src/
│   ├── WFGOnboardingApp.jsx    # Main application component
│   ├── main.jsx                 # Entry point with URL param handling
│   └── index.css                # Global styles and Tailwind directives
├── public/
│   └── vite.svg                 # App icon
├── index.html                   # HTML template
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                    # This file
```

## API Integration

The app integrates with n8n workflows for data management:

### Get Recruit Data
```
POST /webhook/wfg-app-get-recruit-data
Body: { "recruit_id": "..." } or { "recruit_email": "..." }
```

Returns complete recruit information including:
- Recruit details (name, email, contact info)
- Progress statistics (percentages, counts)
- All licensing steps with status
- All training steps with status

### Update Step Status
```
POST /webhook/wfg-app-step-update
Body: {
  "recruit_id": "...",
  "step_record_id": "...",
  "step_type": "licensing" or "training",
  "is_completed": true or false,
  "user_email": "...",
  "user_name": "..."
}
```

Triggers automatic:
- Step status update
- Progress recalculation
- Milestone detection
- Email notifications (if applicable)

## Configuration

### Environment Variables (Optional)

You can use environment variables instead of hardcoding the n8n URL:

Create a `.env` file:
```
VITE_N8N_BASE_URL=https://your-n8n-instance.com
```

Then update the CONFIG in `WFGOnboardingApp.jsx`:
```javascript
const CONFIG = {
  n8nBaseUrl: import.meta.env.VITE_N8N_BASE_URL || 'fallback-url',
  // ...
};
```

## Testing

### Manual Testing Checklist

- [ ] Load with valid recruit_id parameter
- [ ] Load with valid email parameter
- [ ] Load with invalid recruit (verify error handling)
- [ ] Toggle licensing step completion
- [ ] Toggle training step completion
- [ ] Expand and collapse step details
- [ ] Switch between Licensing and Training tabs
- [ ] Test on mobile device
- [ ] Test on different browsers
- [ ] Verify progress calculations are accurate
- [ ] Check milestone badges appear correctly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 11+)

**Not Supported:**
- Internet Explorer (any version)

## Performance

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## Troubleshooting

### "Network error" in production

**Solution:**
- Verify n8n URL uses `https://` not `http://`
- Check CORS is enabled in n8n workflows (`allowedOrigins: "*"`)
- Ensure n8n is accessible from the internet

### "Recruit not found"

**Solution:**
- Verify recruit ID exists in GoHighLevel
- Test the workflow directly with curl/Postman
- Check recruit ID format matches GHL format

### Changes not showing up

**Solution:**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Check Vercel deployment completed successfully

### Steps not updating when toggled

**Solution:**
- Check browser console for error messages
- Verify Workflow 7 is activated in n8n
- Test webhook directly
- Check GHL API credentials are valid

## Support

**System Owner:** Mark @ Tropoly
- Technical issues
- Feature requests
- Bug reports

**GHL Admin:** Chi
- Custom object issues
- API credentials
- Data structure questions

**End User Contact:** Jorge (WFG)
- Process validation
- User feedback
- Training materials

## License

Private - All rights reserved

## Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Icons by Lucide
- Automation powered by n8n
- Data managed by GoHighLevel

---

**Version:** 1.0.0  
**Last Updated:** February 2024  
**Created by:** Mark @ Tropoly
