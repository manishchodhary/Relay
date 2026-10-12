# Relay

Relay is a real-time messaging application built as a TypeScript monorepo. It includes a React frontend, an Express API, Socket.IO for real-time communication, Prisma for database access, and PostgreSQL for persistent data.

## Features

- Real-time messaging with Socket.IO
- JWT-based authentication
- Direct and group conversations
- PostgreSQL persistence with Prisma
- React and Vite frontend
- TypeScript across the application
- Docker images for the frontend and API
- Nginx for serving the frontend and routing production traffic

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| API | Node.js, Express, TypeScript |
| Real-time communication | Socket.IO |
| Authentication | JWT |
| Database | PostgreSQL |
| ORM | Prisma |
| Monorepo tooling | pnpm workspaces, Turborepo |
| Containers | Docker |
| Web server and reverse proxy | Nginx |

## Repository layout

The application source is in the `Relay/` directory.

```text
Relay/
├── apps/
│   ├── api/                 # Express API and Socket.IO server
│   └── web/                 # React frontend
├── packages/
│   ├── db/                  # Prisma schema, client and database scripts
│   └── typescript-config/   # Shared TypeScript configuration
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── turbo.json
```

## Requirements

For local development without Docker, install:

- Node.js 24 or later
- pnpm 11.25.0
- PostgreSQL, either local or hosted
- Git

For container-based setup, install Docker Engine and the Docker Compose plugin.

## Getting started

Clone the repository and enter the application directory:

```bash
git clone https://github.com/manishchodhary/Relay.git
cd Relay/Relay
```

Install dependencies:

```bash
corepack enable
pnpm install
```

Create the environment configuration for the API. The API requires `DATABASE_URI` and `JWT_SECRET`; use your own PostgreSQL connection string and a strong random JWT secret of at least 32 characters. Do not commit real credentials.

Create an environment file at `apps/api/.env` for local development, or export the variables in your shell before starting the API. The API's environment validation also supports `PORT`, which defaults to `5000`, and `CLIENT_URL`, which should match the frontend's origin.

Example local API configuration:

```dotenv
DATABASE_URI=postgresql://USER:PASSWORD@localhost:5432/relay
JWT_SECRET=replace_with_a_random_secret_of_at_least_32_characters
PORT=5000
CLIENT_URL=http://localhost:5173
```

Set up the database and generate the Prisma client using the scripts defined in `packages/db/package.json`. Then start the API and frontend in separate terminals:

```bash
pnpm --filter api dev
```

```bash
pnpm --filter web dev
```

The frontend development server normally runs at `http://localhost:5173`, and the API listens on port `5000`. Configure `VITE_API_URL` for the frontend build or development environment when the API is not at its default URL.

Useful workspace commands from `Relay/`:

```bash
pnpm build
pnpm lint
pnpm check-types
```

## Docker

The repository provides separate Dockerfiles for the API and frontend:

- `apps/api/Dockerfile`
- `apps/web/Dockerfile`

Build commands must run from the `Relay/` application directory so that each Docker build can access the monorepo files.

### Build the images

Build the frontend with the public API origin used by the browser:

```bash
docker build \
  --build-arg VITE_API_URL=https://your-domain.example \
  -t relay-web:latest \
  -f apps/web/Dockerfile .
```

Build the API image:

```bash
docker build -t relay-api:latest -f apps/api/Dockerfile .
```

The frontend's `VITE_API_URL` is embedded during the Vite build. Rebuild the frontend image whenever that value changes.

### Run the API container

Create an environment file outside the repository, for example `/home/ubuntu/.env.production` on a server:

```dotenv
DATABASE_URI=your_postgresql_connection_string
JWT_SECRET=your_strong_random_secret
CLIENT_URL=https://your-domain.example
PORT=5000
```

Keep this file private and do not commit it. Start the API container:

