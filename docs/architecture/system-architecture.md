# Gestor de Tarefas - Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Gestor de Tarefas codebase. It reflects the implementation reality, including technical debt, architectural patterns, and integration points, to guide AI agents in making consistent and safe modifications.

### Document Scope
Comprehensive documentation of the entire system as of March 2026.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 1.0 | Initial brownfield analysis | Orion (AIOS Master) |

---

## Quick Reference - Key Files and Entry Points

### Backend
- **Main Entry**: `backend/src/index.js`
- **Server Configuration**: `backend/src/config/server.js` (CORS, Middleware)
- **Database Configuration**: `backend/src/config/database.js` (MySQL Pool)
- **Core Business Logic**: 
    - `backend/src/routes/webhooks.js` (WhatsApp Flow & Transcription)
    - `backend/src/routes/tasks.js` (Task Management)
    - `backend/src/services/whatsapp.js` (Media & Interaction)

### Frontend
- **Main Entry**: `frontend/src/main.jsx`
- **Main Application Component**: `frontend/src/App.jsx` (Routing)
- **Core View**: `frontend/src/pages/Dashboard.jsx` (Monolithic view handling Dashboard, Users, Tasks, Settings)
- **Global Styles**: `frontend/src/index.css` (21KB massive CSS file)

---

## High Level Architecture

### Technical Summary
The project follows a decoupled Frontend/Backend architecture, both written in JavaScript/TypeScript and deployed on Vercel.

### Actual Tech Stack

| Category | Technology | Version | Notes |
|----------|------------|---------|--------|
| **Backend Runtime** | Node.js | - | CommonJS modules |
| **Backend Framework** | Express | ^5.2.1 | Using Express 5 (Beta/Stable) |
| **Database** | MySQL | - | Managed via `mysql2/promise` pool |
| **Frontend Framework** | React | ^19.2.0 | Latest React version |
| **Build Tool** | Vite | ^7.3.1 | |
| **Styling** | Vanilla CSS | - | Managed in `index.css` |
| **Communications** | WhatsApp (Evolution API) | - | External integration |
| **AI/ML** | Whisper (Local) | - | Transcription service |

---

## Repository Structure Reality Check

The project is organized as a polyrepo-style structure within a single repository (folders `backend` and `frontend`).

### Project Structure (Actual)

```text
Gestor de tarefas/
├── backend/
│   ├── src/
│   │   ├── config/       # Server and DB setup
│   │   ├── middleware/   # Auth (JWT)
│   │   ├── routes/       # API endpoints (heavy logic in webhooks.js)
│   │   ├── services/     # WhatsApp and Transcription
│   │   └── index.js      # Entry Point
│   ├── Dockerfile        # Containerization (likely for local/dev)
│   └── vercel.json.bak   # Vercel config backup
├── frontend/
│   ├── src/
│   │   ├── pages/        # Dashboard (Monolithic), Login, Register
│   │   ├── App.jsx       # Route definitions
│   │   ├── index.css     # Central style repository
│   │   └── main.jsx      # Entry Point
│   └── vite.config.js    # Build configuration
```

---

## Data Models and APIs

### Data Models (MySQL)
The system uses raw SQL queries. Key tables identified:
- `users`: `id`, `name`, `email`, `whatsapp_number`, `is_superadmin`, `wa_instance`, `active`, etc.
- `companies`: `id`, `name`, `address`, `website`, `active`.
- `user_companies`: Pivot table for many-to-many relationship with `role` attribute.
- `tasks`: `id`, `company_id`, `created_by_user_id`, `assigned_to_user_id`, `title`, `status`, `due_date`.
- `user_whatsapp_sessions`: Tracks conversational state for WhatsApp task creation.

### API Specifications
- **Auth**: `/auth/login`, `/auth/register`
- **Users**: `/users` (CRUD)
- **Companies**: `/companies` (CRUD)
- **Tasks**: `/tasks` (CRUD, bulk-delete)
- **Webhooks**: `/webhooks/whatsapp` (Evolution API integration)

---

## Technical Debt and Known Issues

### Critical Technical Debt
1.  **Monolithic Dashboard**: `Dashboard.jsx` is ~1400 lines, containing multiple sub-components and almost all frontend business logic.
2.  **Logic in Routes**: `backend/src/routes/webhooks.js` contains deep conversational logic that should ideally reside in a Service or State Machine class.
3.  **Manual CORS**: Hardcoded allowed origins in `server.js` and manual header setting.
4.  **Raw SQL**: Lack of an ORM makes schema changes and migrations harder to track and safer to execute.
5.  **Transcription Path**: Local file system usage for transcription (`fs.unlinkSync`) might cause issues in serverless environments like Vercel if not carefully managed (Vercel provides `/tmp` but it's ephemeral).
6.  **Missing Tests**: `npm test` returns an error; no unit or integration tests were found.

### Workarounds and Gotchas
- **State Persistence**: Relies heavily on `localStorage` for cross-tab state (selected company, active tab).
- **Vercel compatibility**: `backend/src/index.js` explicitly checks for `process.env.VERCEL` to avoid `app.listen()`.
- **CORS Fallback**: `server.js` has a regex-like fallback for any `vercel.app` origin.

---

## Integration Points

- **Evolution API (WhatsApp)**: Backend connects to an external Evolution API instance for sending/receiving WhatsApp messages.
- **Local Transcription (Whisper)**: Uses a local service (likely a separate worker or process) called via `transcribeLocal`.

---

## Development and Deployment

### Local Development
- **Backend**: `npm run dev` (starts nodemon on `src/index.js`)
- **Frontend**: `npm run dev` (starts Vite)

### Deployment
- Deployed on **Vercel** (`tarefas-one.vercel.app`, `tarefas-seven.vercel.app`).
- Backend requires `EVOLUTION_API_URL` and `EVOLUTION_API_KEY` environment variables.

---

## Success Criteria for Modifications
- Maintain compatibility with Vercel's serverless environment.
- Respect the "Elite Premium" design aesthetic defined in the CSS (glassmorphism themes).
- Ensure JWT auth is correctly passed in all new requests.
- When adding tasks via WhatsApp, maintain the conversational flow in `webhooks.js`.
