$ErrorActionPreference = "Stop"
$base = "http://localhost:8080/api"
$loginBody = '{"username":"admin","password":"admin123"}'

$login = Invoke-RestMethod -Method Post -Uri ($base + "/auth/login") -ContentType "application/json" -Body $loginBody
$token = $login.token

$list = Invoke-RestMethod -Headers @{ Authorization = ("Bearer " + $token) } -Uri ($base + "/leave-requests")
if (-not $list.data -or $list.data.Count -eq 0) {
  Write-Host "NO_ITEMS"
  exit 0
}

$id = $list.data[0].id
Write-Host ("ID=" + $id)

try {
  Invoke-WebRequest -Headers @{ Authorization = ("Bearer " + $token) } -Uri ($base + "/leave-requests/$id/export/excel") -OutFile "artifacts/api-server/_tmp_export.xlsx" -ErrorAction Stop
  Write-Host "EXPORT_OK"
} catch {
  Write-Host "EXPORT_FAIL"
  Write-Host $_.Exception.Message
  if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
    Write-Host $_.ErrorDetails.Message
  }
  if ($_.Exception.Response) {
    $resp = $_.Exception.Response
    try {
      $stream = $resp.GetResponseStream()
      $reader = New-Object System.IO.StreamReader($stream)
      $body = $reader.ReadToEnd()
      Write-Host "RESPONSE_BODY_START"
      Write-Host $body
      Write-Host "RESPONSE_BODY_END"
    } catch {
      Write-Host "NO_RESPONSE_BODY"
    }
  }
  exit 1
}
