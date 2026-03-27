# AI Interview Coach — Project Context

> Give this file to Claude when starting a new chat so it understands the full project state.

## What This Project Is

An AI-powered interview practice platform where users can do **voice** or **text** mock interviews and get instant AI-generated feedback with a scored radar chart. Built with Next.js 15 (App Router), Firebase, Vapi (voice AI), and Google Gemini.

**Repo:** `https://github.com/DevNiiNartey/AI-Interview-Coach.git`
**Branch:** `dev` (primary working branch)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.3.8 (App Router, Turbopack) |
| Language | TypeScript 5, React 19 |
| Auth & DB | Firebase Auth + Firestore (client SDK 11.8.1, admin SDK 13.4.0) |
| Voice AI | Vapi Web SDK (`@vapi-ai/web` 2.5.2) — browser-based voice calls |
| LLM | Google Gemini (`@google/generative-ai` 0.24.1) via `gemini-2.0-flash` |
| Charts | Recharts 3.8.1 (radar chart for scorecard) |
| Styling | Tailwind CSS 4 + shadcn/ui + custom CSS utilities |
| Forms | React Hook Form + Zod |
| Notifications | Sonner (toast) |
| Font | Mona Sans (Google Fonts) |
| Theme | Dark mode forced (`<html className="dark">`) |

---

## Project Structure

```
AI-Interview-Coach/
├── app/
│   ├── (auth)/                          # Auth route group
│   │   ├── layout.tsx                   # Centered layout
│   │   ├── sign-in/page.tsx             # Sign in (force-dynamic)
│   │   └── sign-up/page.tsx             # Sign up (force-dynamic)
│   ├── (root)/                          # Protected route group
│   │   ├── layout.tsx                   # Nav bar with logo
│   │   ├── page.tsx                     # Dashboard — fetches real interviews from Firestore
│   │   └── interview/
│   │       ├── page.tsx                 # Interview setup (role, tech, mode selection)
│   │       └── [id]/
│   │           ├── page.tsx             # Active interview session (voice or text)
│   │           └── feedback/page.tsx    # Post-interview scorecard
│   ├── api/vapi/route.ts               # Vapi webhook (call.started, call.ended)
│   ├── layout.tsx                       # Root layout (Mona Sans, Toaster, dark mode)
│   └── globals.css                      # Tailwind config + custom utilities
├── components/
│   ├── Agents.tsx                       # Voice interview — Vapi integration, transcript capture
│   ├── TextInterview.tsx                # Text interview — chat UI, STAR method hints
│   ├── InterviewSetup.tsx               # Setup form — role/level/type/tech/mode selection
│   ├── Scorecard.tsx                    # Radar chart + score breakdown (Recharts)
│   ├── InterviewCard.tsx                # Interview card — fetches real feedback
│   ├── AuthForm.tsx                     # Sign in/up form (Firebase Auth)
│   ├── DisplayTechIcons.tsx             # Tech stack icons from DevIcon CDN
│   ├── FormField.tsx                    # Generic form field wrapper
│   └── ui/                              # shadcn/ui (button, form, input, label, sonner)
├── firebase/
│   ├── admin.ts                         # Firebase Admin SDK (server-side, graceful if no creds)
│   └── client.ts                        # Firebase Client SDK (client-side auth + Firestore)
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts               # signUp, signIn, setSessionCookie, getCurrentUser, isAuthenticated
│   │   └── interview.action.ts          # createInterview, getInterviewById, getInterviewsByUserId,
│   │                                    # getLatestInterviews, saveTranscript, generateFeedback,
│   │                                    # getFeedbackById, getFeedbackByInterviewId, generateTextResponse
│   ├── utils.ts                         # cn(), getTechLogos(), getRandomInterviewCover()
│   └── vapi.ts                          # Vapi client singleton + createInterviewAssistant()
├── constants/index.ts                   # mappings, interviewCovers, feedbackSchema (Zod),
│                                        # roleOptions, levelOptions, interviewTypeOptions, techStackOptions
├── types/
│   ├── index.d.ts                       # All interfaces: Interview, Feedback, User, etc.
│   └── vapi.d.ts                        # Vapi message enums + interfaces
├── middleware.ts                         # Route protection (session cookie check)
├── .env.example                         # Template for all required env vars
├── next.config.ts                       # ESLint/TS ignore, image domains
├── package.json                         # All dependencies listed
└── tsconfig.json                        # Standard Next.js TS config
```

---

## Firestore Collections

