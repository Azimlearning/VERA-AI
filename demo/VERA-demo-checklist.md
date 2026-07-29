# VERA AI Live Demo Runbook

This is a concise, ready-to-run checklist for your live demo. It covers environment prep, golden inputs, and a step-by-step flow for VERA Chat plus all six agents. Prompts/test assets for Content Agent and Image Analyzer will be supplied separately by you.

## Phase 1 – Pre-Demo Environment Setup
- [ ] **Local image daemon**: In a terminal, run `python\run_local_generator.ps1` (or `python -m python.local_image_generator`). Confirm logs show "Listening…" and Firestore polling.
- [ ] **GPU & power**: Plug in laptop; set Windows to High Performance so local diffusion stays <15s.
- [ ] **Next.js app**: Start with `npm run dev` from repo root; open http://localhost:3000. Watch browser console for Firebase auth errors.
- [ ] **Firebase connection**: Ensure `.env.local` has `NEXT_PUBLIC_FIREBASE_*` values for the live project. Verify Firestore reads (no permission errors) via opening `/vera`.
- [ ] **Functions URLs**: If not using defaults, set:
  - `NEXT_PUBLIC_FUNCTIONS_URL` for `analyzeData` fallback.
  - `NEXT_PUBLIC_ANALYZE_IMAGE_URL`, `NEXT_PUBLIC_ANALYZE_MEETING_URL`, `NEXT_PUBLIC_SAVE_MEETING_TO_KB_URL`, `NEXT_PUBLIC_ANALYZE_MEETING_URL`, `NEXT_PUBLIC_ANALYZE_IMAGE_URL`.
- [ ] **API keys & quota**: Confirm OpenRouter/Gemini keys are valid and not rate-limited (cloud functions require `GOOGLE_GENAI_API_KEY`, `OPENROUTER_API_KEY`).
- [ ] **Knowledge base**: Load the target PDF/policies into KB and ensure embeddings generated (check Firestore `knowledgeBase` docs have `embedding` field).
- [ ] **Cloudflare Tunnel setup**: 
  - Install cloudflared: `winget install --id Cloudflare.cloudflared` (or download from GitHub)
  - Run tunnel: `cd demo; .\start-tunnel.ps1` OR manually: `cloudflared tunnel --url http://localhost:3000`
  - Copy the tunnel URL (e.g., `https://random-words-1234.trycloudflare.com`)
  - Test tunnel URL on demo laptop - verify VERA chat works
  - Keep tunnel terminal open during demo

## Phase 2 – Golden Inputs Ready
- [ ] Keep a text file open with pre-tested prompts (“golden prompts”) to copy/paste.
- [ ] Prepare `DEMO_FILES` folder on desktop with:
  - `meeting_transcript_sample.txt` (Meetings Agent).
  - `production_data.csv` (clean, small, with a clear trend; Analytics Agent).
  - `platform_rig.jpg` (Visual Agent).
- [ ] Optional: Have 1–2 KB PDFs open in the UI to cite during the demo.

## Phase 3 – Live Walkthrough (order for best narrative)

### 1) VERA Chat (truth & citations)
- [ ] Ask: “What are the 3 pillars of Systemic Shifts?” → confirm character-by-character streaming.
- [ ] Click a `[1]` citation chip → Source Verification panel shows correct PDF name + similarity score.
- [ ] Follow-up: “How does that impact our carbon targets?” → confirm context retention.

### 2) Content Agent (wow factor; you supply prompt)
- [ ] Submit the prewritten prompt (e.g., “Success Story about a new gas discovery.”).
- [ ] Show “Image Generating…” state; open terminal to show local generator logs (privacy + zero cost).
- [ ] Confirm generated write-up + image/visual concept displays.

### 3) Analytics Agent (data intelligence)
- [ ] Upload `production_data.csv`.
- [ ] Verify chart renders (Line/Bar via Recharts) and summary highlights the trend you planted.
- [ ] Mention RAG assist: cloud function `analyzeData` can pull KB context if `isQuery` is set.

### 4) Meetings Agent (productivity)
- [ ] Paste `meeting_transcript_sample.txt`.
- [ ] Check JSON-style sections: “Key Decisions” and “Action Items” with owners/dates.
- [ ] (Optional) Save to KB: click Save → confirm success toast (hits `saveMeetingToKnowledgeBase`).

### 5) Visual Agent (unstructured assets)
- [ ] Upload `platform_rig.jpg`.
- [ ] Verify auto-tags (expect #Offshore, #Safety, #Platform) and description.
- [ ] (Optional) Run compare/ocr modes if time allows.

### 6) Podcast Agent (accessibility)
- [ ] Select a short policy snippet from KB or paste a paragraph.
- [ ] Click “Generate Podcast” → show loading state while TTS runs; ensure audio player appears and is audible.

### 7) Quiz Agent (verification)
- [ ] Choose topic (e.g., “Carbon Capture”) or a KB document.
- [ ] Confirm questions generate in 5–10s; pick an answer → immediate Correct/Incorrect feedback with explanation.

## Phase 4 – Fallbacks & Recovery
- **Tunnel disconnects**: Restart with `cloudflared tunnel --url http://localhost:3000` (new URL - update bookmark). Backup: `ngrok http 3000` or `lt --port 3000`.
- If citations missing: remind audience RAG threshold is 0.65; try a KB-backed query.
- If image generation stalls: refresh local_image_generator terminal; fall back to `/api/generate-image` (Gemini 3) via UI if needed.
- If charts fail: switch to "query mode" in Analytics Agent with a natural-language question so the function leans on RAG text instead of CSV.
- If auth/Firestore errors: re-check `.env.local` and Firebase rules; reload page.

## Phase 5 – Post-Demo Reset
- [ ] Stop local generator when done.
- [ ] Clear any sensitive prompts from the screen.
- [ ] Keep `demo/VERA-demo-checklist.md` handy for next run.

Notes:
- Content Agent and Visual/Image Analyzer prompts/artifacts will be provided separately by you.
- Local generator watches Firestore `stories` collection; keep that tab open if showcasing live handoff.
- Use `npm run dev` + `python\run_local_generator.ps1` + Cloudflare Tunnel concurrently for the live demo.
- See `demo/troubleshooting.md` for tunnel issues and `demo/tunnel-commands.txt` for quick reference.

