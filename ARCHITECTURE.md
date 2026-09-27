# Architecture

Browser -> Next.js UI -> Route Handlers -> Prisma/PostgreSQL
                         ^
                         |
              Monitoring Worker
                         |
                HTTP/HTTPS targets

Machine monitoring:
Windows/Linux/VPS -> Node Agent -> /api/agents/heartbeat -> PostgreSQL -> Dashboard

Security:
- Validate monitor URLs
- Block localhost/private targets for hosted checks unless explicitly configured for agent mode
- Never log credentials or agent secrets
- Agent uses bearer token
- AI is isolated and disabled by default

Core entities:
Monitor, MonitorCheck, Server, Agent, ServerMetric, Incident, Alert, AlertChannel, StatusPage, StatusPageMonitor, Setting.