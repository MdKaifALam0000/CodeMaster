# 📊 CodeMaster Dashboard Feature

## Overview
A comprehensive user dashboard system with profile management, progress tracking, and beautiful animations. The dashboard provides users with detailed insights into their coding journey, profile customization options, and visual progress representations.

## ✨ Features

### 1. **Animated Sidebar Dashboard**
- Smooth slide-in/slide-out animations using Framer Motion
- Left-side placement with overlay backdrop
- Three main sections:
  - **Profile**: View user information and statistics
  - **Progress**: Detailed progress tracking with charts
  - **Settings**: Update profile information and preferences

### 2. **Profile Popup**
- Animated popup triggered by clicking profile picture
- Quick access to dashboard sections
- User information display
- Logout functionality

### 3. **Profile Management**
- **Profile Picture Upload**
  - Direct upload to Cloudinary
  - Automatic image optimization (400x400px, face-centered)
  - Progress indicator during upload
  - Delete existing profile picture
  - Max file size: 5MB
  
- **Profile Information**
  - First Name & Last Name
  - Age
  - Bio (max 500 characters)
  - Skills (comma-separated)
  - GitHub URL
  - LinkedIn URL

### 4. **Progress Tracking**
- **Visual Charts** (using Recharts):
  - **Pie Chart**: Problems solved by difficulty (Easy/Medium/Hard)
  - **Bar Chart**: Language performance (submissions vs accepted)
  - **Line Chart**: Activity over last 14 days
  
- **Statistics Cards**:
  - Total problems solved
  - Accepted submissions
  - Total submissions
  - Success rate percentage
  
- **Progress Bars**:
  - Difficulty-wise completion tracking
  - Visual representation of progress
  
- **Recent Submissions Table**:
  - Problem title
  - Language used
  - Status (accepted/wrong/error)
  - Runtime and memory usage
  - Submission date

### 5. **Responsive Design**
- Fully responsive across all devices
- Mobile-optimized layouts
- Adaptive grid systems
- Touch-friendly interactions

### 6. **Smooth Animations**
- Framer Motion animations throughout
- Stagger animations for list items
- Hover and tap effects
- Smooth transitions between sections

## 🏗️ Architecture

### Backend Structure

```
backend/src/
├── models/
│   └── user.js                    # Updated with profile fields
├── controllers/
│   └── userProfile.js             # Profile & progress controllers
└── routes/
    └── userProfile.js             # Dashboard API routes
```

### Frontend Structure

```
frontend/src/
├── components/
│   └── Dashboard/
│       ├── Dashboard.jsx          # Main dashboard container
│       ├── ProfileSection.jsx     # Profile overview
│       ├── ProgressTracker.jsx    # Progress charts & stats
│       ├── ProfileSettings.jsx    # Profile editing
│       └── ProfilePopup.jsx       # Quick access popup
├── dashboardSlice.js              # Redux state management
└── pages/
    └── Homepage.jsx               # Integrated dashboard
```

## 🔌 API Endpoints

### Profile Management
- `GET /dashboard/profile` - Get user profile with stats
- `PUT /dashboard/profile` - Update user profile
- `GET /dashboard/profile/picture/signature` - Get Cloudinary upload signature
- `POST /dashboard/profile/picture` - Save profile picture metadata
- `DELETE /dashboard/profile/picture` - Delete profile picture

### Progress Tracking
- `GET /dashboard/progress` - Get comprehensive progress data

## 📦 Dependencies Added

### Backend
- `cloudinary@2.7.0` - Already installed for media management

### Frontend
- `recharts@latest` - Data visualization library for charts

## 🎨 Design Features

