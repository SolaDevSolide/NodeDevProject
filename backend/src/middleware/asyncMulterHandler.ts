import {NextFunction, Request, Response} from 'express';
import {MulterRequest} from './MulterRequest';

export function asyncMulterHandler(
    fn: (req: MulterRequest, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Force the cast from Request to MulterRequest
        Promise.resolve(fn(req as MulterRequest, res, next)).catch(next);
    };
}