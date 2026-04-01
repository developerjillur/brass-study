# BRASS CKD Study - Photobiomodulation Research Platform

A comprehensive clinical research platform for managing a photobiomodulation (PBM) therapy study for chronic kidney disease (CKD).

**Live site:** https://brassphdstudy.com

## Architecture

| Component | Technology | Directory |
|-----------|-----------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui | `/frontend` |
| Backend | NestJS + TypeORM + MySQL | `/backend` |
| Database | MySQL 8.0 | `/database` |
| Deployment | PM2 + Nginx + Let's Encrypt SSL | `/deploy` |

## Features

### Participant Portal
- Screening & eligibility check
- Multi-step onboarding (demographics, consent, baseline labs)
- Daily therapy session logging with compliance tracking
- Renal function lab result submission
- Validated psychological assessments (HADS, PHQ-9, GAD-7, PSS-10)
- Two-way messaging with researcher
- 90-day study timeline calendar
- HIPAA-compliant 30-minute session timeout

### Researcher Portal
- Screening queue management
- Participant enrollment & randomized group assignment
- Compliance heatmap & monitoring
- Assessment completion tracking
- Comprehensive data reports & exports (CSV, de-identified, consent audit)
- Broadcast messaging

### Security & Compliance
- JWT authentication with bcrypt password hashing
- Role-based access control (researcher/participant)
- HIPAA session timeout (30 minutes)
- Audit logging on all PHI modifications
- Participant anonymization on withdrawal
- SSL/HTTPS encryption

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MySQL 8.0

### Backend
```bash
cd backend
npm install
# Configure .env with MySQL credentials
npm run start:dev  # Runs on port 3001
```

### Frontend
```bash
cd frontend
npm install
# Set NEXT_PUBLIC_API_URL=http://localhost:3001 in .env.local
npm run dev  # Runs on port 3000
```

### Seed Test Data
```bash
curl -X POST http://localhost:3001/api/seed/test-users
```

### Test Credentials
- **Researcher:** researcher@test.com / Researcher123!
- **Participant:** participant@test.com / Participant123!

## Production Deployment

See `/deploy/` directory for:
- `setup-server.sh` - VPS initial setup script
- `deploy.sh` - Full deployment script
- `ecosystem.config.js` - PM2 process manager config
- `nginx-brass-study.conf` - Nginx reverse proxy + SSL config

## Database

- `database/brass_study_schema.sql` - Schema only (for fresh setup)
- `database/brass_study_full.sql` - Full dump with data

## Study Details

- **Researcher:** Sandra Brass, PhD Candidate, Quantum University
- **Study Duration:** 12 weeks (84 days)
- **Design:** Randomized, double-blind (treatment vs. placebo control)
- **IRB Approved**
