# 🌍 Tour Vibes

A modern, full-stack travel journal web application that allows users to share their travel experiences, memories, and adventures with a community of fellow travelers.

## ✨ Features

- **User Authentication**: Secure login and signup with JWT token-based authentication
- **Travel Posts**: Create, edit, and delete travel posts with images and descriptions
- **Personal Feed**: View your own travel posts in a dedicated personal feed
- **Community Feed**: Explore travel posts from other users
- **Image Upload**: Upload and manage travel photos with your posts
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Pagination**: Efficient loading of posts with paginated results

## 🛠️ Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **React Router DOM v6** - Client-side routing
- **CSS3** - Custom styling with responsive design
- **JWT** - Token-based authentication

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token for authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

## 📁 Project Structure

```text
tour-vibes/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable React components
│       ├── pages/        # Page components
│       └── util/         # Utility functions
├── server/                # Express backend
│   ├── controllers/      # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── images/          # Uploaded images storage
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sagargupta16/tour-vibes.git
   cd tour-vibes
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the server directory:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=8000
   ```

5. **Start the development servers**

   **Terminal 1 - Backend:**

   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Frontend:**

   ```bash
   cd client
   npm start
   ```

6. **Access the application**

   - Frontend: <http://localhost:3000>
   - Backend API: <http://localhost:8000>

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Feed Endpoints

- `GET /feed/posts` - Get all posts (paginated)
- `GET /feed/posts/:userId` - Get user-specific posts
- `POST /feed/posts` - Create a new post
- `GET /feed/post/:postId` - Get single post
- `PUT /feed/post/:postId` - Update a post
- `DELETE /feed/post/:postId` - Delete a post

## 🔧 Configuration

### Database Setup

The application uses MongoDB Atlas. Update the connection string in `server/app.js` or use environment variables for better security.

### File Storage

Images are stored locally in the `server/images` directory. For production, consider using cloud storage solutions like AWS S3 or Cloudinary.

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. Build the React app: `npm run build` in the client directory
2. Deploy the `build` folder to your hosting platform

### Backend Deployment (Heroku/Railway)

1. Set up environment variables on your hosting platform
2. Deploy the server directory
3. Update CORS settings for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Known Issues & Future Enhancements

### Current Limitations

- MongoDB credentials are hardcoded (should use environment variables)
- Image storage is local (consider cloud storage for production)
- Limited post editing features

### Planned Features

- User profiles with avatars
- Like and comment system
- Location tagging with maps integration
- Search and filter functionality
- Social features (follow/unfollow users)
- Dark mode theme

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Contact the maintainer

---

Happy Traveling! 🗺️✈️
