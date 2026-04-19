# RMS — RMI Resource Management System
## Deployment & Maintenance Guide

---

## WHAT'S IN THIS FOLDER

```
rms/
├── index.html        ← Main app (open this in browser)
├── manifest.json     ← Makes it installable on mobile (PWA)
├── css/
│   └── style.css     ← All styling
├── js/
│   ├── data.js       ← All data + localStorage persistence
│   └── app.js        ← All app logic
└── README.md         ← This file
```

---

## HOW TO DEPLOY (Free — 10 minutes)

### Option 1 — Vercel (Recommended)

1. Go to https://github.com → Create free account
2. Click **New Repository** → name it `rms` → Create
3. Upload all files (drag and drop into GitHub)
4. Go to https://vercel.com → Sign in with GitHub
5. Click **Add New Project** → Select your `rms` repo
6. Click **Deploy**
7. Done — you get a live link like `rms.vercel.app`

Share that link with your team. Works on any phone or laptop.

### Option 2 — Netlify (Also free)

1. Go to https://netlify.com
2. Drag your entire `rms` folder onto the deploy area
3. Done — you get a link like `rms.netlify.app`

### Option 3 — GitHub Pages (Also free)

1. Upload to GitHub (step 1-3 above)
2. Go to repo **Settings → Pages**
3. Set source to `main` branch
4. Link: `yourusername.github.io/rms`

---

## HOW TO MAKE IT AN APK (Android App)

After deploying to Vercel/Netlify:

1. Go to https://pwabuilder.com
2. Paste your live URL
3. Click **Package for Android**
4. Download the APK → Share via WhatsApp/Drive

Or use https://webintoapp.com — paste URL, set name as RMS,
upload logo → download APK directly.

---

## HOW TO MAINTAIN IT

### Adding New Users
Only the Master Admin can do this inside the app.
But you can also add them directly in `js/data.js`:

```js
// Find DEFAULT_USERS array and add:
{ id:'USR-0013', name:'New Person', username:'newperson', password:'theirpassword', team:'ALPHA', role:'member' },
```

After editing, redeploy (just re-upload to Vercel/Netlify).

### Changing the Master Admin Password
Open `js/data.js` → find the first entry in DEFAULT_USERS:
```js
{ id:'USR-0001', name:'Arjun R.', username:'master', password:'master123', ... }
```
Change `password:'master123'` to whatever you want.

⚠️ IMPORTANT: After changing data.js, you need to clear
localStorage in the browser once so new defaults load.
Press F12 → Console → type: `localStorage.clear()` → Enter

### Adding More Teams
Open `js/data.js` → find `var TEAM_NAMES` → add your team:
```js
var TEAM_NAMES = ['ALPHA','BETA','GAMMA', ... 'YOURTEAM'];
```
Also add a color in TEAM_COLORS:
```js
var TEAM_COLORS = { ..., YOURTEAM:'#FF6B6B' };
```

### Adding Default Inventory
Open `js/data.js` → find `DEFAULT_INVENTORY` → add items:
```js
{ id:'INV-020', name:'Your Component', qty:10, unit:'pcs', cat:'Electronics' },
```

### Adding Default Links
Open `js/data.js` → find `DEFAULT_LINKS` → add:
```js
{ id:'LK-005', title:'Your Link Title', url:'https://...', desc:'Description', cat:'Finance' },
```

---

## DATA PERSISTENCE

Currently data is saved in **localStorage** (the user's browser).
This means:
- ✅ Data survives page refresh
- ✅ Works offline after first load
- ❌ Data is per-device (not shared between team members)

### For SHARED data across all team members:
You need a backend database. Recommended: **Supabase** (free).

Steps:
1. Go to https://supabase.com → Create free project
2. Create tables: users, inventory, transactions, tasks, treasury, links
3. Replace localStorage calls in `data.js` with Supabase API calls
4. This takes about 2-3 hours of setup

Contact a developer or come back to Claude for help with this step.

---

## RESETTING ALL DATA

If you want to clear all data and start fresh:
1. Open the site in browser
2. Press F12 (DevTools) → Console tab
3. Type: `localStorage.clear()` → Press Enter
4. Refresh the page

---

## CUSTOM DOMAIN (Optional)

On Vercel:
1. Go to your project → Settings → Domains
2. Add your domain (e.g. rms.rmiclub.in)
3. Follow DNS instructions from Vercel

---

## UPDATING THE APP

Whenever you make changes to the code:
1. Edit the files locally
2. Upload the changed files to GitHub
3. Vercel auto-deploys in ~30 seconds

---

## SUPPORT

For changes, new features, or bugs — bring the code back to
Claude and describe what you want changed.

Keep this README file — it has everything you need.
