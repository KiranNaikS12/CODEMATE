import { CodeRunTypes, CodeSubmissionResultType, FilterOptions, ProblemTypes } from "../../types/problemTypes";

export interface IProblemService {
    createNewProblem(problemDetails: Partial<ProblemTypes>): Promise<ProblemTypes | null>;
    listProblems(filters: FilterOptions, page: number, limit: number): Promise<{ problems: ProblemTypes[], total: number }>;
    updatePromblemStatus(id: string, isBlock: boolean): Promise<ProblemTypes | null>;
    getProblemData(problemId: string, userId: string): Promise<ProblemTypes | null>;
    runCode(sourceCode: string, problemId: string) : Promise<CodeRunTypes[]>;
    handleCodeSubmission(sourceCode: string, language: string, problemId: string, userId: string) : Promise<{
        meta: {
            totalTestCases: number,
            passedTestCases: number
        },
        results:CodeSubmissionResultType[]
    }>
    updateUserProgress(userId: string, problemId: string, difficulty: 'easy' | 'medium' | 'hard') : Promise<void>;
    getTotalProblemCounts() : Promise<{ easy: number; medium: number; hard: number; total: number }>;
    updateBasicDetails(problemId: string, basicDetails: Partial<ProblemTypes>) :  Promise<Partial<ProblemTypes>>;
    updateAdditionalDetails(problemId: string, additionDetails: Partial<ProblemTypes>) : Promise<Partial<ProblemTypes>>
}