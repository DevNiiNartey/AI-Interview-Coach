# API Keys & Secret Keys Setup Guide

This guide walks you through getting every key needed to run the AI Interview Coach.

---

## 1. Firebase Keys (Auth + Database)

You need **two sets** of Firebase credentials: client-side (for the browser) and admin (for the server).

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or use your existing `ai-coach-nat` project)
3. Follow the setup wizard (you can disable Google Analytics if you want)

### Step 2: Enable Authentication

1. In Firebase Console → **Build** → **Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider

### Step 3: Create Firestore Database

1. In Firebase Console → **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **production mode** (or test mode for development)
4. Select a region close to your users

### Step 4: Get Client-Side Keys

1. In Firebase Console → Click the **gear icon** (Project Settings)
2. Scroll to **"Your apps"** section
3. If no web app exists, click the **web icon** (`</>`) to register one
4. Copy these values from the config object:

```env
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

### Step 5: Get Admin/Service Account Keys

1. In Firebase Console → **Project Settings** (gear icon)
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. A JSON file will download. Open it and extract:

```env
FIREBASE_PROJECT_ID=your-project-id          # Same as client-side
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

**Important:** The `FIREBASE_PRIVATE_KEY` must be wrapped in **double quotes** in your `.env.local` file because it contains newlines (`\n`).

---

## 2. Vapi Key (Voice AI)

Vapi handles the real-time voice interview conversations.

### Step 1: Create a Vapi Account

1. Go to [vapi.ai](https://vapi.ai/) and sign up
2. You get free credits to start (enough for testing)

### Step 2: Get Your Web Token

1. After signing in, go to the [Vapi Dashboard](https://dashboard.vapi.ai/)
2. Navigate to **"Organization"** → **"API Keys"** (left sidebar)
3. You'll see your **Public Key** — this is your web token
4. Copy it:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-public-key
```

**Note:** This is the **public** key (safe for browser use), not the private/secret key. The `NEXT_PUBLIC_` prefix is required so Next.js exposes it to the browser.

### Vapi Pricing

- Free tier gives you trial credits
- After that: ~$0.05/minute for voice calls
- See [vapi.ai/pricing](https://vapi.ai/pricing) for current rates

---

## 3. Google AI Key (Gemini)

Google Gemini generates interview questions and analyzes transcripts for feedback scoring.

### Step 1: Get an API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API key"** in the top left
4. Click **"Create API key"**
5. Select a Google Cloud project (or create a new one)
6. Copy the generated key:

```env
GOOGLE_AI_KEY=AIzaSy...
```

### Google AI Pricing

- **Free tier**: 15 RPM (requests per minute), 1 million tokens/minute — generous for development
- **Paid**: $0.10 per 1M input tokens, $0.40 per 1M output tokens for `gemini-2.0-flash`
- See [ai.google.dev/pricing](https://ai.google.dev/pricing) for current rates

---

## 4. Putting It All Together

Create a file called `.env.local` in the project root (`AI-Interview-Coach/.env.local`):

```env
# Firebase Client
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_MEASUREMENT_ID=G-XXXXXXX

# Firebase Admin
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"

# Vapi (Voice AI)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your-vapi-public-key

# Google AI (Gemini)
GOOGLE_AI_KEY=AIzaSy...
```

**Security:** `.env.local` is already in `.gitignore` — it will never be committed.

---

## 5. Verify Everything Works

```bash
cd AI-Interview-Coach
npm run dev
```

Then test:

1. **Auth**: Go to `http://localhost:3000/sign-up` → create account → sign in
2. **Interview creation**: Click "Start an Interview" → select options → click Start → should generate questions and redirect
3. **Text interview**: Choose text mode → chat with AI → end → see scorecard
4. **Voice interview**: Choose voice mode → allow microphone → speak with AI → end → see scorecard
5. **Dashboard**: Should show your completed interviews with real scores

### Troubleshooting

| Issue | Likely Cause |
|-------|-------------|
| "Firebase: Error (auth/invalid-api-key)" | Wrong or missing `FIREBASE_API_KEY` |
| "Service account must contain project_id" | Missing Firebase Admin env vars |
| "NEXT_PUBLIC_VAPI_WEB_TOKEN is not set" | Missing Vapi token |
| Voice interview won't connect | Wrong Vapi key, or browser blocked microphone |
| "Failed to create interview" | Missing `GOOGLE_AI_KEY` or Gemini quota exceeded |
| Feedback generation fails | Gemini returned invalid JSON — retry or check quota |

---

## Quick Links

- [Firebase Console](https://console.firebase.google.com/)
- [Vapi Dashboard](https://dashboard.vapi.ai/)
- [Google AI Studio](https://aistudio.google.com/)
- [Vapi Docs](https://docs.vapi.ai/)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
