# Script to generate StatsX data scenarios
# Usage: .\generate-statsx-data.ps1 -Scenario "highEngagement"
#        .\generate-statsx-data.ps1 -Scenario "lowEngagement" -ClearFirst

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("highEngagement", "lowEngagement", "anomalies", "normal", "presentation")]
    [string]$Scenario = "normal",
    
    [Parameter(Mandatory=$false)]
    [switch]$ClearFirst = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "`nStatsX Data Generation Script" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host "`nUsage:" -ForegroundColor Yellow
    Write-Host "  .\generate-statsx-data.ps1 -Scenario <scenario> [-ClearFirst]"
    Write-Host "`nScenarios:" -ForegroundColor Yellow
    Write-Host "  - highEngagement  : High user activity, many stories and meetings"
    Write-Host "  - lowEngagement   : Low user activity, few stories"
    Write-Host "  - anomalies       : Data with anomalies for testing detection"
    Write-Host "  - normal          : Standard activity levels (default)"
    Write-Host "  - presentation    : Optimized data for presentations"
    Write-Host "`nOptions:" -ForegroundColor Yellow
    Write-Host "  -ClearFirst       : Clear existing test data before generating"
    Write-Host "`nExamples:" -ForegroundColor Green
    Write-Host "  .\generate-statsx-data.ps1 -Scenario highEngagement"
    Write-Host "  .\generate-statsx-data.ps1 -Scenario presentation -ClearFirst"
    exit 0
}

Write-Host "`n📊 StatsX Data Generation" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Scenario: $Scenario" -ForegroundColor Yellow

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location "$projectRoot\systemicshiftsver2"

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Create a temporary script file to run in Node.js
$tempScript = @"
const { generateAllFakeData, clearTestData, DATA_SCENARIOS } = require('./src/lib/generateFakeData.js');

async function main() {
  const scenario = '$Scenario';
  const clearFirst = $($ClearFirst.IsPresent);
  
  console.log('\\n🚀 Starting data generation...');
  console.log('Scenario:', scenario);
  console.log('Clear first:', clearFirst);
  
  if (clearFirst) {
    console.log('\\n🗑️  Clearing existing test data...');
    const clearResults = await clearTestData();
    console.log('Cleared:', JSON.stringify(clearResults.cleared, null, 2));
    if (clearResults.errors.length > 0) {
      console.error('Errors:', clearResults.errors);
    }
  }
  
  console.log('\\n📊 Generating data for scenario:', scenario);
  const results = await generateAllFakeData(scenario);
  
  console.log('\\n✅ Generation complete!');
  console.log('Results:', JSON.stringify(results, null, 2));
  
  if (results.errors.length > 0) {
    console.error('\\n⚠️  Errors:', results.errors);
  }
}

main().catch(console.error);
"@

$tempScriptPath = Join-Path $env:TEMP "generate-statsx-data-$(Get-Random).js"
$tempScript | Out-File -FilePath $tempScriptPath -Encoding UTF8

try {
    Write-Host "`n🔄 Running data generation..." -ForegroundColor Green
    
    # Note: This requires the generateFakeData to be available as a module
    # You may need to adjust the import path or create a separate Node.js script
    node $tempScriptPath
    
    Write-Host "`n✅ Data generation complete!" -ForegroundColor Green
    Write-Host "`nCheck the StatsX dashboard to see the new data." -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ Error running script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    # Clean up temp file
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force
    }
}

Write-Host "`n💡 Tip: Use -Help to see all available options" -ForegroundColor Gray

