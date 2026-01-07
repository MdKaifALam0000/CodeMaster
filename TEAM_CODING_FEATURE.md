# Team Coding Feature - Complete Implementation Guide

## 🎯 Overview

The Team Coding feature enables multiple users to collaborate in real-time on solving coding problems together. Built with Socket.IO for real-time communication and synchronized code editing.

## ✨ Features

### Core Functionality
- **Real-time Code Synchronization** - All participants see code changes instantly
- **Live Chat** - Built-in chat system for team communication
- **Participant Management** - See who's online and their status
- **Problem Selection** - Choose from available problems to solve together
- **Language Support** - JavaScript, Java, and C++ with host-controlled switching
- **Code Execution** - Run and test code collaboratively
- **Room Management** - Create, join, leave, and manage coding rooms

### Advanced Features
- **Host Controls** - Room creator has special privileges (language change, room settings)
- **Cursor Tracking** - See where other users are typing (implemented in socket handler)
- **Auto-save** - Code is automatically saved to database
- **Chat History** - Last 100 messages persisted
- **Code History** - Last 10 code changes tracked
- **Room Expiry** - Rooms auto-delete after 24 hours of inactivity
- **Capacity Limits** - 2-10 participants per room

## 🏗️ Architecture

### Backend Components

#### 1. **Models** (`backend/src/models/teamRoom.js`)
```javascript
- roomId: Unique room identifier
- roomName: Display name
- problemId: Reference to Problem
- host: Room creator
- participants: Array of users with status
- code: Current code state
- language: Selected programming language
- chatHistory: Message history
- codeHistory: Code change history
- testResults: Latest test execution results
```

#### 2. **Controllers** (`backend/src/controllers/teamCoding.js`)
- `createRoom` - Create new team room
- `getActiveRooms` - Fetch all active rooms
- `getRoomById` - Get specific room details
- `joinRoom` - Join an existing room
- `leaveRoom` - Leave a room
- `deleteRoom` - Close room (host only)
- `getUserRooms` - Get user's active rooms

#### 3. **Socket.IO Handler** (`backend/src/socket/teamCodingSocket.js`)
Real-time events:
- `join-room` - User joins room
- `leave-room` - User leaves room
- `code-change` - Code update broadcast
- `cursor-move` - Cursor position sync
- `language-change` - Language switch (host only)
- `send-message` - Chat message
- `code-run-result` - Test results sharing
- `typing` - Typing indicator

#### 4. **Routes** (`backend/src/routes/teamCoding.js`)
```
POST   /team/create              - Create room
GET    /team/rooms               - Get active rooms
GET    /team/my-rooms            - Get user's rooms
GET    /team/room/:roomId        - Get room details
POST   /team/room/:roomId/join   - Join room
POST   /team/room/:roomId/leave  - Leave room
DELETE /team/room/:roomId        - Delete room
```

### Frontend Components

#### 1. **Redux Slice** (`frontend/src/teamCodingSlice.js`)
State management for:
- Rooms list
- Current room data
- Participants
- Chat messages
- Code state
- Connection status

#### 2. **Socket Hook** (`frontend/src/hooks/useTeamSocket.js`)
Custom hook providing:
- Socket connection management
- Event listeners
- Helper methods for emitting events
- Auto-reconnection

#### 3. **Pages**

**TeamCodingLobby** (`frontend/src/pages/TeamCodingLobby.jsx`)
- Browse active rooms
- Create new rooms
- Join existing rooms
- Search and filter rooms
- View room details

**TeamCodingPage** (`frontend/src/pages/TeamCodingPage.jsx`)
- Split-screen layout:
  - Left: Problem description
  - Center: Monaco code editor
  - Right: Participants & Chat
- Real-time code editing
- Language selection
- Code execution
- Chat interface
- Participant list with status

## 🚀 Setup Instructions

### 1. Backend Setup

Already completed! The following are installed and configured:
- ✅ Socket.IO server integrated
- ✅ Routes mounted at `/team`
- ✅ Models created
- ✅ Controllers implemented
- ✅ Socket handlers configured

### 2. Frontend Setup

Already completed! The following are configured:
- ✅ Socket.IO client installed
- ✅ Redux slice created
- ✅ Custom hook implemented
- ✅ Pages created
- ✅ Routes added to App.jsx
- ✅ Navigation link added to Homepage

### 3. Environment Variables

Ensure your `.env` files have:

