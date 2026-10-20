# Changelog

All notable changes to this project will be documented in this file.

## v0.9.0 - 2026-10-20

### Added

- Live demo at https://sagargupta.online/tour-vibes/ on GitHub Pages. `npm run build:demo` (client) builds the app for `/tour-vibes/` with an in-browser mock API in `src/lib/demo/` in place of the server: the same 20 routes, response shapes, validation messages and status codes, seeded from `server/seed/data.json`. Writes stay in the visitor's browser (localStorage for data, IndexedDB for downscaled photos), a banner says so and offers a reset, and the one-click demo login is on. `npm run dev:demo` runs it locally with no server or database. The new `Pages` workflow deploys it on every push to main that touches the client or the seed data. Normal and Docker builds contain none of the demo code
- Browsing is public: the feed, a single journal, the map, search, tags, comments and traveler pages no longer need an account. Posting, liking and commenting still do, and an anonymous visitor who tries gets a sign-in prompt that returns them to the same page
- Traveler pages at `/travelers/:userId`: avatar, bio, home base, member since, journal, place and like counts, a map of their pins and their journals. Every author name links to one
- Landing page rebuilt: a dotted world map with the most-liked journals pinned and joined by a route, a photo stack that follows the highlighted stop, a most-loved strip, how it works, a map teaser and a live journal count, all from one `GET /feed/posts?sort=popular`
- Map page: a list of the journals in view (side panel on desktop, card rail on phones) that flies the map to a pin, a count of journals in view, locate-me and fit-all controls, pins that drop in and a styled popup
- Feed filters (search, tag, sort, page) live in the URL, so a filtered feed can be shared and the back button works. Tags on cards and journals link to the filtered feed
- Single journal: full-bleed photo with a lightbox, share button (native share sheet or copy link), optimistic like with a heart burst, animated comments, and a confirm dialog before deleting
- Post form: drag-and-drop photo with preview, tags as chips, inline errors that match the server rules, and a "My location" button on the pin picker
- Sign in and sign up: split layout with an animated route illustration, show/hide password, a strength meter, field-level errors and a shake on failure. Sign up signs the user in straight away
- Profile: the avatar uploads as soon as it is picked with a live preview, a bio counter, unsaved-changes tracking and a link to the public traveler page
- My Journals: journal, place and like totals
- A design system: one blue accent in both themes, Schibsted Grotesk for headings (self-hosted like Inter), shared motion tokens in `src/lib/motion.js`, page transitions, a solid header with a sliding active-page pill, a theme toggle that grows the new theme out of the button, and a footer with links. Open Graph and Twitter tags with a 1200x630 share card, theme-color, an apple-touch-icon and a new favicon
- 20 more API tests (52 in total): public reads, anonymous writes, stale tokens on public routes, the public profile field list, and a regression test for most of the server fixes below

### Changed

- New optional-auth middleware on every public read: no token means anonymous, a bad or expired token is still a 401 so the client signs out
- Session and theme keys in localStorage are prefixed with `tour-vibes:`. The demo shares sagargupta.online with other apps that keep a bare `token`, which would have signed visitors in and out of each other. Anyone signed in before this release signs in once more
- `npm run dev` in `server/` uses `node --watch` instead of nodemon. Dropping nodemon clears the last 3 high `npm audit` findings (braces via chokidar, dev only)
- Server 5xx responses log the error and send "Something went wrong" instead of the raw driver message. Non-size multer errors are a 400. CORS runs before the body parser, so a malformed-JSON 400 is readable from the browser
- New limits, all 422s: title 5 to 200 characters, content up to 20000, location fields up to 100, name up to 80, at most 20 tags of 40 characters, and a valid travel date
- JS loaded on first paint is 649.81 kB raw (208.39 kB gzip), up from 596.27 kB (191.54 kB) for the new landing page and design system

### Fixed