```
/users/{uid}
  - name: string
  - email: string

/interviews/{interviewId}
  - role: string
  - level: string ("Junior" | "Mid-Level" | "Senior" | "Lead" | "Principal")
  - questions: string[]
  - techstack: string[]
  - type: string ("Technical" | "Behavioral" | "Mixed")
  - mode: "voice" | "text"
  - userId: string
  - finalized: boolean
  - createdAt: string (ISO)
  - transcript?: { role: string; content: string }[]
  - feedbackId?: string
  - callId?: string (Vapi call ID)

/feedback/{feedbackId}
  - interviewId: string
  - userId: string
  - totalScore: number (0-100)
  - categoryScores: Array<{ name: string; score: number; comment: string }>
    Categories: Communication Skills, Technical Knowledge, Problem Solving,
                Cultural Fit, Confidence and Clarity, Structure and Organization
  - strengths: string[]
  - areasForImprovement: string[]
  - finalAssessment: string
  - createdAt: string (ISO)
```

---

## Auth Flow

1. **Sign-Up**: Firebase `createUserWithEmailAndPassword` (client) → `signUp` server action saves to Firestore `/users/{uid}`
2. **Sign-In**: Firebase `signInWithEmailAndPassword` (client) → gets `idToken` → `signIn` server action creates 7-day session cookie
3. **Session**: `getCurrentUser()` verifies session cookie via Firebase Admin → fetches user from Firestore
4. **Middleware**: Checks `session` cookie — protected routes redirect to `/sign-in`, auth routes redirect to `/`

---

## Core User Flow

1. Sign up / Sign in → Dashboard
2. Click "Start an Interview" → `/interview` setup page
3. Select mode (voice/text), role, level, type, tech stack → Click "Start"
4. `createInterview` server action calls Gemini to generate questions → saves to Firestore → redirects to `/interview/[id]`
5. **Voice mode**: Vapi Web SDK connects, AI interviewer speaks, user responds, transcript captured in real-time
6. **Text mode**: Chat UI, AI asks questions via `generateTextResponse`, user types answers, STAR method hints available
7. End interview → `saveTranscript` + `generateFeedback` (Gemini analyzes transcript, scores 6 categories)
8. Redirect to `/interview/[id]/feedback` → Scorecard with radar chart, category breakdowns, strengths, improvements
9. Dashboard shows all interviews with real scores

---

## Environment Variables Required

```env
# Firebase Client (used in browser — existing app uses non-prefixed names)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

# Firebase Admin (server-side only)
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Vapi Voice AI
NEXT_PUBLIC_VAPI_WEB_TOKEN=

# Google AI (Gemini)
GOOGLE_AI_KEY=
```

---

## What's Implemented (MVP)

- [x] Auth system (sign-up, sign-in, session cookies, route protection)
- [x] Interview setup page (role, tech stack, level, type, mode selection)
- [x] AI question generation via Gemini
- [x] Voice interview via Vapi (real-time conversation, transcript capture)
- [x] Text interview (chat UI, STAR method scaffolding)
- [x] AI feedback generation (6-category scoring via Gemini)
- [x] Scorecard page with Recharts radar chart
- [x] Dashboard with real Firestore data (completed + pending interviews)
- [x] Interview history with real feedback scores
- [x] Middleware route protection
- [x] Vapi webhook endpoint

## What's NOT Implemented Yet (Post-MVP)

- [ ] Free tier limits (3 interviews/month)
- [ ] Payment integration (Stripe or Lemon Squeezy)
- [ ] Gamification (streaks, XP, weekly challenges, leaderboards)
- [ ] AI interviewer personas (difficulty levels, styles)
- [ ] Communication analytics (filler words, pacing, tone)
- [ ] Salary negotiation practice
- [ ] Job description URL import
- [ ] Company-specific prep packs
- [ ] Self-assessment gap analysis
- [ ] Session recording & playback
- [ ] Sign-out button
- [ ] Error pages (404, 500)

---

## Known Issues / Notes

- `firebase/client.ts` uses `process.env.FIREBASE_API_KEY` (non-`NEXT_PUBLIC_` prefixed) — this is the existing pattern from before our changes. The user's `.env.local` likely uses these names. If client-side Firebase breaks, the env var names may need `NEXT_PUBLIC_` prefix.
- `firebase/client.ts` line 29: `!getApps.length` should be `!getApps().length` — pre-existing bug, works because of module caching.
- Firebase Admin gracefully returns null if credentials are missing (won't crash the build).
- Build compiles clean with `next build` (tested). Pages are all dynamic (`ƒ`).
- The Vapi integration uses `@vapi-ai/web` which requires a browser with microphone access.
- Gemini model used: `gemini-2.0-flash` for both question generation and feedback scoring.

---

## Commit History Style

The repo uses conventional-ish commits: `feat:`, `fix:`, `chore:`, descriptive messages. Example:
```
feat: Add interview generation page and agent component
fix(config): allow production builds with ESLint errors
```
