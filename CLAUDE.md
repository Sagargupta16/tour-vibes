# CLAUDE.md

> This file stacks on top of the workspace root at `C:\Code\GitHub\`:
> - Root [`CLAUDE.md`](../../CLAUDE.md) -- voice, rules, routing map, references, skills, slash commands, conventions.
> - Root [`MEMORY.md`](../../MEMORY.md) -- live facts across repos.
> - Root [`STATUS.md`](../../STATUS.md) -- live PR/CI/security dashboard.
> - [`.claude/resources/`](../../.claude/resources/README.md) -- deep reference for collaboration, workflow, git, OSS, debugging, voice.
>
> Read those first. The guidance below only adds **repo-specific context** -- it does not override anything in the root.


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- **Every file must stay under 250 lines.** If a file approaches this limit, split it into smaller, focused modules.
- Functional components with hooks (no class components), async/await (no .then chains), ES module-style imports where possible.
- 3-space indentation (`.editorconfig` + `.prettierrc`).
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

## Development Commands

```bash
# Both servers together (from root)
npm run dev

# Individual
npm run server     # Express on port 8000 (nodemon)
npm run client     # Vite React on port 3000

# Install all deps
npm run install:all

# Build frontend
npm run build

# Format all code
npm run format
npm run format:check   # CI-friendly, no writes

# Server (run in server/)
npm test               # node:test + supertest against mongodb-memory-server
npm run seed           # demo users and pinned journals (only replaces *@demo.tourvibes.dev)

# Client (run in client/)
npm run bundle:report  # chunk sizes after npm run build

# Whole stack in Docker
docker compose up --build
docker compose run --rm api npm run seed
```

## Environment Setup

**Server:** Copy `server/.env.example` to `server/.env`:
- `MONGODB_URI` -- MongoDB Atlas connection string
- `JWT_SECRET` -- required, server won't start without it
- `PORT` -- defaults to 8000
- `CLIENT_URL` -- defaults to `http://localhost:3000` (used for CORS)
- `DEMO_EMAIL` -- optional, the seeded account `POST /auth/demo` signs in as
- `DEMO_PASSWORD` -- optional, read by `npm run seed` for the demo users; unset, the seed generates one and prints it once

**Client:** Copy `client/.env.example` to `client/.env`:
- `VITE_API_URL` -- defaults to `http://localhost:8000`

## Architecture

Root `package.json` uses `concurrently` to run both packages:

```
client/   -- Vite + React 19 SPA (Tailwind CSS 4 + shadcn/ui)
server/   -- Express 5 REST API with MongoDB (Mongoose 9)
```

### Backend (`server/`)

Entry point: `app.js` -- Express, CORS, static `/images`, error handler. Exports the app; connects to MongoDB and listens only when run directly (`require.main === module`), so `test/` can load it.

- `routes/feed.js` -- post CRUD, search, tags, likes, comments
- `routes/auth.js` -- signup, login, profile, password change (every route rate-limited)
- `controllers/feed.js` / `controllers/auth.js` / `controllers/comment.js` / `controllers/like.js` / `controllers/map.js` (bbox query, antimeridian split)
- `models/post.js` / `models/users.js` / `models/comment.js`
- `middleware/is-auth.js` -- JWT verification from `process.env.JWT_SECRET`
- `middleware/upload.js` -- Multer (5MB, PNG/JPG), mounted per route after `isAuth` on create/update post and update profile
- `middleware/valid-id.js` -- `router.param` guard: malformed `:postId`, `:commentId`, `:userId` is a 400
- `test/` -- `setup.js` (in-memory MongoDB, user/post helpers) plus one file per area; run with `--test-concurrency=1` because the files share `images/`
- `scripts/seed.js` + `seed/data.json` + `seed/photos/` -- demo data; photo credits in `seed/photos/CREDITS.md`
- `util/helpers.js` -- shared pagination, path normalization, image cleanup

**Key patterns:**
- All mutations check ownership (`post.creator === req.userId`)
- Pagination: 10 per page, `?page=N&sort=newest|oldest|popular&tag=X`
- Full-text search: `GET /feed/search?q=keyword`
- Tags sent as JSON array string in FormData
- Location sent as `locationName` + `locationCountry` fields; optional map pin as `lat` + `lng` (both or neither; empty strings on edit remove the pin)
- `GET /feed/map?bbox=west,south,east,north` -- pinned posts in the box, max 500

### Frontend (`client/src/`)

Vite + React 19 + Tailwind CSS 4 + shadcn/ui. Minimalist/clean design with dark mode.

- `contexts/` -- `AuthContext` (token, login, signup, logout), `ThemeContext` (dark/light/system)
- `hooks/` -- `use-feed.js` (CRUD + search/sort/tag), `use-debounce.js`
- `lib/` -- `api.js` (centralized fetch, auto Bearer token, 401 handling), `validators.js`
- `components/ui/` -- shadcn/ui primitives (Button, Card, Dialog, Sheet, etc.)
- `components/layout/` -- header, mobile-nav, root-layout
- `components/feed/` -- post-card, post-form, search-bar, tag-filter, sort-select, pagination
- `components/post/` -- like-button, comment-list, comment-form
- `components/profile/` -- profile-form, password-form
- `components/shared/` -- page-transition (Framer Motion), skeleton loaders, empty-state, page-loader (Suspense fallback)
- `components/map/` -- map-base (Leaflet + OSM tiles), pin-icon (SVG divIcon), location-picker (post form), post-location-map
- `pages/` -- home, login, signup, feed, my-journals, single-post, map, profile, not-found. Every page but home is `React.lazy` in `App.jsx`; `vite.config.js` puts React, Framer Motion and Leaflet in their own chunks

**Key patterns:**
- API base URL from `VITE_API_URL` env var (no hardcoded URLs); `VITE_DEMO_LOGIN=true` shows a demo login button that calls `POST /auth/demo` (server signs in as `DEMO_EMAIL`)
- The session is read from localStorage synchronously in `AuthProvider`, so protected routes do not redirect on reload
- `use-feed` and `use-map-posts` abort the previous request before starting a new one
- Auth via `useAuth()` context hook (no prop drilling)
- Dark/light mode via `useTheme()` with localStorage persistence
- Feed state (search, tag, sort, page) in local React state via `useState` (not URL params)
- Toast notifications (sonner) on all user actions
- Framer Motion page transitions and hover effects

### API Endpoints

**Auth:** `PUT /auth/signup`, `POST /auth/login`, `POST /auth/demo`, `GET /auth/profile`, `PUT /auth/profile`, `PUT /auth/password`, `GET /auth/user/:userId`

**Feed:** `GET|POST /feed/posts`, `GET|PUT|DELETE /feed/post/:postId`, `GET /feed/posts/:userId`, `GET /feed/search`, `GET /feed/tags`, `GET /feed/map`, `PUT /feed/post/:postId/like`

**Comments:** `GET|POST /feed/post/:postId/comments`, `DELETE /feed/comment/:commentId`