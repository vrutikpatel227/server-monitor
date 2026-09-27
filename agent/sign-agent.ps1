param(
  [string]$CertFile,
  [string]$CertPassword,
  [string]$Thumbprint,
  [string]$SignTool = "signtool.exe"
)

if (-not $CertFile -and -not $Thumbprint) {
  throw "Provide either -CertFile/-CertPassword or -Thumbprint."
}

$ErrorActionPreference = "Stop"
$Agent = Join-Path $PSScriptRoot "dist\server-monitor-agent.exe"

if (-not (Test-Path $Agent)) {
  throw "Agent EXE not found: $Agent"
}
$SignArgs = @("sign", "/fd", "SHA256", "/td", "SHA256", "/tr", "http://timestamp.digicert.com", "/d", "SERVER MONITOR Agent")
if ($Thumbprint) {
  $SignArgs += @("/sha1", $Thumbprint)
} else {
  if (-not (Test-Path $CertFile)) { throw "Certificate file not found: $CertFile" }
  $SignArgs += @("/f", $CertFile, "/p", $CertPassword)
}
$SignArgs += $Agent

Write-Host "Signing $Agent ..."
& $SignTool @SignArgs
if ($LASTEXITCODE -ne 0) { throw "signtool failed with exit code $LASTEXITCODE" }

Write-Host "Verifying signature ..."
& $SignTool verify /pa /v $Agent
if ($LASTEXITCODE -ne 0) { throw "Signature verification failed with exit code $LASTEXITCODE" }

$PublicExe = Join-Path $PSScriptRoot "..\public\agent\server-monitor-agent.exe"
Copy-Item -LiteralPath $Agent -Destination $PublicExe -Force
Write-Host "Signed agent copied to: $PublicExe"