- A duplicate signup with different letter case (Alice@x.com after alice@x.com) returned a 500
- `?tag=a&tag=b` returned a 500, and so did `?sort=popular` with a huge page number
- A failed create, edit or profile update (validation error, bad tags, not the owner) left the uploaded file on disk
- Editing a post or profile deleted the old image before the save, so a failed save left a broken image. Deleting a post now removes the record before the file
- Two quick likes from one user could count twice; likes now use an atomic `$addToSet` / `$pull`
- An edit could not clear the city, country or travel date
- A password with a trailing space could not be changed
- A blank `bbox=,,,` was accepted as the point 0,0
- Page transitions never played, and logging out from a signed-in page sent the user to the login page instead of home
- After sign-in, the user always landed on the feed instead of the page they came from
- `<Button asChild>` rendered a button wrapping a link; links styled as buttons are real links again
- The font stack named 'Inter', which never matched the installed 'Inter Variable', so the site rendered in the system font
- Every plain `border` was drawn in the text colour instead of the border colour
- Toasts ignored the app theme
- Travel dates showed the previous month for users west of UTC
- A new journal was added to whatever page or filter was showing, and deleting the last journal on a later page showed "No journals yet"
- A signed-in name change did not reach the header until the next login
- Map markers flickered away when a pan finished while the previous request was being read
- Dark map tiles showed hairline seams between tile rows on high-DPI phones
- Switching the theme again mid-animation left an unhandled promise rejection from the skipped view transition
- The comment form showed for anonymous visitors, whose comments then failed with a 401; the sort select showed the raw value `newest`; tag chips and comment delete buttons were not reachable or named for keyboard and screen reader users

## v0.8.0 - 2026-10-18

### Added

- Journal map at `/map`: every pinned journal on OpenStreetMap tiles with a photo popup per marker. Panning or zooming reloads only the pins inside the visible box, and each reload aborts the previous one
- Map pin picker in the post form: tap the map, drag the pin, or look the city and country up through Nominatim. A pinned journal shows its own map under the text
- `GET /feed/map?bbox=west,south,east,north` returns up to 500 pinned posts in the box, including boxes that cross the antimeridian. Posts take optional `lat` and `lng` fields, range-checked and required together
- API test suite: 32 `node:test` cases through supertest against an in-memory MongoDB, covering each v0.7.0 security fix, the feed, comments, likes and the map query. CI now runs them
- `npm run seed` (server) loads 5 demo users and 19 pinned journals with photos, likes and comments; re-running it only replaces the demo users and their data. Photos are Unsplash images credited in `server/seed/photos/CREDITS.md`
- Optional one-click demo login: `POST /auth/demo` signs in as the `DEMO_EMAIL` account, and the login page shows the button when built with `VITE_DEMO_LOGIN=true`. No demo password is committed or baked into the client; `npm run seed` uses `DEMO_PASSWORD` for the demo users, or a random one it never logs
- `docker-compose.yml` with MongoDB 8, the API and the client behind unprivileged nginx (port 8080 in the container): `docker compose up --build` runs the whole stack. CI gets a Docker smoke test that seeds the stack with a per-run random `DEMO_PASSWORD` and logs in as the demo user through `/auth/demo` and `/auth/login`
- `npm run bundle:report` (client) prints every JS chunk with raw and gzip size
- README screenshots (desktop and phone), testing and bundle size sections

### Changed

- Every page except Home is lazy-loaded, and React, Framer Motion and Leaflet build into their own chunks. JS loaded on first paint went from 673.12 kB to 596.27 kB raw (210.59 kB to 191.54 kB gzip) while adding the map, and the build no longer warns about chunks over 500 kB
- `toggleLike` moved to `controllers/like.js`, which brings `controllers/feed.js` back under the 250-line limit
- `server/app.js` exports the app and only connects and listens when run directly, so the tests can load it

### Fixed

