# Tour Vibes

A full-stack travel journal web application built with the MERN stack. Share travel experiences, photos, and adventures with a community of fellow travelers.

## Features

- **Authentication** -- signup, login, JWT tokens with 1-hour expiry, auto-logout
- **User Profiles** -- bio, avatar, location, password change
- **Travel Posts** -- create, edit, delete with image uploads, tags, location, and travel date
- **Likes and Comments** -- like/unlike posts, comment threads with delete
- **Community Feed** -- all posts with pagination, sort by newest/oldest/popular, filter by tag
- **Personal Feed** -- view your own posts
- **Search** -- full-text search across titles, content, and tags
- **Rate Limiting** -- auth endpoints rate-limited to prevent brute force
- **Responsive Design** -- mobile-friendly with hamburger navigation

## Tech Stack

**Frontend:** React 18, React Router 7, CSS3
**Backend:** Express 5, Mongoose 9, MongoDB Atlas
**Auth:** JWT + bcryptjs
**Uploads:** Multer (local disk, 5MB limit, PNG/JPG only)
**Tooling:** Prettier, Concurrently, Nodemon, Renovate

## Quick Start

```bash
git clone https://github.com/Sagargupta16/tour-vibes.git
cd tour-vibes
npm run install:all
```

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

Fill in `MONGODB_URI` and `JWT_SECRET` (required), then:

```bash
npm run dev
```

Frontend runs on http://localhost:3000, backend on http://localhost:8000.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both servers together (concurrently) |
| `npm run server` | Backend only |
| `npm run client` | Frontend only |
| `npm run build` | Production build of client |
| `npm run install:all` | Install deps in both server and client |
| `npm run format` | Format all JS/CSS with Prettier |
| `npm run format:check` | Check formatting without writing |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/tour-vibes` | MongoDB connection string |
| `JWT_SECRET` | Yes | -- | Secret for signing JWT tokens |
| `PORT` | No | `8000` | Server port |
| `CLIENT_URL` | No | `http://localhost:3000` | Allowed CORS origin |

## API Endpoints

### Auth (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/signup` | Register (rate-limited) |
| POST | `/login` | Login (rate-limited) |
| GET | `/profile` | Get own profile |
| PUT | `/profile` | Update profile (name, bio, location, avatar) |
| PUT | `/password` | Change password |
| GET | `/user/:userId` | View public profile |

### Feed (`/feed`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts?page=1&sort=newest&tag=beach` | List posts (paginated, filterable) |
| GET | `/posts/:userId` | User's posts |
| POST | `/posts` | Create post (multipart form) |
| GET | `/post/:postId` | Single post |
| PUT | `/post/:postId` | Update post |
| DELETE | `/post/:postId` | Delete post |
| GET | `/search?q=keyword` | Full-text search |
| GET | `/tags` | All unique tags |
| PUT | `/post/:postId/like` | Toggle like |
| GET | `/post/:postId/comments` | List comments |
| POST | `/post/:postId/comments` | Add comment |
| DELETE | `/comment/:commentId` | Delete comment |

## Project Structure

```
tour-vibes/
├── client/src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom hooks (useFeed)
│   ├── pages/            # Route pages (Home, Auth, Feed)
│   └── util/             # Validators, image helpers
├── server/
│   ├── controllers/      # Route handlers (auth, feed, comment)
│   ├── middleware/        # JWT auth middleware
│   ├── models/           # Mongoose schemas (User, Post, Comment)
│   ├── routes/           # Express route definitions
│   ├── util/             # Shared helpers
│   └── images/           # Uploaded images (gitignored)
├── package.json          # Root scripts (dev, format, build)
├── .prettierrc           # Code formatting config
└── CLAUDE.md             # AI assistant instructions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes using conventional commits (`feat:`, `fix:`, `refactor:`)
4. Push and open a Pull Request

## License

[MIT](LICENSE)
