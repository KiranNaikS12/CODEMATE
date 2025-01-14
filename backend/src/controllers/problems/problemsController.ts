import { Request, Response}  from 'express'
import { injectable, inject } from 'inversify'
import { AuthMessages } from '../../utils/message'
import { HttpStatusCode } from '../../utils/httpStatusCode'
import { formatResponse } from '../../utils/responseFormatter'
import { handleErrorResponse } from '../../utils/HandleErrorResponse'
import { FilterOptions } from '../../types/problemTypes'
import { IProblemService } from '../../services/problemService/IProblemService'

@injectable()
export class ProblemController {
    constructor(
        @inject('ProblemService') private ProblemService: IProblemService
    ){}

    async createNewProblem(req: Request, res:Response) : Promise<void> {
        try{
           const {problemDetails} = req.body;
           console.log("problemDetails", problemDetails)
           await this.ProblemService.createNewProblem(problemDetails);
           res.status(HttpStatusCode.Ok).json(formatResponse( AuthMessages.PROBLEM_CREATED_SUCCESSFULLY))
        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async listProblems(req: Request, res:Response) : Promise<void> {
        try{
            const { searchTerm , sortOption , filterTag, filterLevel, page = '1', limit = '8'} = req.query as Record<string, string>;
            
            const pageNum = Math.max(1, parseInt(page, 10));
            const limitNum = Math.max(1, parseInt(limit, 10));

            const filters = {
                searchTerm: searchTerm?.trim(),

                sortOption: sortOption as FilterOptions['sortOption'],
                filterLevel: filterLevel?.trim(),
                filterTag: filterTag ? filterTag.split(',') : []
            };

            const { problems, total } =  await this.ProblemService.listProblems(filters, pageNum, limitNum);
            res.status(HttpStatusCode.Ok).json({
                message: AuthMessages.PROBLEM_LISTED_SUCCESSFULLY,
                data: problems,
                total,
                page: pageNum,
                limit: limitNum,
              });
        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateProblemStatus(req:Request, res:Response) : Promise<void> {
        try {
            const {id} = req.params;
            const { isBlock } = req.body;
            const data = await this.ProblemService.updatePromblemStatus(id,isBlock);
            res.status(HttpStatusCode.Ok).json(formatResponse(data, AuthMessages.PROBLEM_STATUS_UPDATED_SUCCESSFULLY))
        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getProblemData(req:Request, res:Response) : Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const problemData = await this.ProblemService.getProblemData(id, userId!);
            res.status(HttpStatusCode.Ok).json(formatResponse(problemData, AuthMessages.PROBLEM_LISTED_SUCCESSFULLY))
        }  catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async handleRunCode(req:Request, res:Response) : Promise<void> {
        try {
            const { code, problemId } = req.body; 
            const result = await this.ProblemService.runCode(code, problemId);
            res.status(HttpStatusCode.Ok).json({success: result})
        }  catch (error) {
            console.log(error)
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async handleCodeSubmission(req: Request, res:Response) : Promise<void> {
        try {
            const { code , language, problemId, userId } = req.body;
            const result = await this.ProblemService.handleCodeSubmission(code, language, problemId, userId);
            res.status(HttpStatusCode.Ok).json({success: result})
        }  catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async getTotalProblemCounts(req:Request, res:Response) : Promise<void> {
        try {
            const totalProblems = await this.ProblemService.getTotalProblemCounts();
            res.status(HttpStatusCode.Ok).json(formatResponse(totalProblems, AuthMessages.FETCH_PROBLEM_COUNTS))

        }  catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateBasicDetails(req:Request, res: Response) : Promise<void> {
        try {
            const { id } = req.params;
            const basicDetails = req.body.problemData;
            await this.ProblemService.updateBasicDetails(id, basicDetails)
            res.status(HttpStatusCode.CREATED).json(formatResponse(null, AuthMessages.PROBLEMS_UPDATED_SUCCESSFULLY))
        }  catch (error) {
            console.log('Error', error)
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateAdditionalProblemDetails(req:Request, res:Response) : Promise<void>{
        try {
            const { id } = req.params;
            const additionalDetails = req.body.problemData
            await this.ProblemService.updateAdditionalDetails(id, additionalDetails)
            res.status(HttpStatusCode.CREATED).json(formatResponse(null, AuthMessages.PROBLEMS_UPDATED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}