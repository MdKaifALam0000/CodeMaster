# CodeMaster - Full-Stack Coding Platform

A comprehensive coding platform with problem-solving capabilities, AI assistance, video tutorials, and administrative features.

## 🚀 Features

- **User Authentication**: Secure JWT-based login/signup system
- **Problem Solving**: Interactive coding environment with Monaco Editor
- **AI Chat Assistant**: Integrated Google Gemini AI for coding help
- **Video Tutorials**: Upload and manage educational content
- **Admin Panel**: Complete CRUD operations for problems and content
- **Real-time Submissions**: Code execution and validation system
- **Redis Caching**: Optimized performance with Redis integration

## 🏗️ Project Structure

```
CodeMaster/
├── Backend/                    # Node.js/Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   └── redis.js       # Redis client configuration
│   │   ├── controllers/
│   │   │   ├── solveDoubt.js      # AI chat functionality
│   │   │   ├── userAuthenticate.js # Auth controllers
│   │   │   ├── userProblem.js     # Problem CRUD operations
│   │   │   ├── userSubmission.js  # Code submission handling
│   │   │   └── videoSection.js    # Video management
│   │   ├── middleware/
│   │   ├── routes/
│   │   │   ├── aiChatting.js      # AI chat routes
│   │   │   ├── problemCreator.js  # Problem management routes
│   │   │   ├── submit.js          # Submission routes
│   │   │   ├── userAuth.js        # Authentication routes
│   │   │   └── videoCreator.js    # Video routes
│   │   └── index.js               # Main server file
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── package-lock.json
├── frontend/                      # React/Vite Frontend
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AdminPanel.jsx     # Admin problem creation
│   │   │   ├── AdminDelete.jsx    # Admin deletion interface
│   │   │   ├── AdminUpdate.jsx    # Admin update interface
│   │   │   ├── AdminVideo.jsx     # Admin video management
│   │   │   └── AdminUpload.jsx    # Admin file upload
│   │   ├── pages/
│   │   │   ├── Admin.jsx          # Admin dashboard
│   │   │   ├── Homepage.jsx       # Main user interface
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── ProblemPage.jsx    # Problem solving interface
│   │   │   └── Signup.jsx         # Registration page
│   │   ├── store/
│   │   │   └── store.js           # Redux store configuration
│   │   ├── App.jsx                # Main app component
│   │   ├── authSlice.js           # Redux auth slice
│   │   ├── index.css              # Global styles
│   │   └── main.jsx               # App entry point
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── .gitignore                     # Project-wide gitignore
└── README.md                      # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Cache**: Redis Cloud
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini API
- **HTTP Client**: Axios

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: TailwindCSS + DaisyUI
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **Video Player**: React Player
- **Forms**: React Hook Form + Zod

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Redis Cloud account
- Cloudinary account
- Google Gemini API key

### Backend Setup
```bash
cd Backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `Backend/.env` with:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_PASSWORD=your_redis_password
GEMINI_API_KEY=your_gemini_api_key
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
CLOUD_NAME=your_cloudinary_cloud_name
```

## 🌐 Deployment on Render.com

### Step 1: Repository Setup
1. Push your code to GitHub/GitLab
2. Ensure `.gitignore` excludes sensitive files
3. Remove `.env` from version control

### Step 2: Backend Deployment (Web Service)
1. **Create New Web Service** on Render
2. **Connect Repository** and select your repo
3. **Configuration**:
   - **Name**: `codemaster-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd Backend && npm install`
   - **Start Command**: `cd Backend && npm start`
   - **Plan**: Free or Starter

4. **Environment Variables**: Add all variables from your `.env` file
5. **Deploy**: Click "Create Web Service"

### Step 3: Frontend Deployment (Static Site)
1. **Create New Static Site** on Render
2. **Connect Repository** (same repo)
3. **Configuration**:
   - **Name**: `codemaster-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. **Deploy**: Click "Create Static Site"

### Step 4: Update CORS Configuration
After frontend deployment, update `Backend/src/index.js`:
```javascript
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://your-frontend-url.onrender.com' 
        : 'http://localhost:5173',
    credentials: true
}))
```

### Step 5: Update Frontend API Configuration
Create `frontend/src/config/api.js`:
```javascript
export const API_BASE_URL = import.meta.env.PROD 
    ? 'https://your-backend-url.onrender.com'
    : 'http://localhost:3000';
```

## 📝 API Endpoints

### Authentication
- `POST /user/signup` - User registration
- `POST /user/login` - User login
- `GET /user/logout` - User logout
- `GET /user/check-auth` - Check authentication status

### Problems
- `GET /problem/all` - Get all problems
- `POST /problem/create` - Create new problem (Admin)
- `PUT /problem/update/:id` - Update problem (Admin)
- `DELETE /problem/delete/:id` - Delete problem (Admin)

### Submissions
- `POST /submission/submit` - Submit code solution
- `GET /submission/history` - Get submission history

### AI Chat
- `POST /ai/chat` - Chat with AI assistant

### Videos
- `POST /video/upload` - Upload video content (Admin)
- `GET /video/all` - Get all videos

## 🔧 Development Commands

### Backend
```bash
npm start        # Production server
npm run dev      # Development with nodemon
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Sensitive data protection
- **Input Validation**: Server-side validation
- **Role-based Access**: Admin-only routes protection

## 🎯 Key Features Explained

### Problem Solving Environment
- Monaco Editor integration for code editing
- Multiple language support
- Real-time code execution
- Submission tracking and history

### AI Integration
- Google Gemini AI for coding assistance
- Context-aware responses
- Problem-specific help

### Admin Dashboard
- Complete problem management
- Video content upload
- User management capabilities
- Analytics and monitoring

## 🚨 Important Notes

### For Production Deployment
- Update CORS origins to match your deployed URLs
- Use environment variables for all sensitive data
- Configure proper error handling and logging
- Set up monitoring and health checks

### Database Considerations
- MongoDB Atlas is already configured
- Redis Cloud provides caching layer
- Ensure connection strings are secure

### Performance Optimization
- Redis caching for frequently accessed data
- Cloudinary for optimized media delivery
- Vite for fast frontend builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For deployment issues or questions:
1. Check Render.com logs for error details
2. Verify all environment variables are set
3. Ensure database connections are working
4. Check CORS configuration for frontend-backend communication

---

**Happy Coding! 🎉**
