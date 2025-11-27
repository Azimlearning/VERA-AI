# PowerShell script to deploy the askChatbot function with updated model configuration

Write-Host "🚀 Deploying askChatbot Function with GPT-4o-mini..." -ForegroundColor Cyan
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

# Verify we're in the right directory
if (-not (Test-Path "functions\index.js")) {
    Write-Host "❌ Error: functions\index.js not found. Are you in the project root?" -ForegroundColor Red
    exit 1
}

# Verify model configuration
Write-Host "📋 Verifying model configuration..." -ForegroundColor Yellow
$modelsContent = Get-Content "functions\ai_models.js" -Raw
if ($modelsContent -match "openai/gpt-4o-mini") {
    Write-Host "✅ GPT-4o-mini is configured as primary model" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: GPT-4o-mini not found in ai_models.js" -ForegroundColor Yellow
}

Write-Host ""

# Deploy the askChatbot function
Write-Host "🚀 Deploying askChatbot function..." -ForegroundColor Yellow
Write-Host "   This will update the function with the new GPT-4o-mini primary model" -ForegroundColor Gray
Write-Host ""

firebase deploy --only functions:askChatbot

if ($?) {
    Write-Host ""
    Write-Host "✅ askChatbot function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Test the chatbot endpoint" -ForegroundColor White
    Write-Host "   2. Check logs to verify GPT-4o-mini is being used" -ForegroundColor White
    Write-Host "   3. Monitor OpenRouter dashboard for model usage" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Test with:" -ForegroundColor Cyan
    Write-Host '   node test-chatbot.js "YOUR-ENDPOINT-URL" "Test question" --debug' -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    exit 1
}

