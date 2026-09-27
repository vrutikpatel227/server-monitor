#!/usr/bin/env bash
set -e
SERVER_MONITOR_URL="${SERVER_MONITOR_URL:-$(read -p 'SERVER MONITOR URL: ' v; echo $v)}"
SERVER_ID="${SERVER_ID:-$(read -p 'SERVER ID: ' v; echo $v)}"
AGENT_ID="${AGENT_ID:-$(read -p 'AGENT ID: ' v; echo $v)}"
AGENT_TOKEN="${AGENT_TOKEN:-$(read -p 'AGENT TOKEN: ' v; echo $v)}"
export SERVER_MONITOR_URL SERVER_ID AGENT_ID AGENT_TOKEN
npm install
npm start
