import { ApiResponse } from "./types"




export type TestCaseInput = {
    _id: string
    name: string;
    value: string;
}

export type TestCase = {
    _id: string
    inputs: TestCaseInput[] ;
    output: string ;  
}

export type ProblemExample = {
    _id: string;
    heading: string,
    inputs: TestCaseInput[],
    output:string,
    explanation: string
}

export interface Hint {
    _id: string; 
    content: string;
}

export interface SubmissionStats {
    user: string,
    status: 'Accepted' | 'Attempted' | 'NILL';
    language: string;
    code: string;
    totalTestCasePassed: number;
    totalTestCases: number;
    updatedAt: string;
    isFinal: boolean;
    createdAt: string;
}

export type Problem = {
   _id: string,
   slno: number,
   title:string,
   description: string,
   difficulty: string,
   tags: string[],
   status?:string,
   examples: ProblemExample[]
   testCases:TestCase[],
   hints: Hint[],
   submission?: SubmissionStats[] ;  //all submission by user 
   totalSubmission?:number;
   isBlock:boolean,
   createdAt: string,
   averageRatings?: number,
   reviewCount?: number,
   userSubmission?: SubmissionStats[] | null; //submission by user
}

export type ListProblemResponse = ApiResponse<Problem[]>

export type showProblemDataResponse =  ApiResponse<Problem>


export interface FilteredData {
    searchTerm?: string,
    sortOption?: string,
    filterTag?:string[],
    filterLevel?:string,
    page?: number,
    limit?: number 
}

export type Tag = string;

export const filterOptionsByTags = [
    "Array",
    "String",
    "Math",
    "HashTalbe",
    "Sort",
    "LinkedList",
];

export const filterOptionsByLevel = ["Easy", "Medium", "Hard"];

export const sortOptions = [
    "Recent",
    "Oldest",
    "A-Z",
    "Z-A",
    "Ascending",
    "Descending",
];

export const staticTags = [
    "Array",
    "String",
    "HashTable",
    "Math",
    "Sort",
    "LinkedList",
    "BST",
    "BinarySearch",
];

export const filterOptionsByStatus = ["Todo", "Solved", "Attempted"];

export interface TestCaseResult {
    exampleId: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    logs: string[]
}

export interface CodeSubmitResponse {
    success: TestCaseResult[];
}

export interface Meta {
    totalTestCases: number;
    passedTestCases: number;
}

export interface SubmitCaseResult {
    testCaseId: string;
    passed: boolean;
    expectedOutput: string;
    actualOutput: string;
    input: string;
}

export interface SubmissionResponse {
    success: {
        meta: Meta;
        results: SubmitCaseResult[];
    };
}

export interface ProblemStats {
    easy: number;
    medium: number;
    hard: number;
    total: number;
}

export interface BasicFormValues {
    title: string;
    slno: number;
    description: string;
    difficulty: string;
    tags: string[];
}

export interface AdditionalFormValues {
    
    testCases: TestCase[];
    examples: ProblemExample[];
    hints: Hint[];
}

