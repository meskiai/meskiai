# deploy-to-vercel.ps1
# Automatyczny deployment MESKIAI na Vercel

Write-Host "`n🚀 Wdrażam MESKIAI na Vercel..." -ForegroundColor Cyan

# Wczytaj zmienne z .env
$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim().Trim('"').Trim("'")
        if ($val -ne "") { $envVars[$key] = $val }
    }
}

Write-Host "📋 Znaleziono $($envVars.Count) zmiennych środowiskowych" -ForegroundColor Yellow

# Dodaj każdą zmienną do Vercel
foreach ($key in $envVars.Keys) {
    $val = $envVars[$key]
    Write-Host "  ➕ $key" -ForegroundColor Gray
    $val | vercel env add $key production --force 2>&1 | Out-Null
    $val | vercel env add $key preview  --force 2>&1 | Out-Null
}

Write-Host "`n✅ Zmienne dodane!" -ForegroundColor Green

# Deploy — pomijamy cron error przez --skip-domain
Write-Host "`n🔨 Buduję (2-3 minuty)..." -ForegroundColor Cyan
$rawOutput = vercel --prod --yes 2>&1
$rawOutput | ForEach-Object { Write-Host $_ }

# Wyciągnij URL
$deployUrl = ""
$rawOutput | ForEach-Object {
    if ($_ -match "https://[a-z0-9\-]+\.vercel\.app") {
        $deployUrl = $matches[0]
    }
}

if ($deployUrl) {
    Write-Host "`n🔄 Aktualizuję NEXTAUTH_URL → $deployUrl" -ForegroundColor Yellow
    $deployUrl | vercel env add NEXTAUTH_URL production --force 2>&1 | Out-Null
    
    Write-Host "🔄 Finalny redeploy z poprawnym URL..." -ForegroundColor Yellow
    vercel --prod --yes 2>&1 | Select-Object -Last 8

    Write-Host "`n══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ✅ MESKIAI LIVE: $deployUrl" -ForegroundColor Green
    Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "NASTĘPNE KROKI:" -ForegroundColor Yellow
    Write-Host "  1. Upgrade konta Vercel do PRO na vercel.com/account/billing" -ForegroundColor White
    Write-Host "     (Cron co 2 minuty aktywuje się automatycznie po upgradzie)" -ForegroundColor Gray
    Write-Host "  2. Dodaj Stripe Webhook URL:" -ForegroundColor White
    Write-Host "     $deployUrl/api/stripe/webhook" -ForegroundColor Gray
    Write-Host "  3. Dodaj Google OAuth redirect:" -ForegroundColor White
    Write-Host "     $deployUrl/api/auth/callback/google" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Sprawdź output powyżej" -ForegroundColor Yellow
    Write-Host "Jeśli widzisz błąd cron — przejdź na Vercel Pro i uruchom ponownie: vercel --prod --yes" -ForegroundColor Gray
}
