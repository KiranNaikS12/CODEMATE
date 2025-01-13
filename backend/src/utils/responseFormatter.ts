export const formatResponse = (data:any = null, message: string = '', success: boolean = true, errorCode: number | null = null) => {
    return {
        success,
        message,
        data,
        errorCode
    }
}