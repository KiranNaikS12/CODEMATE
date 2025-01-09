import { combineReducers } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import tutorReducer from './slices/tutorSlice';
import adminReducer from './slices/adminSlice'
import { apiSlice } from "../services/userApiSlice";
import {tutorApiSlice} from '../services/tutorApiSlice';
import { adminApiSlice } from "../services/adminApiSlice";




const rootReducer = combineReducers({
    auth: authReducer,
    tutor: tutorReducer,
    admin: adminReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [tutorApiSlice.reducerPath]: tutorApiSlice.reducer,
    [adminApiSlice.reducerPath] : adminApiSlice.reducer,
    
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;