# VERA-AI

VERA-AI is an internship showcase project for an enterprise AI assistant concept built around Retrieval-Augmented Generation, knowledge base search, and task-specific AI agents. The microsite presents a PETRONAS Upstream-focused assistant experience with chat, analytics, meetings, content, visual, podcast, and quiz workflows.

Live showcase: [https://upstream-vera-ai.vercel.app](https://upstream-vera-ai.vercel.app)

This repository is optimized as a portfolio-ready Next.js project that can run locally and deploy to Vercel. Some live AI and Firebase features require private credentials and cloud services, so the public showcase can be treated as a UI/product demo unless those services are configured.

## Highlights

- VERA assistant interface with knowledge-oriented chat UX
- Six agent concepts: analytics, meetings, podcast, content, visual, and quiz
- Dashboard-style landing experience for exploring workflows
- Firebase integration points for Firestore, Storage, and Cloud Functions
- Optional Python service for local image generation experiments
- Documentation and demo materials collected under `docs/`
- Public setup page for bring-your-own API keys
- Presentation demo page with example agent flows

## Tech Stack

- Next.js 16 with the App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- Firebase client SDK and Firebase Functions
- Recharts
- Optional Python image generation utilities

## Project Structure

```text
VERA-AI/
├── src/
│   ├── app/                 # Next.js routes and API handlers
│   ├── components/          # UI, layout, chat, and agent components
│   └── lib/                 # Firebase, AI clients, analytics, helpers
├── functions/               # Firebase Cloud Functions source
├── python/                  # Optional local image generation service
├── public/                  # Static images and brand assets
├── demo/                    # Demo prompts and sample input files
├── docs/
│   ├── project-documentation/
│   └── showcase-assets/     # Screenshots and presentation material
├── data/raw/                # Local-only raw internship files
├── .env.example
├── SETUP.md
└── package.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Then add your Firebase and optional AI provider values in `.env.local`.

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

For full setup details, see [SETUP.md](./SETUP.md).

## Useful Scripts

```bash
npm run dev      # Start local Next.js development server
npm run build    # Create a production build
npm run start    # Run the production build locally
npm run lint     # Run ESLint
```

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Keep the framework preset as `Next.js`.
4. Add the required environment variables from `.env.example`.
5. Deploy.

For a simple portfolio showcase, the frontend can be deployed first. Firebase Functions, RAG retrieval, and provider-backed AI generation should be configured separately when you want the live cloud workflows enabled.

Current production deployment:

[https://upstream-vera-ai.vercel.app](https://upstream-vera-ai.vercel.app)

## Notes

- `.env.local`, raw data, output files, and obvious credential files are ignored by Git.
- Public users can open `/setup` to use their own API keys.
- Presenter demos can use Vercel server-side API keys with `VERA_DEMO_ACCESS_CODE`.
- The old project documentation has been moved to `docs/project-documentation/`.
- Local showcase screenshots and presentation material live in `docs/showcase-assets/`.
- The Python service is optional and not required for the Vercel frontend deployment.
