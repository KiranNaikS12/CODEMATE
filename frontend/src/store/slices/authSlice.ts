import { createSlice,  } from "@reduxjs/toolkit";
import { Role } from "../../types/types";
import { decryptData, encryptData } from "../../utils/encryptionUtils";


export interface UserData {
    _id:string,
    username:string,
    fullname?:string,
    email:string,
    roleId: Role,
    isBlocked:boolean,
    createdAt:Date | null;
    profileImage?:string;
}

interface UserState {
    userInfo: UserData | null;
}

const initialState: UserState = {
    userInfo: localStorage.getItem('userInfo')
    ? decryptData(localStorage.getItem('userInfo') as string)
    : null
}
    
const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        setCredentials: (state,action) => {
            state.userInfo = action.payload.data;
            const encryptedData = encryptData(action.payload.data)
            localStorage.setItem('userInfo', encryptedData)
        },
        clearCredentials: (state) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo')
        },
        updateCredentials: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                ...action.payload.data
            };
            const encryptedData = encryptData(state.userInfo);
            localStorage.setItem('userInfo', encryptedData)
        }
        
    }
})

export const { setCredentials, clearCredentials, updateCredentials} = authSlice.actions;
export default authSlice.reducer;