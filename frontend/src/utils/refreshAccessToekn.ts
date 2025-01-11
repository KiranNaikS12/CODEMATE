import axiosInstance from "./axiosInstance"

const refreshAccessToken = async (roleId: 'user' | 'tutor' | 'admin') => {
    try {
        const response = await axiosInstance.post('/auth/refresh-token', { roleId}, {withCredentials: true});
        
        if(response.status === 200) {
            return true;
        }

        return false;

    } catch (error) {
        console.log('Failed to refresh access token', error);
        return false;
    }
}

export default refreshAccessToken;