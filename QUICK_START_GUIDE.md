# 🚀 VERA AI - Quick Start Guide

**Project Status:** ✅ **MOSTLY READY** - One critical step needed

---

## ⚡ IMMEDIATE ACTION REQUIRED

Your project is **95% ready to go!** You just need to create one file:

### 1. Create `.env.local` File (2 minutes)

**Step 1:** Get your Firebase configuration
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **systemicshiftv2**
3. Click ⚙️ (Settings) → **Project Settings**
4. Scroll to **"Your apps"** → Click Web app icon `</>`
5. Copy the config values

**Step 2:** Create the file
```powershell
# Copy the template
Copy-Item ENV_TEMPLATE.txt .env.local

# Then edit .env.local with your actual values
notepad .env.local
```

**Step 3:** Replace these values in `.env.local`:
- `your_api_key_here` → Your actual API key
- `your_sender_id_here` → Your actual sender ID
- `your_app_id_here` → Your actual app ID
- `your_measurement_id_here` → Your actual measurement ID

---

## 🎯 START THE APPLICATION

After creating `.env.local`:

```powershell
# Start the development server
npm run dev
```

Visit: **http://localhost:3000**

That's it! Your VERA AI platform should now be running! 🎉

---

## ✅ WHAT'S ALREADY WORKING

- ✅ **All dependencies installed** (node_modules)
- ✅ **Firebase CLI configured** (connected to systemicshiftv2)
- ✅ **All source files present**
- ✅ **Node.js v24.11.0** (perfect!)
- ✅ **Configuration files ready** (firebase.json, firestore.rules, etc.)
- ✅ **Git repository stable** (reverted to stable version)

---

## 📱 FEATURES TO TEST

Once running, test these features:

### Core Features
- 🏠 **Homepage**: http://localhost:3000
- 🤖 **VERA AI Chatbot**: http://localhost:3000/vera
- 🎯 **AI Agents**: http://localhost:3000/agents
- 📊 **StatsX Dashboard**: http://localhost:3000/statsx
- 📅 **MeetX**: http://localhost:3000/meetx

### AI Agents
- 📈 **Analytics Agent**: `/agents/analytics`
- ✍️ **Content Agent**: `/agents/content`
- 👥 **Meetings Agent**: `/agents/meetings`
- 🎙️ **Podcast Agent**: `/agents/podcast`
- 🎨 **Visual Agent**: `/agents/visual`
- 📝 **Quiz Agent**: `/agents/quiz`

---

## 🔍 TROUBLESHOOTING

### If the app doesn't start:
```powershell
# Check if .env.local exists
Test-Path .env.local

# Check if it has content
Get-Content .env.local

# Make sure no typos in variable names
# All variables must start with NEXT_PUBLIC_
```

### If you see Firebase errors:
- Double-check your API key and other values in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env.local`

### If you see "Module not found" errors:
```powershell
# Reinstall dependencies
npm install

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Try again
npm run dev
```

---

## 📚 OPTIONAL: Set Up Local Image Generator

**Only needed if you want to generate AI images locally (using your GPU)**

```powershell
# Navigate to python folder
cd python

# Create virtual environment
python -m venv .venv

# Activate it
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install PyTorch with CUDA (if you have NVIDIA GPU)
# Visit: https://pytorch.org/get-started/locally/
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Download Firebase service account key
# From: Firebase Console → Project Settings → Service Accounts → Generate new private key
# Save as: python/firebase-key.json

# Set environment variables
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\User\Documents\Coding\SIP\Systemic Shifts Microsite\python\firebase-key.json"
$env:HF_API_TOKEN="your_huggingface_token"

# Run the generator
python local_image_generator.py
```

**Note:** This is optional. The app works fine without it. You only need this if you're generating custom images.

---

## 📖 FULL DOCUMENTATION

For detailed information, see:
- `SETUP_VERIFICATION_REPORT.md` - Complete verification report
- `Documentation_files/SETUP.md` - Detailed setup guide
- `Documentation_files/FULL_DOCUMENTATION.md` - Platform architecture
- `Documentation_files/TESTING.md` - Testing procedures

---

## ⚙️ HELPFUL COMMANDS

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check Firebase project
firebase use

# List Firebase projects
firebase projects:list

# Deploy to Firebase (when ready)
firebase deploy
```

---

## 🎉 SUMMARY

**What you need to do:**
1. Create `.env.local` with your Firebase config (2 minutes)
2. Run `npm run dev`
3. Open http://localhost:3000
4. Start using VERA AI! 🚀

**Everything else is already set up and ready to go!**

---

## 🆘 NEED HELP?

If you encounter any issues:
1. Check `SETUP_VERIFICATION_REPORT.md` for detailed diagnostics
2. Review the documentation in `Documentation_files/`
3. Check the browser console for error messages
4. Ensure `.env.local` has correct values from Firebase Console

---

**Last Updated:** December 6, 2025  
**Project:** VERA AI (Systemic Shifts Microsite)  
**Status:** ✅ Ready to start after creating `.env.local`

