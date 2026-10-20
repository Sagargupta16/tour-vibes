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
npm run server     # Express on port 8000 (node --watch)
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
npm run dev:demo       # serverless demo at localhost:3000/tour-vibes/ (in-browser mock API)
npm run build:demo     # the GitHub Pages build: base /tour-vibes/, mock API, 404.html fallback

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
- `DEMO_PASSWORD` -- optional, read by `npm run seed` for the demo users; unset, the seed uses a random one and never logs it

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

- `routes/feed.js` -- post CRUD, search, tags, likes, comments. Every GET is public through `optional-auth`; writes use `isAuth`
- `routes/auth.js` -- signup, login, profile, password change (every route rate-limited)
- `controllers/feed.js` / `controllers/auth.js` / `controllers/comment.js` / `controllers/like.js` / `controllers/map.js` (bbox query, antimeridian split)
- `models/post.js` / `models/users.js` / `models/comment.js`
- `middleware/is-auth.js` -- JWT verification from `process.env.JWT_SECRET`
- `middleware/optional-auth.js` -- public reads: no `Authorization` header is anonymous, any header goes through `is-auth` (a stale token is still a 401, which signs the client out)
- `middleware/upload.js` -- Multer (5MB, PNG/JPG), mounted per route after `isAuth` on create/update post and update profile
- `middleware/valid-id.js` -- `router.param` guard: malformed `:postId`, `:commentId`, `:userId` is a 400
- `test/` -- `setup.js` (in-memory MongoDB, user/post helpers) plus one file per area; run with `--test-concurrency=1` because the files share `images/`
- `scripts/seed.js` + `seed/data.json` + `seed/photos/` -- demo data; photo credits in `seed/photos/CREDITS.md`
- `util/helpers.js` -- shared pagination (page capped at 100000), path normalization, image cleanup, `discardUpload` (multer writes before validation, so every failed request that carried a file removes it)

**Key patterns:**
- All mutations check ownership (`post.creator === req.userId`); an old image is deleted only after the save that replaces it succeeds
- 5xx responses log the error and send a generic message; validation errors are 422 with the express-validator `data` array
- Pagination: 10 per page, `?page=N&sort=newest|oldest|popular&tag=X`
- Full-text search: `GET /feed/search?q=keyword`
- Tags sent as JSON array string in FormData
- Location sent as `locationName` + `locationCountry` fields; optional map pin as `lat` + `lng` (both or neither; empty strings on edit remove the pin)
- `GET /feed/map?bbox=west,south,east,north` -- pinned posts in the box, max 500

### Frontend (`client/src/`)

Vite + React 19 + Tailwind CSS 4 + shadcn/ui on Base UI. One blue accent (`--primary`) in both themes, flat bordered cards, visible motion; glassmorphism, gradient text and glow are out. Headings use Schibsted Grotesk, body Inter (both self-hosted via Fontsource).

