/**
 * Redux Store Configuration
 * 
 * Configures Redux store with saga middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import tokenReducer from './slices/tokenSlice';
import tokenDetailReducer from './slices/tokenDetailSlice';
import rootSaga from './sagas/rootSaga';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
    reducer: {
        tokens: tokenReducer,
        tokenDetail: tokenDetailReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: false, // Disable thunk, we use sagas
            serializableCheck: false, // Allow non-serializable data (dates, etc.)
        }).concat(sagaMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
});

// Run root saga
sagaMiddleware.run(rootSaga);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
