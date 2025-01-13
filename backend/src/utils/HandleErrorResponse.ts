//used for formatting error response

import { Response } from 'express';
import { HttpStatusCode } from './httpStatusCode';
import { formatResponse } from './responseFormatter';

export const handleErrorResponse = (res: Response, error: unknown, statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR) =>{
    const err = error as Error;
    res.status(statusCode).json(formatResponse(null, err.message, false))
}