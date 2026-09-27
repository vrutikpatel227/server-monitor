param([string]$ServerUrl,[string]$ServerId,[string]$AgentId,[string]$AgentToken)
$ErrorActionPreference="Stop"
$ServerUrl=$ServerUrl.TrimEnd("/")
if(-not $ServerUrl -or -not $ServerId -or -not $AgentId -or -not $AgentToken){ Write-Host "Invalid installer parameters. Download a fresh installer from SERVER MONITOR." -ForegroundColor Red; exit 1 }
$dir=Join-Path $env:ProgramData "ServerMonitorAgent"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$log=Join-Path $dir "install.log"
Start-Transcript -Path $log -Append | Out-Null
try {
 if(-not (Get-Command node -ErrorAction SilentlyContinue)){ Write-Host "Node.js LTS is required. Install Node.js LTS, then run this installer again." -ForegroundColor Yellow; exit 1 }
 Invoke-WebRequest "$ServerUrl/agent/package.json" -OutFile (Join-Path $dir "package.json")
 Invoke-WebRequest "$ServerUrl/agent/index.txt" -OutFile (Join-Path $dir "index.ts")
 @{serverUrl=$ServerUrl;serverId=$ServerId;agentId=$AgentId;token=$AgentToken} | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $dir "agent.config.json")
 Set-Location $dir
 npm install --omit=dev
 $run=Join-Path $dir "run-agent.cmd"
 @"
@echo off
cd /d "$dir"
set SERVER_MONITOR_URL=$ServerUrl
set SERVER_ID=$ServerId
set AGENT_ID=$AgentId
set AGENT_TOKEN=$AgentToken
node_modules\\.bin\\tsx.cmd index.ts
"@ | Set-Content -Encoding ASCII $run
 $startup=Join-Path $env:ProgramData "Microsoft\Windows\Start Menu\Programs\StartUp"
 New-Item -ItemType Directory -Force -Path $startup | Out-Null
 Copy-Item $run (Join-Path $startup "SERVER MONITOR Agent.cmd") -Force
 Start-Process $run -WindowStyle Minimized
 Write-Host "SERVER MONITOR Agent installed and started successfully." -ForegroundColor Green
 Write-Host "It will start automatically when Windows starts." -ForegroundColor Cyan
} finally { Stop-Transcript | Out-Null }
