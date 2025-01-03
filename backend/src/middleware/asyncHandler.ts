import {NextFunction, Request, Response} from 'express';

export function asyncHandler<
    P = Record<string, string>, // Default params as string key-value pairs
    ResBody = any, // Default response body as any (for JSON responses, a custom type can be used)
    ReqBody = any, // Default request body as any (for flexibility, can be narrowed)
    ReqQuery = Record<string, string | undefined> // Default query parameters as string or undefined
>(
    fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<unknown>
) {
    return (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
