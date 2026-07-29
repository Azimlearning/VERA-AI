# VERA AI Demo Setup

This folder contains everything you need to run a successful live demo of the VERA AI platform.

## Quick Start

1. **Start the tunnel:**
   ```powershell
   cd demo
   .\start-tunnel.ps1
   ```
   Copy the tunnel URL that appears (e.g., `https://random-words-1234.trycloudflare.com`)

2. **Start local image generator** (in separate terminal):
   ```powershell
   cd python
   python local_image_generator.py
   ```

3. **Test on demo laptop:**
   - Open tunnel URL in browser
   - Navigate to `/vera`
   - Test VERA chat

## Files in This Folder

- **`VERA-demo-checklist.md`** - Complete step-by-step demo checklist
- **`start-tunnel.ps1`** - Convenience script to start Cloudflare Tunnel
- **`tunnel-commands.txt`** - Quick reference for tunnel commands
- **`troubleshooting.md`** - Comprehensive troubleshooting guide
- **`prompts_copypaste.txt`** - Pre-written prompts for copy/paste during demo
- **`meeting_transcript_sample.txt`** - Sample meeting transcript for Meetings Agent
- **`production_data.csv`** - Sample CSV data for Analytics Agent
- **`content_agent_input.txt`** - Content Agent prompts (you provide)
- **`analyze_image/`** - Sample images for Visual Agent

## Demo Flow

Follow the checklist in `VERA-demo-checklist.md`:

1. **Phase 1**: Environment setup (tunnel, local generator, Firebase)
2. **Phase 2**: Prepare golden inputs (prompts, test files)
3. **Phase 3**: Live walkthrough (VERA Chat + 6 agents)
4. **Phase 4**: Fallbacks if something breaks
5. **Phase 5**: Post-demo cleanup

## Troubleshooting

If something goes wrong:
1. Check `troubleshooting.md` for common issues
2. Check browser console (F12) for errors
3. Check tunnel terminal for connection status
4. Check local generator terminal for errors

## Backup Options

If Cloudflare Tunnel fails:
- **Ngrok**: `ngrok http 3000`
- **Localtunnel**: `lt --port 3000`
- **Direct IP**: Use your laptop's IP (only works on same network)

See `tunnel-commands.txt` for all options.




