# SERVER MONITOR

**Live Demo:** https://server-monitor-dev.vercel.app/

Production-oriented developer monitoring platform. Core monitoring works without AI and without login; each browser gets its own anonymous workspace cookie.

## Easy local setup
1. `npm install`
2. `npm run setup` — automatically starts the bundled PostgreSQL and applies the Prisma schema.
3. `npm run dev`
4. In another terminal: `npm run worker`

No Docker or separate PostgreSQL installer is required for local development.

## Production database
Use a managed PostgreSQL provider so the database is persistent and backed up. Put its connection string in `DATABASE_URL`. For Vercel, the Next.js documentation supports creating a Postgres database from the project's Storage/marketplace flow, including providers such as Neon or Supabase.

Never commit `.env`, database URLs, Resend tokens, or agent tokens.

## Production services
- Web: `npm run build && npm run start`
- Worker: `npm run worker` as a persistent service on a Node-capable host.
- Database: managed PostgreSQL.
- Agent: copy the `agent` folder to each target machine and run `install.ps1` or `install.sh` with the generated credentials.

## Security implemented
- SSRF target validation and safe redirect re-validation for hosted checks
- private/local target checks can be assigned to an authenticated monitoring agent
- agent bearer-token authentication
- rate limiting on write/test/status-page endpoints
- secret values excluded from git
- HTTPS-ready deployment architecture
- alert cooldowns and incident deduplication
- historical retention cleanup

## Monitoring
- Websites and APIs
- HTTP status dictionary and human explanations
- response time and uptime
- SSL certificate expiry checks
- incidents and email alerts
- Windows/Linux/VPS agents
- localhost/private-service monitoring through an assigned agent
- monitor and server history pages
- optional public status pages

## Production checklist
1. Set a strong production encryption secret used by provider token encryption.
2. Set managed `DATABASE_URL`.
3. Set Resend OAuth connection from Settings.
4. Run web and worker as separate persistent services.
5. Use HTTPS and a custom domain.
6. Test agent offline, recovery, high CPU/RAM/Disk, SSL expiry and monitor DOWN/RECOVERED alerts.
7. Configure database backups and retention.