**Backend** (`.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000
```

## 📖 Usage Guide

### For Users

#### Creating a Room
1. Navigate to "Team Coding" from homepage
2. Click "Create Room"
3. Fill in:
   - Room name
   - Select problem
   - Choose language
   - Set max participants (2-10)
4. Click "Create Room"
5. Share room link with team members

#### Joining a Room
1. Browse available rooms in lobby
2. Click "Join" on desired room
3. Or use direct room link

#### In the Room
- **Code Together**: Type in the editor, changes sync in real-time
- **Chat**: Use the chat panel to communicate
- **Run Code**: Click "Run" to test code (results shared with all)
- **Change Language**: Host can switch languages
- **Leave**: Click "Leave" button when done

### For Hosts

Additional privileges:
- Change programming language
- Close/delete the room
- Room persists even if host leaves (new host assigned)

## 🎨 UI/UX Features

### Matching Current Design
- **DaisyUI Components** - Consistent with existing UI
- **TailwindCSS Styling** - Matches color scheme and spacing
- **Framer Motion Animations** - Smooth transitions
- **Responsive Design** - Works on all screen sizes
- **Dark Theme** - Consistent with platform theme

### Visual Indicators
- 🟢 Green dot - User online
- ⚪ Gray dot - User offline
- 👑 Crown icon - Room host
- 🔒 Lock icon - Room locked
- 🔓 Unlock icon - Room open

## 🔧 Technical Details

### Real-time Synchronization

**Code Sync Strategy**:
- Debounced updates (500ms) to reduce network traffic
- Last-write-wins conflict resolution
- Cursor position tracking for awareness

**Message Delivery**:
- Guaranteed delivery via Socket.IO acknowledgments
- Message ordering preserved
- Automatic reconnection on disconnect

### Performance Optimizations

1. **Code Changes**: Debounced to 500ms
2. **Chat History**: Limited to last 100 messages
3. **Code History**: Limited to last 10 changes
4. **Room Expiry**: Auto-delete after 24 hours
5. **Lazy Loading**: Rooms loaded on demand

### Security

1. **Authentication**: JWT token required for Socket.IO connection
2. **Authorization**: Host-only actions validated server-side
3. **Room Access**: Participant validation before joining
4. **Rate Limiting**: Can be added to prevent abuse

## 🧪 Testing

### Manual Testing Checklist

- [ ] Create a room
- [ ] Join a room from another browser/device
- [ ] Type code and verify sync
- [ ] Send chat messages
- [ ] Change language (as host)
- [ ] Run code and check results
- [ ] Leave room
- [ ] Rejoin room
- [ ] Test with max participants
- [ ] Test disconnection/reconnection

### Test Scenarios

1. **Basic Flow**:
   - User A creates room
   - User B joins
   - Both type code
   - Verify synchronization

2. **Host Transfer**:
   - Host leaves room
   - Verify new host assigned
   - New host can change language

3. **Capacity Test**:
   - Fill room to max capacity
   - Verify new users cannot join

4. **Persistence**:
   - Close browser
   - Reopen and rejoin
   - Verify code persisted

## 🐛 Troubleshooting

### Common Issues

**Socket Not Connecting**:
- Check CORS configuration in `backend/src/index.js`
- Verify JWT token in cookies
- Check Socket.IO server is running

**Code Not Syncing**:
- Check network tab for Socket.IO events
- Verify room ID is correct
- Check browser console for errors

**Chat Not Working**:
- Verify Socket.IO connection
- Check chat event listeners
- Inspect Redux state

### Debug Mode

Enable Socket.IO debugging:
```javascript
// In useTeamSocket.js
const socket = io(SOCKET_URL, {
  auth: { token },
  transports: ['websocket', 'polling'],
  debug: true // Add this
});
```

## 🚀 Future Enhancements

### Phase 1 (Short-term)
- [ ] Voice chat integration
- [ ] Video conferencing
- [ ] Screen sharing
- [ ] Code review annotations
- [ ] Syntax highlighting for multiple cursors

### Phase 2 (Medium-term)
- [ ] Room templates
- [ ] Scheduled sessions
- [ ] Recording & playback
- [ ] AI-powered suggestions
- [ ] Leaderboards for teams

### Phase 3 (Long-term)
- [ ] Tournament mode
- [ ] Team analytics
- [ ] Integration with GitHub
- [ ] Code versioning
- [ ] Mentor/student pairing

## 📊 Monitoring

### Metrics to Track
- Active rooms count
- Average participants per room
- Session duration
- Code execution frequency
- Chat message volume
- User engagement rate

### Logging
Socket events are logged with:
- User ID
- Room ID
- Event type
- Timestamp

## 🤝 Contributing

When adding features:
1. Follow existing code structure
2. Maintain UI consistency
3. Add proper error handling
4. Update this documentation
5. Test thoroughly

## 📝 API Reference

### REST Endpoints

```typescript
// Create Room
POST /team/create
Body: {
  roomName: string;
  problemId: string;
  maxParticipants: number;
  language: 'javascript' | 'java' | 'cpp';
}

// Get Active Rooms
GET /team/rooms
Response: { rooms: Room[] }

// Join Room
POST /team/room/:roomId/join
Response: { room: Room }
```

### Socket Events

```typescript
// Client → Server
socket.emit('join-room', { roomId, userData });
socket.emit('code-change', { roomId, code, cursorPosition });
socket.emit('send-message', { roomId, message, username });

// Server → Client
socket.on('room-state', ({ code, language, participants, chatHistory }));
socket.on('code-update', ({ code, userId, cursorPosition }));
socket.on('new-message', (message));
```

## 🎓 Learning Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review console errors
3. Check Socket.IO connection status
4. Verify backend logs

---

## ✅ Implementation Status

- ✅ Backend Models
- ✅ Backend Controllers
- ✅ Socket.IO Server
- ✅ REST API Routes
- ✅ Frontend Redux Slice
- ✅ Socket Hook
- ✅ Lobby Page
- ✅ Room Page
- ✅ Navigation Integration
- ✅ Real-time Sync
- ✅ Chat System
- ✅ Code Execution
- ✅ UI/UX Polish

**Status**: ✨ **READY FOR TESTING** ✨

Start the backend and frontend servers, navigate to `/team-coding`, and start collaborating!
