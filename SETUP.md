# VERA-AI Setup Guide

This guide is for anyone cloning the repository and setting up the app from scratch.

## 1. Requirements

- Node.js 20.9 or newer
- npm
- Firebase project, if you want live Firestore, Storage, and Functions features
- OpenRouter API key, if you want text/agent generation
- Gemini API key, if you want image generation
- Vercel account, if you want to deploy the showcase

## 2. Install

```bash
npm install
```

## 3. Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

OPENROUTER_API_KEY=
GEMINI_API_KEY=
VERA_DEMO_ACCESS_CODE=
```

`OPENROUTER_API_KEY`, `GEMINI_API_KEY`, and `VERA_DEMO_ACCESS_CODE` must stay server-side. Do not rename them to `NEXT_PUBLIC_*` unless you intentionally want them visible in the browser.

## 4. Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful routes:

- `/` main VERA-AI showcase
- `/vera` assistant interface
- `/agents` all agent demos
- `/demo` presentation demo examples
- `/setup` API key and presenter access setup
- `/login` presenter login helper

## 5. Demo Access Modes

VERA-AI supports three practical demo modes.

### Presenter Mode

Use this when you own the deployment and want private API keys to stay in Vercel.

Set these in Vercel Project Settings:

```env
OPENROUTER_API_KEY=
GEMINI_API_KEY=
VERA_DEMO_ACCESS_CODE=
```

Then open `/login` and use:

```text
Username: admin123
Password: password123
```

Login creates a server-side presenter session. The optional demo access code field is useful for older clients or direct API testing, but it is not required for the current web login flow. The browser stores no server API keys.

After login, the sidebar should show `Presenter access active`. Use the `Logout` control in the sidebar or `/setup` to clear the session.

For a portfolio-only deployment, presenter mode also has a deterministic demo fallback when the configured provider is unavailable. For live AI responses, the `OPENROUTER_API_KEY` or `GEMINI_API_KEY` in Vercel must be valid, active, and permitted to use the selected model.

### Public Bring-Your-Own-Key Mode

Public users can open `/setup` and paste their own OpenRouter or Gemini key. These keys are stored only in their browser local storage.

### No Key Mode

If no key or demo access code is configured, live AI calls return:

```text
No API key configured
```

The UI and static demo pages still work for portfolio viewing.

## 6. Firebase Setup

Create a Firebase web app and copy the Firebase client config into `.env.local`.

For full cloud workflows:

```bash
cd functions
npm install
firebase deploy --only functions
```

Firestore and Storage rules are included in:

- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`

## 7. Vercel Deployment

Connect the GitHub repository in Vercel or use the CLI:

```bash
vercel deploy --prod
```

Add the same environment variables in Vercel:

- Firebase `NEXT_PUBLIC_*` values
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`
- `VERA_DEMO_ACCESS_CODE`

The current hosted showcase is:

```text
https://upstream-vera-ai.vercel.app
```

After changing environment variables, redeploy the Vercel project. Environment variables are not included in Git and cannot be recovered from a fresh clone.

## 8. Optional Python Image Service

The `python/` folder contains local image-generation experiments and is not required for the Vercel frontend.

```bash
cd python
pip install -r requirements.txt
python local_image_generator.py
```

## 9. Safety Notes

- Never commit `.env.local`.
- Rotate any API key that was ever committed or shared.
- The sample presenter credentials are showcase credentials, not production authentication. Replace the login implementation before using this app for real users.
- Raw internship data is ignored under `data/raw/`.
- Generated output folders and obvious credential filenames are ignored.
- `.vercelignore` keeps non-frontend project material out of Vercel uploads.
