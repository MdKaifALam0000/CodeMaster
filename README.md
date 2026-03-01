# CodeMaster - Full-Stack Coding Platform

A comprehensive coding platform with problem-solving capabilities, AI assistance, video tutorials, and administrative features.

🌐 **Live Demo**: [CodeMaster](https://codemaster-frontend.onrender.com)

---

Here’s a snapshot of the **CodeMaster Dashboard**:
 /<img width="952" height="436" alt="Screenshot 2026-01-05 204523" src="https://github.com/user-attachments/assets/95376b82-a407-488e-896e-6cacd4d8f0f4" />

---

## 🚀 Features

- **User Authentication**: Secure JWT-based login/signup system  
- **Problem Solving**: Interactive coding environment with Monaco Editor  
- **AI Chat Assistant**: Integrated Google Gemini AI for coding help  
- **Video Tutorials**: Upload and manage educational content  
- **Admin Panel**: Complete CRUD operations for problems and content  
- **Real-time Submissions**: Code execution and validation system  
- **Redis Caching**: Optimized performance with Redis integration  

---

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



---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js  
- **Framework**: Express.js  
- **Database**: MongoDB Atlas  
- **Cache**: Redis Cloud  
- **Authentication**: JWT + bcrypt  
- **File Storage**: Cloudinary  
- **AI Integration**: Google Gemini API  

### Frontend
- **Framework**: React 19 + Vite  
- **State Management**: Redux Toolkit  
- **Styling**: TailwindCSS + DaisyUI  
- **Code Editor**: Monaco Editor  
- **Animations**: Framer Motion  
- **Icons**: Lucide React + React Icons  
- **Video Player**: React Player  

---

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
- Problem management (CRUD)  
- Video content upload  
- Role-based access control  

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch  
3. Make your changes  
4. Test thoroughly  
5. Submit a pull request  

---

## 📄 License

This project is licensed under the **ISC License**.

---

✨ **Happy Coding with CodeMaster!**
