# VERA-AI

VERA-AI is an internship showcase project for an enterprise AI assistant concept built around Retrieval-Augmented Generation, knowledge base search, and task-specific AI agents. The microsite presents a PETRONAS Upstream-focused assistant experience with chat, analytics, meetings, content, visual, podcast, and quiz workflows.

Live showcase: [https://upstream-vera-ai.vercel.app](https://upstream-vera-ai.vercel.app)

This repository is optimized as a portfolio-ready Next.js project that can run locally and deploy to Vercel. Some live AI and Firebase features require private credentials and cloud services, so the public showcase can be treated as a UI/product demo unless those services are configured.

## Live Demo

- Web app: [https://upstream-vera-ai.vercel.app](https://upstream-vera-ai.vercel.app)
- Demo walkthrough: [https://upstream-vera-ai.vercel.app/demo](https://upstream-vera-ai.vercel.app/demo)
- API key setup: [https://upstream-vera-ai.vercel.app/setup](https://upstream-vera-ai.vercel.app/setup)
- Presenter login: [https://upstream-vera-ai.vercel.app/login](https://upstream-vera-ai.vercel.app/login)

## Highlights

- VERA assistant interface with knowledge-oriented chat UX
- Six agent concepts: analytics, meetings, podcast, content, visual, and quiz
- Dashboard-style landing experience for exploring workflows
- Firebase integration points for Firestore, Storage, and Cloud Functions
- Optional Python service for local image generation experiments
- Documentation and demo materials collected under `docs/`
- Public setup page for bring-your-own API keys
- Presentation demo page with example agent flows

## Screenshots

### Microsite Preview

![VERA-AI laptop preview](public/OurCollaterals/Microsite-Preview-on-Laptop.png)

### Agent Examples

| Analytics Agent | Meeting Agent |
| --- | --- |
| ![Analytics Agent demo](docs/showcase-assets/analytical%20agent/Screenshot%202025-12-07%20114000.png) | ![Meeting Agent demo](docs/showcase-assets/meeting%20agent/Screenshot%202025-12-07%20114208.png) |

| Content Agent | Visual Agent |
| --- | --- |
| ![Content Agent demo](docs/showcase-assets/CONTENT%20AGENT/Screenshot%202025-12-07%20230357.png) | ![Visual Agent demo](docs/showcase-assets/image%20analyze%20agent/Screenshot%202025-12-07%20112120.png) |

| Podcast Agent | Quiz Agent |
| --- | --- |
| ![Podcast Agent demo](docs/showcase-assets/podcast%20agent/Screenshot%202025-12-07%20114715.png) | ![Quiz Agent demo](docs/showcase-assets/quiz%20agnet/Screenshot%202025-12-07%20113407.png) |

## Demo Materials

The repository includes sample inputs and presentation assets used for the internship demo:

- [Demo checklist](demo/VERA-demo-checklist.md)
- [Copy-paste prompts](demo/prompts_copypaste.txt)
- [Sample production data](demo/production_data.csv)
- [Sample meeting transcript](demo/meeting_transcript_sample.txt)
- [Content agent sample input](demo/content_agent_input.txt)
- [Presentation PDF](docs/showcase-assets/SIP%20Presentation%20VERA-AI%20Fakhrul%20Azim%20copy%201%20%282%29.pdf)

Use `/demo` in the hosted app for a quick guided overview of the example flows.

## Showcase Access

The hosted showcase has two access paths:

- Public mode: browse the interface and demo pages, or add personal OpenRouter/Gemini keys on `/setup`.
- Presenter mode: open `/login` and use the presenter credentials documented in [SETUP.md](./SETUP.md). A server session is created after login, so the private Vercel credentials are never placed in the browser.

If the live provider credentials are unavailable or rejected, presenter mode uses a clearly labelled demo-safe fallback response so the showcase remains usable. Public requests without a key return a no-key message instead of silently pretending to have live AI access.

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

The repository is designed to run from this folder after cloning. `.env.local`, generated output, raw internship data, and credential files are intentionally excluded from Git, so a fresh clone must be configured using `.env.example` and [SETUP.md](./SETUP.md).

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
