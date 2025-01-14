import { FilterOptions, ProblemTypes } from "../../types/problemTypes";
import { IBaseRepository } from "../base/IBaseRepository";

export interface IProblemRepository extends IBaseRepository<ProblemTypes> {
   listProblems(filter?: FilterOptions, page?: number, limit?: number): Promise<{ problems: ProblemTypes[], total: number }>;
   updateProblemStatus(id:string, data:Partial<ProblemTypes>) : Promise<ProblemTypes | null>;
   countDocuments(difficulty: 'easy' | 'medium' | 'hard') : Promise<number>
   totalProblems() : Promise<{ easy: number; medium: number; hard: number; total: number }>;
}