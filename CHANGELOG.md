# Changelog

All notable changes to this project will be documented in this file.

## v0.6.0 - 2026-03-17

### Added
- Root `package.json` with `concurrently` to run both servers via `npm run dev`
- Prettier formatting with `npm run format` and `npm run format:check`
- User profile endpoints (GET/PUT `/auth/profile`, PUT `/auth/password`, GET `/auth/user/:userId`)
- User model fields: `bio`, `avatar`, `location`
- Post model fields: `tags`, `location` (name + country), `travelDate`, `likes`
- Comment model and CRUD (`/feed/post/:postId/comments`, `/feed/comment/:commentId`)
- Like/unlike toggle (`PUT /feed/post/:postId/like`)
- Full-text search (`GET /feed/search?q=keyword`) with text index
- Tag listing and filtering (`GET /feed/tags`, `?tag=beach`)
- Sort options (`?sort=newest|oldest|popular`)
- Rate limiting on auth endpoints (20 req / 15 min)
- `server/util/helpers.js` for shared controller utilities
- `client/src/hooks/useFeed.js` custom hook for shared feed logic

### Changed
- Pagination bumped from 2 to 10 posts per page
- All frontend class components converted to functional components with hooks
- React Router migrated from v5 API to v7 (Routes/Navigate/useNavigate/useParams)
- `index.js` migrated to React 18 `createRoot` API
- `react-scripts` fixed from `^0.0.0` to v5
- JWT secret moved from hardcoded to `process.env.JWT_SECRET` (required at startup)
- JWT verify errors return 401 instead of 500
- Multer `fileFilter` returns booleans, file size limited to 5MB
- Post update/delete checks ownership (403 if not creator)
- User model: unique email index, timestamps, model name `'User'`
- Post model: `ref` uses `'User'` string, not imported schema
- Password minimum raised from 5 to 8 characters
- Login validates input with express-validator
- Deprecated `.count()` -> `.countDocuments()`, `ObjectId()` -> `new ObjectId()`
- Path traversal protection in `clearImage`
- Removed unused `bcrypt` (kept `bcryptjs`), added `express-rate-limit`

### Removed
- `.maintenance` file
- `.cleanthat/` directory (replaced by Prettier)
- `.python-version` (not a Python project)

## v0.5.0 - 2026-03-14

### Added
- `.env.example` for server configuration (`MONGODB_URI`, `PORT`, `CLIENT_URL`)

### Fixed
- Resolve client security vulnerabilities via npm audit fix
- Resolve remaining client dependency vulnerabilities

## v0.4.0 - 2026-03-05

### Added
- `.editorconfig` with 3-space indentation
- `.dockerignore` for future containerization
- `.gitattributes` configuration
- `SECURITY.md` security policy
- `CODEOWNERS` file
- `FUNDING.yml` for GitHub Sponsors
- Pull request template
- `.nvmrc` pinned to Node 19
- `.python-version` pinned to 3.11

### Changed
- Repository maintenance and configuration overhaul (PRs #136-#156)

## v0.3.0 - 2026-02-22

### Added
- MIT License

### Changed
- **Express v4 -> v5** (PR #83)
- **react-router-dom v6 -> v7** (PR #85)
- **Mongoose v8 -> v9** (PR #130)
- Renovate configured for monthly grouped dependency updates
- Server uses `dotenv` for environment variable loading
- MongoDB connection uses `MONGODB_URI` env var with localhost fallback

### Fixed
- Dependency vulnerabilities via npm audit fix
- react-scripts updated to ^0.9.0

## v0.2.0 - 2025-08-03

### Changed
- **bcrypt v5 -> v6** (PR #81)
- **body-parser v1 -> v2** (PR #82)
- **uuid v9 -> v11** (PR #72)
- **bcryptjs v2 -> v3** (PR #76)
- express updated to v4.21.2
- mongoose updated to v8.17.0
- express-validator updated to v7.2.1
- react-router-dom updated to v6.30.1
- nodemon updated to v3.1.10
- multer updated to v1.4.5-lts.2

### Fixed
- Security vulnerability in body-parser (PR #71)
- Security vulnerability in express (PR #66)
- Security vulnerability in mongoose (PR #74)

## v0.1.3 - 2024-04-26

### Changed
- React monorepo updated to v18.3.1
- uuid updated to v11 (Oct 2024)
- express-validator updated to v7.2.1 (Dec 2024)

## v0.1.2 - 2023-12-31

### Changed
- mongoose updated to v8 (PR #54)
- react-router-dom updated to v6.21.1
- nodemon updated to v3.0.2

### Fixed
- Security update for npm_and_yarn at /server (PR #57)

## v0.1.1 - 2023-06-02

### Added
- Renovate for automated dependency management (PR #15)
- Cleanthat for automated code formatting (PR #35)

### Changed
- **Major dependency upgrades via Renovate:**
  - express v4.18.2
  - mongoose v6 -> v7 (PR #26)
  - jsonwebtoken v8 -> v9 (PR #25)
  - react v17 -> v18 (PR #30)
  - react-router-dom v5 -> v6 (PR #27)
  - react-scripts v4 -> v5 (PR #28)
  - express-validator v6 -> v7 (PR #24)
  - uuid v8 -> v9 (PR #29)
  - nodemon v2 -> v3 (PR #42)
  - bcrypt updated to v5.1.1
  - body-parser updated to v1.20.2

## v0.1.0 - 2023-03-11

### Added
- Initial project setup with React frontend and Express backend
- User authentication (signup and login) with JWT tokens
- Password hashing with bcrypt
- Travel post CRUD (create, read, update, delete)
- Image upload with Multer (local disk storage)
- Community feed with pagination (all users' posts)
- Personal feed (current user's posts only)
- Single post detail view
- Responsive navigation with mobile hamburger menu
- Form validation with express-validator
- Auto-logout on token expiry
- MongoDB with Mongoose ODM for data persistence

### Contributors
- @Sagargupta16
- @KiranRana123 (signup page and CSS, name fix - PRs #3, #4, #11)
