# PowerShell script to deploy all required Cloud Functions for Agent Try Pages

Write-Host "🚀 Deploying Cloud Functions for Agent Try Pages..." -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
try {
    $null = Get-Command firebase -ErrorAction Stop
} catch {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
Write-Host "Checking Firebase login status..." -ForegroundColor Gray
try {
    $null = firebase projects:list 2>&1
} catch {
    Write-Host "❌ Not logged in to Firebase. Please run: firebase login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Firebase CLI ready" -ForegroundColor Green
Write-Host ""

# Deploy functions one by one
Write-Host "1️⃣  Deploying generatePodcast..." -ForegroundColor Yellow
firebase deploy --only functions:generatePodcast
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy generatePodcast" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2️⃣  Deploying submitStory..." -ForegroundColor Yellow
firebase deploy --only functions:submitStory
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy submitStory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3️⃣  Deploying analyzeImage..." -ForegroundColor Yellow
firebase deploy --only functions:analyzeImage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy analyzeImage" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "4️⃣  Deploying generateQuiz..." -ForegroundColor Yellow
firebase deploy --only functions:generateQuiz
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy generateQuiz" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Function URLs:" -ForegroundColor Cyan
firebase functions:list | Select-String -Pattern "(generatePodcast|submitStory|analyzeImage|generateQuiz)"
Write-Host ""
Write-Host "🎉 Deployment complete! Your Agent Try Pages are ready to use." -ForegroundColor Green

