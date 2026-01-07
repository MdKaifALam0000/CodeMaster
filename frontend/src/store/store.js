import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice';
import dashboardReducer from '../dashboardSlice';
import teamCodingReducer from '../teamCodingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    teamCoding: teamCodingReducer
  }
});

