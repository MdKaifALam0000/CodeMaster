# CodeMaster - Full-Stack Coding Platform

A comprehensive coding platform with problem-solving capabilities, AI assistance, video tutorials, and administrative features.

🌐 **Live Demo**: [CodeMaster Frontend](https://codemaster-frontend.onrender.com)

---

Here’s a snapshot of the **CodeMaster Dashboard**:
<img width="952" height="441" alt="{B7DC8AD2-9CFF-433F-9DBB-724D0EEF2241}" src="https://github.com/user-attachments/assets/2e92e878-9c31-4c30-beeb-6b02bfb79676" />
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

CodeMaster/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── redis.js
│   │   │   └── cloudinary.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── problemController.js
│   │   │   ├── submissionController.js
│   │   │   ├── aiController.js
│   │   │   └── videoController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Problem.js
│   │   │   ├── Submission.js
│   │   │   └── Video.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── problems.js
│   │   │   ├── submissions.js
│   │   │   ├── ai.js
│   │   │   └── videos.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   ├── judge0.js
│   │   │   └── gemini.js
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   │   ├── vite.svg
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── editor/
│   │   │   │   └── CodeEditor.jsx
│   │   │   ├── ai/
│   │   │   │   └── AIChat.jsx
│   │   │   ├── video/
│   │   │   │   └── VideoPlayer.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── AdminDelete.jsx
│   │   │   ├── AdminUpdate.jsx
│   │   │   ├── AdminVideo.jsx
│   │   │   └── AdminUpload.jsx
│   │   ├── pages/
│   │   │   ├── Admin.jsx
│   │   │   ├── Homepage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProblemPage.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── store/
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── problemSlice.js
│   │   │   │   └── submissionSlice.js
│   │   │   └── store.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useProblems.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── App.css
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── README.md
├── .gitignore
├── package.json
└── README.md



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
