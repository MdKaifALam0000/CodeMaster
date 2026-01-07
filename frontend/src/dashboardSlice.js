import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

// Get user profile
export const getUserProfile = createAsyncThunk(
  'dashboard/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/dashboard/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'dashboard/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put('/dashboard/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get upload signature for profile picture
export const getProfilePictureSignature = createAsyncThunk(
  'dashboard/getProfilePictureSignature',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/dashboard/profile/picture/signature');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Save profile picture metadata
export const saveProfilePicture = createAsyncThunk(
  'dashboard/saveProfilePicture',
  async (pictureData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/dashboard/profile/picture', pictureData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete profile picture
export const deleteProfilePicture = createAsyncThunk(
  'dashboard/deleteProfilePicture',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete('/dashboard/profile/picture');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get user progress
export const getUserProgress = createAsyncThunk(
  'dashboard/getUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/dashboard/progress');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    profile: null,
    stats: null,
    progress: null,
    loading: false,
    error: null,
    uploadingPicture: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.stats = action.payload.stats;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch profile';
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to update profile';
      })

      // Save Profile Picture
      .addCase(saveProfilePicture.pending, (state) => {
        state.uploadingPicture = true;
        state.error = null;
      })
      .addCase(saveProfilePicture.fulfilled, (state, action) => {
        state.uploadingPicture = false;
        state.profile = action.payload.user;
      })
      .addCase(saveProfilePicture.rejected, (state, action) => {
        state.uploadingPicture = false;
        state.error = action.payload?.error || 'Failed to save profile picture';
      })

      // Delete Profile Picture
      .addCase(deleteProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
      })
      .addCase(deleteProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete profile picture';
      })

      // Get User Progress
      .addCase(getUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.progress = action.payload;
      })
      .addCase(getUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch progress';
      });
  }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
