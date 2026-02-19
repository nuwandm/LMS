# LearnHub Backend Server

Express.js REST API for LearnHub LMS Platform

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required Configuration:**

#### MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user (remember username & password)
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string and replace in `.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/learnhub
   ```

#### Cloudinary (Video Hosting)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add to `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### SendGrid (Email)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key with "Mail Send" permissions
3. Verify sender email
4. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.your_key_here
   EMAIL_FROM=noreply@yourdomain.com
   ```

#### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Add to `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### 3. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 4. Test API

Visit: `http://localhost:5000/api/health`

Should return:
```json
{
  "success": true,
  "message": "LearnHub API is running",
  "environment": "development",
  "timestamp": "2024-02-18T..."
}
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon (auto-reload)

## Project Structure

```
server/
├── config/           # Configuration files (db, cloudinary, email)
├── controllers/      # Request handlers and business logic
├── middleware/       # Auth, role, upload, error middleware
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Email & Cloudinary helper services
├── utils/           # Utility functions
├── .env            # Environment variables (not in git)
├── .env.example    # Environment template
├── server.js       # Entry point
└── package.json    # Dependencies
```

## API Endpoints (Current)

- `GET /` - Welcome message
- `GET /api/health` - Health check

## API Endpoints (Coming Soon)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/google` - Google OAuth

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (Instructor)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollments
- `POST /api/enrollments` - Request enrollment
- `GET /api/enrollments/my` - My enrollments
- `PUT /api/enrollments/:id/approve` - Approve (Admin)

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/users` - List users

## Development Workflow

1. **Phase 1** ✅ - Server setup & database connection
2. **Phase 2** 🔄 - Build models, controllers, and routes
3. **Phase 3** ⏳ - Add authentication & authorization
4. **Phase 4** ⏳ - Implement file uploads
5. **Phase 5** ⏳ - Add email notifications

## Security Features

✅ Helmet.js security headers
✅ CORS restricted to client URL
✅ MongoDB injection prevention
✅ Cookie parser for httpOnly cookies
✅ Environment-based configuration
⏳ Rate limiting (coming)
⏳ JWT authentication (coming)
⏳ File upload validation (coming)

## Troubleshooting

### MongoDB Connection Failed
- Check your connection string in `.env`
- Verify database user credentials
- Ensure IP address is whitelisted in MongoDB Atlas

### Port Already in Use
```bash
# Change PORT in .env file
PORT=5001
```

### CORS Errors
- Verify `CLIENT_URL` in `.env` matches your frontend URL
- No trailing slash in URL

## Next Steps

1. ✅ Backend server running
2. 🔄 Create Mongoose models (User, Course, Lecture, Enrollment)
3. ⏳ Build authentication system
4. ⏳ Implement course CRUD operations
5. ⏳ Add video upload functionality

---

**Status:** Phase 1.1 Complete ✅
**Next:** Create database models