```bash
docker run -d \
  --name relay-api \
  --restart unless-stopped \
  --env-file /home/ubuntu/.env.production \
  -p 127.0.0.1:5000:5000 \
  relay-api:latest
```

The API Docker image runs Prisma migrations on container startup before starting the server. Make sure the database is reachable and the configured database user has the permissions required by your migrations.

### Run the frontend container

```bash
docker run -d \
  --name relay-web \
  --restart unless-stopped \
  -p 127.0.0.1:8080:80 \
  relay-web:latest
```

Binding the published ports to `127.0.0.1` keeps the containers accessible through the EC2 host's Nginx without exposing ports 5000 and 8080 directly to the public internet.

### Docker Compose

Docker Compose is useful when you want to define the frontend and API in one file and manage them together. The following example assumes you create `docker-compose.yml` inside the `Relay/` application directory. It keeps both services on an internal Docker network and publishes them only on the host loopback interface.

```yaml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    image: relay-api:latest
    container_name: relay-api
    restart: unless-stopped
    env_file:
      - /home/ubuntu/.env.production
    ports:
      - "127.0.0.1:5000:5000"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      args:
        VITE_API_URL: https://your-domain.example
    image: relay-web:latest
    container_name: relay-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    depends_on:
      - api
```

Start or rebuild the services:

```bash
docker compose up --build -d
```

Check service status and logs:

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
```

Stop the services:

```bash
docker compose down
```

The example Compose file above is documentation for an optional setup; it is not currently included in the repository. The existing Dockerfiles can also be used with the individual `docker build` and `docker run` commands.

## Production deployment with EC2 and Nginx

A typical single-instance deployment uses this request flow:

1. The browser connects to the domain over HTTPS.
2. Host Nginx terminates TLS and serves as the reverse proxy.
3. Requests to `/auth/`, `/api/`, `/health`, and `/socket.io/` are forwarded to the API on `127.0.0.1:5000`.
4. Other requests are forwarded to the frontend container on `127.0.0.1:8080`.
5. The API connects to PostgreSQL using `DATABASE_URI`.

Configure Nginx to support WebSocket upgrades for Socket.IO, and set `CLIENT_URL` to the exact public frontend origin, including `https://`. Configure the frontend build's `VITE_API_URL` to the same public origin when frontend and API share a domain.

After deploying, verify the API health endpoint:

```bash
curl -i https://your-domain.example/health
```

A healthy API responds with HTTP `200` and a JSON status response.

### Updating a deployment

From the application directory:

```bash
git pull --ff-only origin main
docker build --build-arg VITE_API_URL=https://your-domain.example -t relay-web:latest -f apps/web/Dockerfile .
docker build -t relay-api:latest -f apps/api/Dockerfile .
```

Recreate the containers with the same environment file and port bindings after both images build successfully. If using Compose, use `docker compose up --build -d`.

### Container lifecycle and troubleshooting

The `unless-stopped` restart policy allows Docker to restart containers after a crash or Docker daemon restart, unless they were explicitly stopped. It does not prevent application failures or out-of-memory kills.

```bash
docker ps
docker ps -a
docker logs --tail 100 relay-api
docker logs --tail 100 relay-web
docker inspect relay-api
```

An exit code of `137` means the process was killed with `SIGKILL`; check system memory and container logs before assuming the cause.

## Security notes

- Never commit `.env`, `.env.production`, database URLs, JWT secrets, or other credentials.
- Use a strong, randomly generated JWT secret.
- Keep API and frontend container ports bound to localhost when host Nginx is the public entry point.
- Allow only required inbound ports in the EC2 security group. SSH should not be open to every source unless there is a deliberate reason.
- Use HTTPS in production and set the correct frontend origin in `CLIENT_URL`.
- Back up important database data independently of the containers. Removing a container does not remove a separately hosted PostgreSQL database.

## Contributing

Changes are welcome. For a useful bug report, include the steps to reproduce the issue and relevant logs, but remove tokens, passwords, connection strings, and other secrets before sharing them.
