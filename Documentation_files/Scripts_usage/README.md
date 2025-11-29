# Scripts Usage Documentation

Documentation for utility scripts in the `Scripts_usage/` directory.

## Overview

These PowerShell scripts help with development, testing, and maintenance tasks for the Systemic Shifts Microsite project.

## Scripts

### 1. start-dev.ps1

**Purpose:** Start the Next.js development server with automatic cleanup

**Usage:**
```powershell
.\start-dev.ps1
```

**What it does:**
- Navigates to the project directory
- Checks for existing lock files and cleans them up
- Kills any processes using ports 3000 or 3001
- Checks if `node_modules` exists and installs dependencies if needed
- Starts the Next.js development server with `npm run dev`

**Parameters:** None

**Examples:**
```powershell
# Basic usage
.\start-dev.ps1

# Run from any directory (script finds project root)
cd C:\Users\User\Documents
.\Scripts_usage\start-dev.ps1
```

**Troubleshooting:**
- If port is still in use, manually kill the process:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
  ```
- If lock file persists, manually delete: `.next\dev\lock`

---

### 2. stop-dev.ps1

**Purpose:** Stop the Next.js development server

**Usage:**
```powershell
.\stop-dev.ps1
```

**What it does:**
- Finds processes using ports 3000 or 3001
- Kills those processes
- Removes lock files if they exist
- Provides feedback on success/failure

**Parameters:** None

**Examples:**
```powershell
# Stop dev server
.\stop-dev.ps1
```

**Output:**
- Success message if server was stopped
- "No dev server found" if nothing was running

---

### 3. trigger-analysis.ps1

**Purpose:** Manually trigger image generation for a specific story

**Usage:**
```powershell
.\trigger-analysis.ps1
```

**What it does:**
- Sends a POST request to the `triggerImageGeneration` Cloud Function
- Triggers AI image generation for a specified story ID
- Displays the response and image URL if successful
- Shows error details if the request fails

**Configuration:**
Before running, update these variables in the script:
```powershell
$storyId = "YOUR_STORY_ID_HERE"  # Firestore document ID
$functionUrl = "YOUR_FUNCTION_URL"  # Cloud Function URL
```

**Parameters:** None (configured in script)

**Examples:**
```powershell
# Edit script first to set storyId and functionUrl
notepad .\trigger-analysis.ps1

# Then run
.\trigger-analysis.ps1
```

**Expected Response:**
```json
{
  "status": "ok",
  "image_url": "https://storage.googleapis.com/..."
}
```

**Function URL Format:**
```
https://us-central1-<project-id>.cloudfunctions.net/triggerImageGeneration
```

**Troubleshooting:**
- Verify story ID exists in Firestore
- Check function URL is correct
- Ensure function is deployed
- Check Cloud Function logs in Firebase Console

---

## Common Workflows

### Starting Development Session
```powershell
# 1. Start dev server
.\start-dev.ps1

# 2. Open browser to http://localhost:3000
# 3. Make changes and see live updates
```

### Stopping Development Session
```powershell
# Stop dev server
.\stop-dev.ps1
```

### Testing Image Generation
```powershell
# 1. Submit a story via the website
# 2. Get the story ID from Firestore
# 3. Update trigger-analysis.ps1 with story ID
# 4. Run the script
.\trigger-analysis.ps1
# 5. Check Firestore for updated image URL
```

## Script Locations

All scripts should be run from the `Scripts_usage/` directory or with the full path:

```
Scripts_usage/
├── README.md (this file)
├── start-dev.ps1
├── stop-dev.ps1
└── trigger-analysis.ps1
```

## Prerequisites

### PowerShell Execution Policy
If you get an execution policy error:
```powershell
# Check current policy
Get-ExecutionPolicy

# Allow scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Required Tools
- Node.js and npm (for start-dev.ps1)
- PowerShell 5.1+ (Windows)
- Firebase project access (for trigger-analysis.ps1)

## Best Practices

1. **Always check script contents** before running
2. **Update configuration** in scripts before use (especially trigger-analysis.ps1)
3. **Run from project root** or use full paths
4. **Check logs** if scripts fail
5. **Keep scripts updated** with current function URLs

## Future Scripts

Potential scripts to add:
- `deploy-functions.ps1` - Deploy Cloud Functions
- `populate-data.ps1` - Populate test data
- `run-tests.ps1` - Run test suite
- `backup-firestore.ps1` - Backup Firestore data

## Support

For script issues:
1. Check script output for error messages
2. Verify prerequisites are installed
3. Check Firebase Console for function status
4. Review Cloud Function logs
5. Contact development team

## Notes

- Scripts are Windows PowerShell specific
- For Mac/Linux, convert to bash scripts or use PowerShell Core
- Scripts assume project structure matches expected layout
- Always test scripts in development before production use

