# Relay

Relay is a real-time messaging app built with React, TypeScript, Express, Socket.IO, PostgreSQL, Prisma, and a pnpm/Turborepo monorepo.

## Features

- Email/password registration and login with JWT authentication
- Google sign-in and sign-up using Google Identity Services
- Verified Google ID tokens checked by the API before issuing a Relay JWT
- Existing email/password accounts are not automatically linked to Google accounts
- Direct conversations
- Conversation membership checks before joining a Socket.IO room or saving a message
- Real-time message delivery
- Message history backed by PostgreSQL and Prisma
- Docker-based development and deployment setup

## Repository layout

```text
Relay/
├── apps/
│   ├── api/       # Express API and Socket.IO server
│   └── web/       # React + Vite frontend
├── packages/
│   └── db/        # Prisma schema, migrations, shared database client
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Architecture

1. React calls the Express API for authentication, conversation lists, and message history.
2. Google Identity Services returns an ID credential to the frontend.
3. The API verifies the credential with Google, checks the intended audience and verified email, then finds or creates the matching Relay user.
4. Relay issues its own JWT; the frontend stores it using the existing session flow.
5. The frontend connects to Socket.IO with its access token.
6. Socket authentication middleware identifies the user.
7. A user must belong to a conversation before joining its Socket.IO room.
8. The message service checks membership again before writing to PostgreSQL, then the server broadcasts the persisted message to that room.

Google sign-in never links an existing account based only on a matching email address. If the email already belongs to a password account, the user must sign in through that account; an explicit account-linking flow can be added separately.

Socket.IO payloads are validated server-side. Message content is limited to 500 characters, with a basic per-socket send limit to reduce accidental or abusive bursts.

## Requirements

- Node.js 24 or newer
- pnpm 11 (as declared in the root package manifest)
- PostgreSQL locally or through Docker

## Environment variables

Set these in the environment files expected by your deployment. Never commit real secrets.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URI` | API / Prisma config | PostgreSQL connection string |
| `JWT_SECRET` | API | JWT secret of at least 32 characters |
| `PORT` | API | HTTP port; defaults to `5000` |
| `CLIENT_URL` | API | Exact frontend origin allowed by HTTP and Socket.IO CORS; defaults to `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | API | OAuth client ID used to validate Google ID-token audience |
| `VITE_API_URL` | Web | API origin; defaults to `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Web | Google Identity Services client ID; public, not a secret |

For local development, use `http://localhost:5173` as the authorized JavaScript origin in Google Cloud Console. Add your production frontend origin there as well. Set `GOOGLE_CLIENT_ID` in the API runtime and `VITE_GOOGLE_CLIENT_ID` in the frontend build environment to the same client ID. A Google client secret is not used by this ID-token popup flow and must not be placed in frontend variables.

For deployment, set `CLIENT_URL` to the frontend origin and `VITE_API_URL` to the reachable API origin. Do not append `/api` to `VITE_API_URL`.

## Local development

From the repository root:

```bash
pnpm install
pnpm --filter @repo/db db:generate
pnpm dev
```

Ensure PostgreSQL is running and `DATABASE_URI` points to the correct database. Apply the checked-in Prisma migrations using the migration workflow configured for your environment before testing authenticated routes.

Build the monorepo:

```bash
pnpm build
```

Build an individual app:

```bash
pnpm --filter api build
pnpm --filter web build
```

The API health endpoint is available at `GET /health`.

## Next engineering priorities

- Automated tests for authentication, conversation authorization, and message delivery
- Cursor-based message pagination and sender profile details
- Typing/presence and unread/read state
- Structured production logging, monitoring, and CI checks
- A shared Socket.IO adapter such as Redis when running multiple API instances
