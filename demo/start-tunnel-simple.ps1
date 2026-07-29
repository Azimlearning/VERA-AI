# VERA Demo - Cloudflare Tunnel Starter Script (Simplified)
# This script starts Cloudflare Tunnel for live demo access

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERA AI Demo - Tunnel Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the project root directory
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Check if Next.js is already running
Write-Host "Checking if Next.js is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Next.js dev server is already running on port 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "Next.js dev server is not running." -ForegroundColor Yellow
    Write-Host "Please start it manually with: npm run dev" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue anyway (tunnel will start but may not work)"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Copy the URL that appears below!" -ForegroundColor Yellow
Write-Host "It will look like: https://random-words-1234.trycloudflare.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Gray
Write-Host ""

# Check if cloudflared is installed
$cloudflaredPath = $null

# Try to find cloudflared in PATH first
try {
    $test = & cloudflared --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Cloudflare Tunnel found" -ForegroundColor Green
        $cloudflaredPath = "cloudflared"
    }
} catch {
    # Not in PATH, try to find it in common locations
}

# If not in PATH, search common installation locations
if (-not $cloudflaredPath) {
    $commonPaths = @(
        "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Cloudflare.cloudflared_*\cloudflared.exe",
        "$env:ProgramFiles\Cloudflare\cloudflared.exe",
        "$env:ProgramFiles(x86)\Cloudflare\cloudflared.exe",
        "$env:USERPROFILE\AppData\Local\cloudflared\cloudflared.exe"
    )
    
    foreach ($pathPattern in $commonPaths) {
        $found = Get-ChildItem -Path (Split-Path $pathPattern -Parent) -Filter (Split-Path $pathPattern -Leaf) -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $cloudflaredPath = $found.FullName
            Write-Host "Found cloudflared at: $cloudflaredPath" -ForegroundColor Green
            break
        }
    }
}

# If still not found, provide instructions
if (-not $cloudflaredPath) {
    Write-Host "ERROR: cloudflared is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "cloudflared is installed but not accessible. Try:" -ForegroundColor Yellow
    Write-Host "  1. Restart PowerShell/terminal (to refresh PATH)" -ForegroundColor Gray
    Write-Host "  2. Or manually add cloudflared to PATH" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Starting tunnel to http://localhost:3000..." -ForegroundColor Green
Write-Host ""

# Start Cloudflare Tunnel
& $cloudflaredPath tunnel --url http://localhost:3000

