import * as express from "express";

// Middleware function that allows the use of async/await without having to wrap all request
// handlers with a try-catch block
export const wrap = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => void) => {
	return (req: express.Request, res: express.Response, next: express.NextFunction) => {
		Promise.resolve(fn(req, res, next))
		.catch(next);
	};
};
