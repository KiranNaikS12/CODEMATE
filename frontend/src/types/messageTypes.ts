import { ApiResponse } from "./types";

export const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY

export interface DownloadedImages {
    [messageId: string]: {
      [imageIndex: string]: boolean;
    };
}

export interface Message {
    senderId: string;
    receiverId: string;
    text: string;
    images?:string[];
    read?:boolean;
    timestamp: string;
    clientId: string;

}

export type ListMessageResponse = ApiResponse<Message[]> 