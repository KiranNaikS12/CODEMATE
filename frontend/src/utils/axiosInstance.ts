import axios from "axios";
import refreshAccessToken from "./refreshAccessToekn";
import store from '../store/store';
import { clearCredentials as userClearCredentials } from "../store/slices/authSlice";
import { clearCredentials as tutorClearCredentials } from "../store/slices/tutorSlice";
import { clearCredentials as adminClearCredentials } from "../store/slices/adminSlice";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

//request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//Helper function to handle logout
let isLogounInProgress = false;
const handleLogout = (role: unknown) => {
   if(isLogounInProgress) return;
   isLogounInProgress = true;

   switch (role) {
     case 'user':
        store.dispatch(userClearCredentials());
        window.location.href = '/login';
        break;
     case 'tutor':
        store.dispatch(tutorClearCredentials());
        window.location.href = '/tutor/login';
        break;
     case 'admin':
        store.dispatch(adminClearCredentials());
        window.location.href = '/admin/login';
        break;
   }
}

//Helper function to determine active role
const getActiveRole = () => {
    const state = store.getState()
    if(state.auth.userInfo) return "user";
    if(state.tutor.tutorInfo) return "tutor";
    if(state.admin.adminInfo) return "admin";
    return null;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
    failedQueue.forEach(prom => {
        if(error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
}



// response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axiosInstance(originalRequest))
                    .catch((err) => Promise.reject(err));
            }
            
            //setting flag to avoid retry loops
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const activeRole = getActiveRole();
                if (!activeRole) {
                    throw new Error('No active role found');
                }

                const refreshed = await refreshAccessToken(activeRole);
                isRefreshing = false;

                if (refreshed) {
                    processQueue();
                    return axiosInstance(originalRequest);
                } else {
                    processQueue(new Error('Refresh failed'));
                    // Handle failed refresh by redirecting to appropriate login page
                    handleLogout(activeRole);
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                handleLogout(getActiveRole());
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);




export default axiosInstance;