import { createSlice } from "@reduxjs/toolkit";
import { Role } from "../../types/types";
import { decryptData, encryptData } from "../../utils/encryptionUtils";


export interface AdminData {
    email: string,
    roleId: Role
}

interface AdminState {
    adminInfo: AdminData | null;
}

const initialState: AdminState = {
    adminInfo: localStorage.getItem('adminInfo')
    ? decryptData(localStorage.getItem('adminInfo') as string)
    : null
}

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.adminInfo = action.payload.data;
            const encryptedData = encryptData(action.payload.data)
            localStorage.setItem('adminInfo', encryptedData)
        },
        clearCredentials: (state) => {
            state.adminInfo = null;
            localStorage.removeItem('adminInfo')
        }
    }
})

export const { setCredentials, clearCredentials} = adminSlice.actions;
export default adminSlice.reducer;



