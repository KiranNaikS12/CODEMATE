import { configureStore } from "@reduxjs/toolkit";
import rootReducer from './rootReducer';
import { apiSlice } from "../services/userApiSlice";
import { tutorApiSlice } from '../services/tutorApiSlice';
import { adminApiSlice } from "../services/adminApiSlice";  



const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(apiSlice.middleware, tutorApiSlice.middleware, adminApiSlice.middleware, ),
    devTools: true
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch

export default store; 