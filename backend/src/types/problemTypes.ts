import mongoose, {Document} from "mongoose";



export interface Input {
    name:string,
    value:string
}

export interface Example {
    _id: mongoose.Types.ObjectId,
    heading: string,
    inputs: Input[],
    output:string,
    explanation: string
}


export interface TestCase {
    _id: mongoose.Types.ObjectId,
    inputs: Input[];
    output: string ;
}

export interface Hint {
    content: string;
}

export interface SubmissionStats {
    user: mongoose.Types.ObjectId,
    status: 'Accepted' |  'Attempted' | 'NILL';
    language: string;
    code: string;
    totalTestCasePassed: number;
    totalTestCases: number;
    isFinal: boolean;
    
}

export interface ProblemTypes extends Document{
    _id:mongoose.Types.ObjectId,
    slno:number,
    title:string,
    description: string,
    difficulty: 'easy' | 'medium' | 'hard',
    tags: string[],
    testCases: TestCase[],
    submission?: SubmissionStats[];
    totalSubmission?:number;
    hints?: Hint[],
    examples:Example[],
    isBlock: boolean,
    averageRatings: number,
    reviewCount: number,
}

export interface FilterOptions {
  searchTerm?: string;
  sortOption?: 'Recent' | 'Oldest' | 'A-Z' | 'Z-A';
  filterLevel?: string;
  filterTag?: string[];
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export type SolvedDifficulty = 'solvedEasy' | 'solvedMedium' | 'solvedHard';

export interface CodeRunTypes {
    exampleId: string;
    passed: boolean;
    actualOutput: any;
    expectedOutput?: any;
    logs: string[]
}

export interface CodeSubmissionResultType {
    testCaseId: string;
    passed: boolean;
    actualOutput?: any;
    expectedOutput?: any;
    input?: any 
}
