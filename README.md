[README.md](https://github.com/user-attachments/files/26162911/README.md)
# Valhalla TBI Case Navigator

Interactive TBI case pathway tool for personal injury attorneys. Answer 9 questions about your case and get a complete Valhalla clinical pathway — CognitraxX, NeuroSentinel P1/P2, CDL treatment, and imaging timing — updated live as you answer.

## Deploy to Vercel (5 minutes)

### Option A — GitHub + Vercel Dashboard
1. Push this folder to a new GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new) → Import the repo
3. Add environment variables (see below)
4. Click Deploy

### Option B — Vercel CLI (fastest)
```bash
npm i -g vercel
cd valhalla-navigator
vercel --prod
```
Follow the prompts. Add env vars when asked, or add them in the Vercel dashboard after.

---

## Environment Variables

Add these in your Vercel project → Settings → Environment Variables:

| Variable | Description | Required |
|---|---|---|
| `RESEND_API_KEY` | Resend API key for email lead notifications | Optional* |
| `NOTIFY_EMAIL` | Email that receives new leads. Defaults to `performance@valhallahealth.com` | Optional |

*The app works fully without Resend — leads just won't trigger email notifications. You can add it later.

### Getting a free Resend API key
1. Sign up at [resend.com](https://resend.com) — free tier is 3,000 emails/month
2. Dashboard → API Keys → Create API Key
3. Add your sending domain (or use `onboarding@resend.dev` for testing)
4. Paste the key as `RESEND_API_KEY` in Vercel

---

## What it does

**Left panel — 9-question intake flow:**
- Mechanism of injury
- LOC (Loss of Consciousness) status — ACRM 2023 criterion
- AOC (Alteration of Consciousness) status
- Time from incident to intake
- Current symptoms
- Insurance limits
- Prior TBI history
- Current treatment provider
- Primary case goal

**Right panel — live clinical flow chart:**
- Each answer activates nodes in the 6-phase pathway
- Active nodes expand with case-specific recommendations
- Classification node highlights Likely / Possible / No TBI with explanations
- Treatment nodes adapt based on symptoms, limits, and goals
- Imaging timing calculates the optimal DTI window
- Urgency flags trigger for over-30-day intake or chiropractor situations

**Lead capture modal** (appears when all 9 questions answered):
- Firm name, attorney name, email, phone
- Sends formatted HTML lead email to Valhalla via Resend
- Sends confirmation email to the attorney

---

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Resend** — transactional email for lead notifications
- **Zero UI dependencies** — all styling is hand-crafted inline CSS matching Valhalla brand identity (Bebas Neue, Cormorant Garamond, DM Mono, Barlow Condensed)
- Deploys as a static page with one serverless API route (`/api/lead`)

## Customization

- **Questions:** Edit `src/lib/questions.ts` to change any question text, options, or add questions
- **Flow logic:** The pathway logic lives in `src/components/Navigator.tsx` in the `classify()` call and the node state functions
- **Lead email template:** Edit the HTML template strings in `src/app/api/lead/route.ts`
- **Branding:** CSS variables are set in `src/app/globals.css` — `--gold`, `--ink`, `--mid` etc.
- **Notify email:** Set `NOTIFY_EMAIL` env var or edit the default in the API route
