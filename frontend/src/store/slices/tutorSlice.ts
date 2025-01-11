    import { createSlice } from "@reduxjs/toolkit";
import {Role} from '../../types/types';
import { decryptData, encryptData } from "../../utils/encryptionUtils";

export interface TutorData {
    _id:string,
    username:string,
    email:string,
    roleId: Role,
    isBlocked:boolean,
    isApproved?:boolean,
    profileImage?:string,
    createdAt: Date | null;
}

interface TutorState {
    tutorInfo: TutorData | null;
}

const initialState: TutorState = {
    tutorInfo: localStorage.getItem('tutorInfo')
    ? decryptData(localStorage.getItem('tutorInfo') as string)
    : null
}

const tutorSlice = createSlice({
    name:'tutor',
    initialState,
    reducers:{
        setCredentials: (state,action) => {
            state.tutorInfo = action.payload.data;
            const encryptedData = encryptData(action.payload.data)
            localStorage.setItem('tutorInfo', encryptedData)
        },
        clearCredentials: (state) => {
            state.tutorInfo = null;
            localStorage.removeItem('tutorInfo')
        }
    }
})

export const { setCredentials, clearCredentials} = tutorSlice.actions;
export default tutorSlice.reducer;