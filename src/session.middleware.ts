
import { Request, Response, NextFunction } from 'express';

export default (app: any = null) => {
    return function (req: Request, res: Response, next: NextFunction) {
        console.log('Request...', req.headers);
        next();
    }
}