- `contexts/` -- `AuthContext` (token, userId, userName, avatar, login, demoLogin, signup, logout, updateUser, refreshUser), `ThemeContext` (dark/light/system)
- `hooks/` -- `use-feed.js` (CRUD + search/sort/tag, page from outside or its own), `use-map-posts.js`, `use-debounce.js`
- `lib/` -- `api.js` (centralized fetch, auto Bearer token, 401 handling, demo switch), `session.js` (prefixed session keys), `motion.js` (shared easings, springs, durations, variants), `validators.js`, `geocode.js` (Nominatim)
- `lib/demo/` -- the in-browser mock API for the Pages build: the server's routes, shapes and status codes, seeded from `public/demo/data.json`, data in localStorage (`tv-demo:*`), photos in IndexedDB
- `styles/` -- `utilities.css` (`tv-container`, `tv-eyebrow`, `tv-hit` 44px tap area, `tv-press` and friends) and `leaflet.css` (map, pin and popup theming), both imported by `index.css`
- `components/ui/` -- shadcn/ui primitives (Button with working `asChild`, `soft` variant, `xl` size; Card, Dialog, Sheet, etc.)
- `components/layout/` -- header, nav-items, user-menu, theme-toggle, mobile-nav, site-footer, root-layout (keyed motion.div around a frozen `useOutlet()`, so the leaving page animates out)
- `components/home/` -- landing sections: hero, hero-visual (dotted world map, pins, route), photo-stack, featured journals, how-it-works, map-teaser, closing CTA
- `components/auth/` -- auth-shell and visual, form fields, demo login button, `use-auth-form`, `use-return-to`, protected-route
- `components/feed/` -- post-card, post-grid, post-form (+ body, image drop zone, tag input), search-bar, tag-filter, sort-select, pagination, feed-hero, journal-stats, `use-feed-params` (URL state)
- `components/post/` -- post-hero, photo-lightbox, post-meta, like-button, share-button, confirm-dialog, comment list/item/form, sign-in-prompt, `use-require-auth`
- `components/profile/`, `components/traveler/` -- profile header, avatar upload, forms; traveler header, stats, map
- `components/map/` -- map-base (Leaflet + OSM tiles), pin-icon, journal marker and popup, map controls, count chip, journal list, location-picker (post form), post-location-map
- `components/shared/` -- page-transition, skeleton loaders, empty-state, page-loader (Suspense fallback)
- `components/demo/` -- the live demo banner (demo build only)
- `pages/` -- home, login, signup, feed, my-journals, single-post, map, traveler, profile, not-found. Every page but home is `React.lazy` in `App.jsx`; `vite.config.js` puts React, Framer Motion and Leaflet in their own chunks

**Key patterns:**
- API base URL from `VITE_API_URL` env var (no hardcoded URLs); `VITE_DEMO_LOGIN=true` shows a demo login button that calls `POST /auth/demo` (server signs in as `DEMO_EMAIL`)
- Components reach the API only through `api` and `imageUrl()` from `lib/api.js`. `vite --mode demo` sets `VITE_STATIC_DEMO`, base `/tour-vibes/` and the demo login; `api.js` then dynamic-imports `lib/demo`, so normal and Docker builds contain no demo code
- Public routes: `/`, `/login`, `/signup`, `/journals`, `/journals/:postId`, `/map`, `/travelers/:userId`. `/myjournals` and `/profile` sit behind `ProtectedRoute`, which sends `state.from` to `/login`; login, the demo login and signup return there
- A page animating out already sees the next location, so render-time redirects check `useIsPresent()`, and sign-out wraps `logout()` and `navigate('/')` in one `startTransition`
- Session and theme keys in localStorage carry the `tour-vibes:` prefix (the Pages origin is shared with other apps)
- The session is read from localStorage synchronously in `AuthProvider`, so protected routes do not redirect on reload
- `use-feed` and `use-map-posts` abort the previous request before starting a new one
- Auth via `useAuth()` context hook (no prop drilling)
- Dark/light mode via `useTheme()` with localStorage persistence
- Feed state (q, tag, sort, page) lives in the URL search params (`use-feed-params`); search and tag are exclusive because the search endpoint ignores tag and sort
- Toast notifications (sonner) on all user actions
- Framer Motion everywhere, with the values from `lib/motion.js`; never add prefers-reduced-motion

### API Endpoints

**Auth:** `PUT /auth/signup`, `POST /auth/login`, `POST /auth/demo`, `GET /auth/profile`, `PUT /auth/profile`, `PUT /auth/password`, `GET /auth/user/:userId`

**Feed:** `GET|POST /feed/posts`, `GET|PUT|DELETE /feed/post/:postId`, `GET /feed/posts/:userId`, `GET /feed/search`, `GET /feed/tags`, `GET /feed/map`, `PUT /feed/post/:postId/like`

**Comments:** `GET|POST /feed/post/:postId/comments`, `DELETE /feed/comment/:commentId`