### Color Scheme
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Dark gray (#111827, #1F2937)

### Animations
- **Dashboard Slide**: Spring animation (stiffness: 300, damping: 30)
- **Popup**: Scale and fade animation
- **Content**: Stagger children with 0.1s delay
- **Hover Effects**: Scale 1.02
- **Tap Effects**: Scale 0.98

## 🚀 Usage

### Opening the Dashboard
1. **Via Profile Picture**: Click on your profile picture in the navbar
2. **Via Dashboard Button**: Click the "Dashboard" button in the navbar
3. **Via Profile Popup**: Click profile picture, then select desired section

### Uploading Profile Picture
1. Navigate to Settings tab in dashboard
2. Click "Upload New Picture" or hover over current picture
3. Select an image file (max 5MB)
4. Wait for upload progress to complete
5. Picture is automatically saved and optimized

### Viewing Progress
1. Open dashboard and navigate to Progress tab
2. View charts showing:
   - Difficulty distribution
   - Language performance
   - Recent activity
3. Scroll down to see recent submissions table

### Updating Profile
1. Navigate to Settings tab
2. Update any field (name, age, bio, skills, social links)
3. Click "Save Changes"
4. Profile updates immediately

## 🔐 Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **Cloudinary Signatures**: Secure upload with server-generated signatures
- **Image Validation**: File type and size validation
- **Old Image Cleanup**: Automatic deletion of previous profile pictures
- **Input Validation**: Server-side validation for all profile fields

## 📊 Data Tracked

### User Statistics
- Total problems solved
- Total submissions
- Accepted submissions
- Success rate percentage

### Difficulty Breakdown
- Easy problems solved/total
- Medium problems solved/total
- Hard problems solved/total

### Language Statistics
- Submissions per language
- Acceptance rate per language
- Success rate per language

### Activity Data
- Daily submission count (last 30 days)
- Daily acceptance count
- Submission trends

## 🎯 Key Features Highlights

1. **Real-time Updates**: Dashboard data refreshes on open
2. **Cloudinary Integration**: Professional image hosting and optimization
3. **Visual Analytics**: Beautiful charts and graphs using Recharts
4. **Smooth UX**: Framer Motion animations throughout
5. **Responsive Design**: Works perfectly on all screen sizes
6. **Type Safety**: Proper error handling and loading states
7. **Redux Integration**: Centralized state management
8. **Modular Components**: Reusable and maintainable code

## 🔄 State Management

### Redux Slices
- **authSlice**: User authentication state
- **dashboardSlice**: Dashboard-specific state
  - profile
  - stats
  - progress
  - loading
  - error
  - uploadingPicture

## 🎨 UI Components Used

- **Lucide React Icons**: Modern icon library
- **Framer Motion**: Animation library
- **Recharts**: Chart library
- **TailwindCSS**: Utility-first CSS
- **DaisyUI**: Component library

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (Single column, compact view)
- **Tablet**: 768px - 1024px (Adjusted layouts)
- **Desktop**: > 1024px (Full dashboard experience)

## 🐛 Error Handling

- Network error handling with user-friendly messages
- Upload progress tracking with error recovery
- Form validation with inline error messages
- Graceful fallbacks for missing data

## 🔮 Future Enhancements

1. **Achievement System**: Badges and milestones
2. **Leaderboard**: Compare with other users
3. **Export Data**: Download progress reports
4. **Dark/Light Theme**: Theme customization
5. **Advanced Analytics**: More detailed insights
6. **Social Features**: Share achievements
7. **Notifications**: Progress updates and reminders
8. **Calendar View**: Submission heatmap

## 📝 Notes

- Profile pictures are stored in Cloudinary under `codemaster-profiles/` folder
- Images are automatically optimized to 400x400px with face detection
- Old profile pictures are automatically deleted when uploading new ones
- All animations are optimized for performance
- Charts are responsive and adapt to container size

## 🎓 Learning Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Recharts Documentation](https://recharts.org/)
- [Cloudinary Upload Guide](https://cloudinary.com/documentation/upload_images)
- [Redux Toolkit Guide](https://redux-toolkit.js.org/)

---

**Built with ❤️ for CodeMaster Platform**
