import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// Create a new team room
export const createTeamRoom = createAsyncThunk(
  'teamCoding/createRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/team/create', roomData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get all active rooms
export const getActiveRooms = createAsyncThunk(
  'teamCoding/getActiveRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/team/rooms');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get user's rooms
export const getUserRooms = createAsyncThunk(
  'teamCoding/getUserRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/team/my-rooms');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get room by ID
export const getRoomById = createAsyncThunk(
  'teamCoding/getRoomById',
  async (roomId, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux: Fetching room by ID:', roomId);
      const response = await axiosClient.get(`/team/room/${roomId}`);
      console.log('✅ Redux: Room fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Redux: Failed to fetch room:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Join a room
export const joinRoom = createAsyncThunk(
  'teamCoding/joinRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/team/room/${roomId}/join`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Leave a room
export const leaveRoom = createAsyncThunk(
  'teamCoding/leaveRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/team/room/${roomId}/leave`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a room
export const deleteRoom = createAsyncThunk(
  'teamCoding/deleteRoom',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(`/team/room/${roomId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const teamCodingSlice = createSlice({
  name: 'teamCoding',
  initialState: {
    rooms: [],
    userRooms: [],
    currentRoom: null,
    participants: [],
    chatMessages: [],
    code: '',
    language: 'javascript',
    testResults: null,
    loading: false,
    error: null,
    connected: false
  },
  reducers: {
    setConnected: (state, action) => {
      console.log('📡 Redux: Setting connected state to:', action.payload);
      state.connected = action.payload;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    updateCode: (state, action) => {
      state.code = action.payload;
    },
    updateLanguage: (state, action) => {
      state.language = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    setChatMessages: (state, action) => {
      state.chatMessages = action.payload;
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action) => {
      state.participants.push(action.payload);
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(
        p => p.userId !== action.payload
      );
    },
    setTestResults: (state, action) => {
      state.testResults = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetRoom: (state) => {
      state.currentRoom = null;
      state.participants = [];
      state.chatMessages = [];
      state.code = '';
      state.testResults = null;
      state.connected = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Room
      .addCase(createTeamRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload.room;
      })
      .addCase(createTeamRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create room';
      })

      // Get Active Rooms
      .addCase(getActiveRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.rooms;
      })
      .addCase(getActiveRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch rooms';
      })

      // Get User Rooms
      .addCase(getUserRooms.fulfilled, (state, action) => {
        state.userRooms = action.payload.rooms;
      })

      // Get Room By ID
      .addCase(getRoomById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoomById.fulfilled, (state, action) => {
        console.log('✅ Redux: Setting room data in state:', action.payload.room);
        state.loading = false;
        state.currentRoom = action.payload.room;
        state.code = action.payload.room.code;
        state.language = action.payload.room.language;
      })
      .addCase(getRoomById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch room';
      })

      // Join Room
      .addCase(joinRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload.room;
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to join room';
      });
  }
});

export const {
  setConnected,
  setCurrentRoom,
  updateCode,
  updateLanguage,
  addChatMessage,
  setChatMessages,
  setParticipants,
  addParticipant,
  removeParticipant,
  setTestResults,
  clearError,
  resetRoom
} = teamCodingSlice.actions;

export default teamCodingSlice.reducer;
