import {Request, Response} from 'express'
import { injectable, inject } from "inversify";
import { HttpStatusCode } from "../../utils/httpStatusCode";
import { AuthMessages } from "../../utils/message";
import { handleErrorResponse } from "../../utils/HandleErrorResponse";
import { formatResponse } from "../../utils/responseFormatter";
import { IManageutorService } from '../../services/adminService/manageTutors/IMangeTutorService';
import { FilterOptions } from '../../types/courseTypes';


@injectable()
export class ManageTutorController {
    constructor(
        @inject('ManageTutorService') private ManageTutorService:IManageutorService
    ){}

    async listTutors(req:Request, res:Response) : Promise<void> {
        try {
            const filters: FilterOptions = {
                searchTerm: req.query.searchTerm as string || ''
            }
            const tutors = await this.ManageTutorService.listTutors(filters);
            res.status(HttpStatusCode.Ok).json(formatResponse(tutors,AuthMessages.TUTORS_LISTED_SUCCESSFULLY))
        } catch (error){
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateTutorStatus(req:Request, res:Response) : Promise<void> {
        try{
           const {id} = req.params;
           const {isBlocked} = req.body;
           const data = await this.ManageTutorService.updateTutors(id, isBlocked);
           res.status(HttpStatusCode.CREATED).json(formatResponse(data, AuthMessages.UPDATED_SUCCESSFULL))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async displayTutorDetails(req:Request,res:Response) : Promise<void> {
        try {
            const {tutorId} = req.params;
            const tutorData = await this.ManageTutorService.displayTutorDetails(tutorId);
            res.status(HttpStatusCode.Ok).json(formatResponse(tutorData, AuthMessages.TUTORS_LISTED_SUCCESSFULLY))
        } catch (error) {
            handleErrorResponse(res, error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    async updateTutorApproval(req:Request, res:Response) : Promise<void> {
        try {
            const {tutorId } = req.params;
            const {isApproved, isVerified, reason} = req.body;
            await this.ManageTutorService.updateTutorApproval( tutorId, isApproved, isVerified, reason);
            res.status(HttpStatusCode.Ok).json(formatResponse(null, AuthMessages.UPDATED_SUCCESSFULL))
        } catch (error) {
            handleErrorResponse(res,error, HttpStatusCode.INTERNAL_SERVER_ERROR)
        }
    }
}