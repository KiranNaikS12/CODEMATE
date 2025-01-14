import {  Problem } from "./problemTypes";
import { showTutorDetailResponse, TutorAdditonal } from "./tutorTypes";
import { showUserDetailsResponse, UserAdditional } from "./userTypes";

export interface TableProps {
    headers: string[];
    data: (string| number | JSX.Element) [][]
    type?: 'user' | 'tutor' | 'problem';
    selectedId: string | null;
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
    userDetails?: showUserDetailsResponse;
    tutorDetails?: showTutorDetailResponse;
    problemDetails?: Problem[]
    isLoading?:boolean;
    isDetailError?:boolean;
    refetch: () => void ;
}

export interface DetailsPageProps {
    isOpen: boolean;
    onClose: () => void;
    data: TutorAdditonal | undefined;
    isLoading?: boolean;
    isError?: boolean;
}

export interface UserDetailsPageProps {
  isOpen: boolean;
  onClose: () =>  void;
  data: UserAdditional | undefined
  isLoading?: boolean;
  isError?: boolean;
}