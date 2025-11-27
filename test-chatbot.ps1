# Test script for chatbot with GPT-4o-mini model (PowerShell)
# Usage: .\test-chatbot.ps1 [endpoint-url] [message] [-Debug]

param(
    [string]$Endpoint = "http://localhost:5001/YOUR-PROJECT/us-central1/askChatbot",
    [string]$Message = "What are the key milestones for Net Zero 2050?",
    [switch]$Debug
)

$url = if ($Debug) { "$Endpoint?debug=true" } else { $Endpoint }

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🧪 Testing Chatbot Endpoint" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📍 Endpoint: $Endpoint"
Write-Host "💬 Message: `"$Message`""
Write-Host "🔍 Debug Mode: $(if ($Debug) { 'ON' } else { 'OFF' })"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

try {
    $body = @{
        message = $Message
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    
    $duration = ((Get-Date) - $startTime).TotalMilliseconds

    Write-Host "✅ Response Status: 200 OK" -ForegroundColor Green
    Write-Host "⏱️  Total Duration: $([math]::Round($duration))ms" -ForegroundColor Yellow
    Write-Host ""

    Write-Host "📝 Response:" -ForegroundColor Cyan
    Write-Host "-" * 60
    Write-Host $response.reply
    Write-Host "-" * 60
    Write-Host ""

    if ($response.suggestions) {
        Write-Host "💡 Suggestions:" -ForegroundColor Cyan
        $response.suggestions | ForEach-Object { Write-Host "   - $_" }
        Write-Host ""
    }

    if ($response.citations) {
        Write-Host "📚 Citations:" -ForegroundColor Cyan
        $response.citations | ForEach-Object { 
            $title = if ($_.title) { $_.title } else { $_ }
            Write-Host "   - $title"
        }
        Write-Host ""
    }

    if ($response._debug) {
        Write-Host "🔍 Debug Information:" -ForegroundColor Cyan
        Write-Host "-" * 60
        Write-Host "   Model: $($response._debug.model)"
        Write-Host "   Model Type: $($response._debug.modelType)"
        Write-Host "   Latency: $($response._debug.latencyMs)ms"
        Write-Host "   Response Length: $($response._debug.responseLength) chars"
        Write-Host "   Prompt Length: $($response._debug.promptLength) chars"
        if ($response._debug.tokens) {
            Write-Host "   Tokens: $($response._debug.tokens)"
        }
        Write-Host "-" * 60
        Write-Host ""

        # Verify primary model
        if ($response._debug.model -eq "openai/gpt-4o-mini") {
            Write-Host "✅ SUCCESS: Primary model (GPT-4o-mini) is being used!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  WARNING: Using fallback model `"$($response._debug.model)`" instead of primary model" -ForegroundColor Yellow
        }
    } elseif ($Debug) {
        Write-Host "⚠️  Debug mode requested but no debug info in response" -ForegroundColor Yellow
        Write-Host "   Make sure CHATBOT_DEBUG=true is set or endpoint supports ?debug=true" -ForegroundColor Yellow
    }

} catch {
    $duration = ((Get-Date) - $startTime).TotalMilliseconds
    Write-Host "❌ Error after $([math]::Round($duration))ms:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""

