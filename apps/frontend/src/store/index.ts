import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import taskListReducer from './taskListSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    taskList: taskListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