- A malformed `:postId`, `:commentId` or `:userId` returned a 500 with the Mongoose CastError; it is now a 400 for every route
- Reloading or opening a link to a signed-in page (a journal, the map, the profile) bounced to `/journals`, because the stored session was restored after the first render
- A slow response for an earlier search or page could replace the results of a newer one in the feed; the older request is now aborted

## v0.7.0 - 2026-10-18

### Security

- Uploads are accepted only on the three routes that take a file (create post, update post, update profile), after the JWT check. Before, multer ran globally, so an anonymous multipart request to any path (even a 404) wrote a file to `server/images`
- Updating a post no longer takes the image path from the request body. A user could point their post at another user's image and then delete it by deleting their own post
- Every `/auth` route is now rate-limited: password change shares the 20 per 15 minutes login limit, profile reads and updates get 300 per 15 minutes (clears 8 CodeQL `js/missing-rate-limiting` alerts)
- Login returns `Invalid email or password` for both unknown email and wrong password, so the error text no longer says which emails are registered. Signup still reports a taken email, and an unknown email skips the bcrypt compare, so the endpoints are not enumeration-proof yet

### Fixed

- A failed login showed `Session expired` instead of the server message: the client treated every 401 as an expired session. Now only a 401 on a request that carried a token logs out
- A wrong current password on the change-password form logged the user out; the API now returns 422 for it
- An upload over 5MB returned 500; it now returns 413 `File too large`
- Replacing an avatar now deletes the old file instead of leaving it on disk
- The avatar picker accepts only PNG/JPG, matching the server; other formats were dropped silently
- `npm run install:all` now installs the root package too, so `npm run dev` finds `concurrently` on a fresh clone
- `server` `npm start` runs `node app.js`; nodemon moved to `npm run dev` (the root `server` script uses it). `main` points at `app.js`
- `.nvmrc` bumped from 19 to 24; Vite 8 needs Node 20.19+ or 22.12+
- Client lint passes again (14 errors to 0): JSX `motion` usage, `import.meta.dirname` in `vite.config.js`, pure `timeAgo` in the comment list, fast refresh rule scoped off for shadcn primitives and contexts
- Prettier drift in 3 client files

### Added

- `CI` workflow: client lint and build, server install, and Prettier check on every push and PR, via the shared `node-ci` workflow
- README: architecture diagram, design decisions table, Node requirement, `VITE_API_URL`

## v0.6.4 - 2026-10-13

### Fixed
- Bump the root shell-quote override from 1.9.0 to 1.11.0 for a critical Dependabot alert (#314) raised by the rescan after v0.6.3; the root lockfile version now matches package.json

## v0.6.3 - 2026-10-13

### Fixed
- Resolve 5 Dependabot alerts: proxy-addr 2.0.8 (critical IP spoofing, server), brace-expansion 5.0.12 (server) and 1.1.21 (client), source-map-js 1.2.2 and js-yaml 4.3.2 (client), via the existing overrides
- Client lockfile resolves again: @vitejs/plugin-react 4.7 did not accept vite 8, so `npm ci` failed; bumped to 5.2.0 with @tailwindcss/vite and tailwindcss 4.3.3

## v0.6.2 - 2026-09-03

### Fixed
- Resolve 4 new Dependabot security alerts
- Client: `browserslist` bumped to 4.28.8 (high, #294), `@humanfs/node` to 0.16.8 (#296)
- Server: override `qs` >=6.16.0, resolves to 6.16.0 (#297, #298)

## v0.6.1 - 2026-09-03

### Fixed
- Resolve 19 open Dependabot security alerts across root, client, and server
- Client: `react-router-dom` bumped to v7.18.2+ (react-router CVEs), overrides for `js-yaml` 4.3.1, `postcss` 8.5.23, `brace-expansion` 1.1.16, `@babel/core` 7.29.6
- Server: `mongoose` bumped to v9.7.2+, `body-parser` to v2.3.0+, overrides for `ip-address` 10.3.1 and `brace-expansion` 5.0.7
- Root: override for `shell-quote` 1.9.0

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
