import { TutorAdditonal } from "./tutorTypes";
import { UserAdditional } from "./userTypes";


export type APIError = {
    data?: {
        message?: string;
    };
    message?: string;
    status?: number;
};

export enum Role {
    User = 'user',
    Tutor = 'tutor',
    Admin = 'admin'
}

export type RegisterFormData = {
    username:string,
    roleId:Role.Tutor,
    email:string,
    password:string,
    confirmPassword:string
}

export type LoginFormData = {
    email:string,
    password:string
}

export type ResetPasswordFormData = {
    password: string,
    confirmPassword: string;
}

//ResponseType
export interface ApiResponse<T>  {
    success:boolean,
    message:string,
    data: T;
    total?: number,
    errorCode?: string | null;
}


export interface ProfileImageProps {
    handleProfile: () => void;
    userId: string;
    roleId: string;
    refetch: () => void;
    userData?: UserAdditional | TutorAdditonal
}

// problem related types
export type TestCaseInput = {
    name: string;
    value: string;
}


export type TestCase = {
  inputs: TestCaseInput[],
  output:string
}

export type Hint = {
    content: string
}

export type Example = {
    heading: string;
    inputs: TestCaseInput[]
    output: string;
    explanation: string;
};

export type ProblemFormFields = {
    id?: string,
    slno: number;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    testCases: TestCase[];
    hints: Hint[];
    examples: Example[];
};

export type TableRow = (string | number | JSX.Element)[];

export type CustomTableRow = {
    id: string,
    columns: (string | number | JSX.Element)[];
}


export interface ErrorData {
    status: number;
    data: {
      message: string;
      success: boolean;
      errorCode: string | null;
    };
  }
