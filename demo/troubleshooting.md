# Cloudflare Tunnel Troubleshooting Guide

## Quick Fixes for Common Issues

### Issue 1: Tunnel Won't Start

**Symptoms:**
- `cloudflared: command not found`
- Error connecting to localhost:3000

**Solutions:**
1. **Install cloudflared:**
   ```powershell
   winget install --id Cloudflare.cloudflared
   ```
   Or download from: https://github.com/cloudflare/cloudflared/releases

2. **Verify Next.js is running:**
   ```powershell
   curl http://localhost:3000
   # Or open http://localhost:3000 in browser
   ```

3. **Check if port 3000 is in use:**
   ```powershell
   netstat -ano | findstr :3000
   ```

4. **Try different port:**
   ```powershell
   # In one terminal: npm run dev -- -p 3001
   # In another: cloudflared tunnel --url http://localhost:3001
   ```

---

### Issue 2: Tunnel URL Not Accessible from Demo Laptop

**Symptoms:**
- Can't connect to tunnel URL
- Timeout errors
- "Connection refused"

**Solutions:**
1. **Check tunnel is still running:**
   - Look at tunnel terminal - should show "Connection established"
   - If closed, restart: `cloudflared tunnel --url http://localhost:3000`

2. **Verify URL is correct:**
   - URL format: `https://random-words-1234.trycloudflare.com`
   - Must use HTTPS (not HTTP)
   - Copy exact URL from tunnel terminal

3. **Check firewall:**
   ```powershell
   # Allow cloudflared through Windows Firewall
   # Control Panel → Windows Defender Firewall → Allow an app
   ```

4. **Try backup tunnel:**
   - Ngrok: `ngrok http 3000`
   - Localtunnel: `lt --port 3000`

---

### Issue 3: Functions Not Working Through Tunnel

**Symptoms:**
- VERA chat doesn't respond
- Agents fail to load
- CORS errors in console

**Solutions:**
1. **Functions are cloud-hosted - tunnel doesn't affect them:**
   - Check browser console for actual errors
   - Verify `.env.local` has correct function URLs:
     ```
     NEXT_PUBLIC_FUNCTIONS_URL=https://us-central1-systemicshiftv2.cloudfunctions.net
     ```

2. **Check Firebase connection:**
   - Open browser console (F12)
   - Look for Firebase auth/connection errors
   - Verify `.env.local` has all `NEXT_PUBLIC_FIREBASE_*` values

3. **Test direct function call:**
   ```powershell
   # Test askChatbot function
   $body = @{ message = "test" } | ConvertTo-Json
   Invoke-RestMethod -Uri "https://askchatbot-el2jwxb5bq-uc.a.run.app" -Method POST -Body $body -ContentType "application/json"
   ```

---

### Issue 4: Local Image Generator Not Working

**Symptoms:**
- Content Agent submits but no image generates
- No logs in local generator terminal
- Image status stays "pending"

**Solutions:**
1. **Check local generator is running:**
   ```powershell
   cd python
   python local_image_generator.py
   # Should show "Listening for new stories..."
   ```

2. **Verify Firebase credentials:**
   - Check `python/firebase-key.json` exists
   - Or set: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\firebase-key.json"`

3. **Test Firestore connection:**
   ```powershell
   cd python
   python -c "from google.cloud import firestore; db = firestore.Client(); print('Connected to Firestore')"
   ```

4. **Check Firestore rules:**
   - Firebase Console → Firestore → Rules
   - Service account should have read/write access

5. **Check story document:**
   - Firebase Console → Firestore → `stories` collection
   - Verify story has `aiInfographicConcept` with `title` field
   - Check `imageGenerationStatus` field

---

### Issue 5: Firebase Auth Not Working

**Symptoms:**
- Can't log in
- Redirect errors
- "Unauthorized domain" errors

**Solutions:**
1. **Add tunnel URL to authorized domains:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your tunnel URL (e.g., `random-words-1234.trycloudflare.com`)

2. **Or use email/password auth:**
   - No redirect needed
   - Works with any domain

3. **Check `.env.local`:**
   - Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is correct
   - Should be: `systemicshiftv2.firebaseapp.com`

---

### Issue 6: Tunnel Disconnects During Demo

**Symptoms:**
- Tunnel URL stops working mid-demo
- "Connection lost" in tunnel terminal

**Solutions:**
1. **Quick restart:**
   ```powershell
   # Press Ctrl+C to stop tunnel
   # Then restart:
   cloudflared tunnel --url http://localhost:3000
   # Copy new URL (it will be different)
   ```

2. **Have backup ready:**
   - Keep ngrok/localtunnel installed
   - Can switch in 30 seconds if needed

3. **Prevent disconnection:**
   - Keep laptop plugged in
   - Disable sleep mode: `powercfg /change standby-timeout-ac 0`
   - Keep tunnel terminal visible

---

### Issue 7: Slow Performance Through Tunnel

**Symptoms:**
- Slow page loads
- Streaming responses lag
- Timeouts

**Solutions:**
1. **This is normal for free tunnels:**
   - Cloudflare Tunnel free tier has some latency
   - Functions still run fast (they're cloud-hosted)

2. **Optimize what you can:**
   - Keep demo laptop on same network if possible
   - Close unnecessary apps
   - Use wired connection if available

3. **Acceptable for demo:**
   - 1-2 second delay is fine for demo
   - Focus on showing functionality, not speed

---

## Emergency Fallback Plan

If Cloudflare Tunnel completely fails:

1. **Switch to Ngrok (30 seconds):**
   ```powershell
   ngrok http 3000
   # Copy HTTPS URL
   ```

2. **Switch to Localtunnel (30 seconds):**
   ```powershell
   lt --port 3000
   # Copy URL
   ```

3. **Use Direct IP (same network only):**
   ```powershell
   ipconfig
   # Find IPv4 address (e.g., 192.168.1.100)
   # Use: http://192.168.1.100:3000
   # Only works if demo laptop is on same WiFi
   ```

4. **Screen share instead:**
   - Use Zoom/Teams screen share
   - Present from your laptop directly
   - No tunnel needed

---

## Pre-Demo Checklist

Before starting demo, verify:

- [ ] Cloudflare Tunnel running and URL copied
- [ ] Test tunnel URL on demo laptop - page loads
- [ ] Test VERA chat - responds correctly
- [ ] Test one agent (Analytics) - works
- [ ] Local image generator running - shows "Listening..."
- [ ] Browser console has no errors
- [ ] Backup tunnel option ready (ngrok/localtunnel)
- [ ] `.env.local` has all required values
- [ ] Firebase credentials valid (`firebase-key.json` exists)

---

## Getting Help

If issues persist:

1. Check browser console (F12) for errors
2. Check tunnel terminal for connection status
3. Check local generator terminal for errors
4. Verify all services are running:
   - Next.js: `http://localhost:3000`
   - Local generator: Python script running
   - Tunnel: `cloudflared tunnel --url http://localhost:3000`




