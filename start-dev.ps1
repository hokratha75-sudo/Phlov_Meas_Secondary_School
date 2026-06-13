# =====================================================
# start-dev.ps1 — Kill old processes & start dev server
# Usage: .\start-dev.ps1
# =====================================================

Write-Host ""
Write-Host "Clearing old processes on ports 8080, 3000, 3001..." -ForegroundColor Cyan

@(8080, 3000, 3001) | ForEach-Object {
    $port = $_
    $lines = netstat -ano | Select-String "TCP\s+\S+:$port\s+\S+\s+LISTENING"
    if ($lines) {
        $procId = ($lines[0] -split '\s+' | Where-Object { $_ -ne '' })[-1]
        if ($procId -and $procId -match '^\d+$' -and $procId -ne '0') {
            taskkill /PID $procId /F 2>$null | Out-Null
            Write-Host "  Freed port $port  (PID $procId killed)" -ForegroundColor Green
        } else {
            Write-Host "  Port $port  is already free" -ForegroundColor Gray
        }
    } else {
        Write-Host "  Port $port  is already free" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Starting dev server..." -ForegroundColor Yellow
Write-Host ""

pnpm run dev
