# set-netlify-env.ps1
# Ustawia wszystkie zmienne środowiskowe na Netlify

Write-Host "`n📋 Ustawiam zmienne środowiskowe na Netlify (meskiai.com)...`n" -ForegroundColor Cyan

$envVars = @{}
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim().Trim('"').Trim("'")
        if ($val -ne "") { $envVars[$key] = $val }
    }
}

# Nadpisz NEXTAUTH_URL na produkcyjny URL
$envVars["NEXTAUTH_URL"] = "https://meskiai.com"

foreach ($key in $envVars.Keys) {
    $val = $envVars[$key]
    Write-Host "  ➕ $key" -ForegroundColor Gray
    netlify env:set $key $val 2>&1 | Out-Null
}

Write-Host "`n✅ Wszystkie zmienne ustawione!" -ForegroundColor Green
