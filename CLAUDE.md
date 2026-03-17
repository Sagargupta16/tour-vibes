# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

- **Every file must stay under 250 lines.** If a file approaches this limit, split it into smaller, focused modules.
- **Always use latest stable versions** of dependencies, APIs, and language features. No deprecated patterns.
- **Follow current best practices** -- functional components with hooks (no class components), async/await (no .then chains), ES module-style imports where possible, proper error handling.
- 3-space indentation (`.editorconfig`).
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

## Development Commands

```bash
# Both servers together (from root)
npm run dev

# Individual
npm run server     # Express on port 8000 (nodemon)
npm run client     # CRA React on port 3000

# Install all deps
npm run install:all

# Build frontend
npm run build
```

## Environment Setup

Copy `server/.env.example` to `server/.env` and fill in:
- `MONGODB_URI` -- MongoDB Atlas connection string
- `JWT_SECRET` -- required, server won't start without it
- `PORT` -- defaults to 8000
- `CLIENT_URL` -- defaults to `http://localhost:3000` (used for CORS)

## Architecture

Root `package.json` uses `concurrently` to run both packages:

```
client/   -- React 18 SPA (CRA, react-scripts 5, react-router-dom 7)
server/   -- Express 5 REST API with MongoDB (Mongoose 9)
```

### Backend (`server/`)

Entry point: `app.js` -- Express, Multer (5MB limit, PNG/JPG only), CORS, MongoDB connection.

- `routes/feed.js` -- post CRUD, search, tags, likes, comments
- `routes/auth.js` -- signup, login, profile, password change (rate-limited)
- `controllers/feed.js` / `controllers/auth.js` / `controllers/comment.js`
- `models/post.js` / `models/users.js` / `models/comment.js`
- `middleware/is-auth.js` -- JWT verification from `process.env.JWT_SECRET`

**Key patterns:**
- All mutations check ownership (`post.creator === req.userId`)
- Pagination: 10 per page, `?page=N&sort=newest|oldest|popular&tag=X`
- Full-text search: `GET /feed/search?q=keyword`
- Tags sent as JSON array string in FormData
- Location sent as `locationName` + `locationCountry` fields

### Frontend (`client/src/`)

Functional components with hooks. Auth state in `App.js` via `useState`, stored in localStorage.

- `pages/` -- Home, Auth (Login/Signup), Feed (Feed, PersonalFeed, SinglePost)
- `components/` -- Layout, Navigation, Feed/Post, Form inputs, Modal, Paginator, ErrorHandler
- Routing: react-router-dom v7 (`Routes`/`Route`/`Navigate`/`useNavigate`/`useParams`)
- Styling: plain CSS files per component

### API Endpoints

**Auth:** `PUT /auth/signup`, `POST /auth/login`, `GET /auth/profile`, `PUT /auth/profile`, `PUT /auth/password`, `GET /auth/user/:userId`

**Feed:** `GET|POST /feed/posts`, `GET|PUT|DELETE /feed/post/:postId`, `GET /feed/posts/:userId`, `GET /feed/search`, `GET /feed/tags`, `PUT /feed/post/:postId/like`

**Comments:** `GET|POST /feed/post/:postId/comments`, `DELETE /feed/comment/:commentId`
