import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
  setConnected,
  updateCode,
  updateLanguage,
  addChatMessage,
  setChatMessages,
  setParticipants,
  addParticipant,
  removeParticipant,
  setTestResults
} from '../teamCodingSlice';
import Cookies from 'js-cookie';

const SOCKET_URL = import.meta.env.PROD
  ? 'https://codemaster-1.onrender.com'
  : 'http://localhost:3000';

export const useTeamSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { currentRoom } = useSelector((state) => state.teamCoding);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only initialize if user is authenticated
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, skipping Socket.IO connection');
      dispatch(setConnected(false));
      return;
    }

    // Initialize socket connection
    // Try localStorage first (as it's where we store the token for socket), then cookie as fallback
    const token = localStorage.getItem('token') || Cookies.get('token');

    if (!token) {
      console.log('❌ No authentication token found in localStorage or cookies');
      dispatch(setConnected(false));
      return;
    }

    console.log('🔐 Attempting Socket.IO connection with token:', {
      tokenExists: !!token,
      tokenLength: token?.length,
      url: SOCKET_URL,
      userId: user?._id
    });

    // Only create new socket if one doesn't exist
    if (socketRef.current && socketRef.current.connected) {
      console.log('🔌 Socket already connected, skipping new connection');
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      forceNew: false,
      multiplex: true
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server', {
        socketId: socket.id,
        url: SOCKET_URL,
        connected: socket.connected,
        userId: user?._id
      });
      dispatch(setConnected(true));
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from Socket.IO server. Reason:', reason);
      dispatch(setConnected(false));

      // Attempt to reconnect if disconnected unexpectedly
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', {
        message: error.message,
        type: error.type,
        code: error.code,
        description: error.description,
        url: SOCKET_URL,
        data: error.data
      });
      dispatch(setConnected(false));
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error event:', error);
    });

    // Room events
    socket.on('room-state', ({ code, language, participants, chatHistory }) => {
      dispatch(updateCode(code));
      dispatch(updateLanguage(language));
      dispatch(setParticipants(participants));
      dispatch(setChatMessages(chatHistory || []));
    });

    socket.on('user-joined', ({ userId, userData }) => {
      dispatch(addParticipant({ userId, ...userData }));
      dispatch(addChatMessage({
        type: 'system',
        message: `${userData.firstName} joined the room`,
        timestamp: new Date()
      }));
    });

    socket.on('user-left', ({ userId }) => {
      dispatch(removeParticipant(userId));
      dispatch(addChatMessage({
        type: 'system',
        message: 'A user left the room',
        timestamp: new Date()
      }));
    });

    // Code events
    socket.on('code-update', ({ code, userId, cursorPosition }) => {
      dispatch(updateCode(code));
    });

    socket.on('language-updated', ({ language }) => {
      dispatch(updateLanguage(language));
    });

    // Chat events
    socket.on('new-message', (message) => {
      console.log('📥 Received new message:', message);
      dispatch(addChatMessage(message));
    });

    // Test results
    socket.on('test-results', ({ results }) => {
      dispatch(setTestResults(results));
    });

    // Cleanup - only disconnect when component unmounts or user logs out
    return () => {
      console.log('🧹 Cleaning up Socket.IO connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, dispatch]);

  // Socket methods
  const joinRoom = (roomId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('join-room', {
        roomId,
        userData: {
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        }
      });
    }
  };

  const leaveRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId });
    }
  };

  const sendCodeChange = (roomId, code, cursorPosition) => {
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        roomId,
        code,
        cursorPosition
      });
    }
  };

  const sendCursorMove = (roomId, position, selection) => {
    if (socketRef.current) {
      socketRef.current.emit('cursor-move', {
        roomId,
        position,
        selection
      });
    }
  };

  const changeLanguage = (roomId, language) => {
    if (socketRef.current) {
      socketRef.current.emit('language-change', {
        roomId,
        language
      });
    }
  };

  const sendMessage = (roomId, message) => {
    if (socketRef.current && user) {
      console.log('📤 Emitting send-message:', {
        roomId,
        message,
        username: `${user.firstName} ${user.lastName}`,
        socketConnected: socketRef.current.connected
      });
      socketRef.current.emit('send-message', {
        roomId,
        message,
        username: `${user.firstName} ${user.lastName}`
      });
    } else {
      console.log('❌ Cannot send message - missing socket or user:', {
        hasSocket: !!socketRef.current,
        socketConnected: socketRef.current?.connected,
        hasUser: !!user
      });
    }
  };

  const sendTestResults = (roomId, results) => {
    if (socketRef.current) {
      socketRef.current.emit('code-run-result', {
        roomId,
        results
      });
    }
  };

  const sendTyping = (roomId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        roomId,
        isTyping
      });
    }
  };

  return {
    socket: socketRef.current,
    connected: useSelector((state) => state.teamCoding.connected),
    joinRoom,
    leaveRoom,
    sendCodeChange,
    sendCursorMove,
    changeLanguage,
    sendMessage,
    sendTestResults,
    sendTyping
  };
};
