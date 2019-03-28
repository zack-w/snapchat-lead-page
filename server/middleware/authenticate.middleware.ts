
import * as express from "express";
import { wrap } from './wrap.middleware';
import { NotAuthenticatedError } from "../errors";
import User from "../models/user.relational";
import { InvalidAuthToken } from "../errors/authentication/invalid-auth-token.error";

export const authenticate = (optional: boolean = false) => {
	return wrap(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
		// Only try to authenticate once per request
		if (req.context._alreadyAuthenticated) {
			// Continue in request flow if authentication is optional or request is authenticated
			if (req.context.isAuthenticated || optional) {
				req.context._alreadyAuthenticated = true;

				return next();
			}

			throw new NotAuthenticatedError();
		}

		let headerToken = req.get("authorization");

		// No token provided
		if (!headerToken || (headerToken === "Bearer")) {
			if (optional) {
				req.context._alreadyAuthenticated = true;

				return next();
			}

			throw new NotAuthenticatedError();
		}

		// Check if token begins with "Bearer "
		if (headerToken.substr(0, 7).toLowerCase() !== "bearer ") {
			throw new NotAuthenticatedError();
		}

		headerToken = headerToken.substr(7);

		// Search for a valid user
		let user = await User.findOne({
			where: {
				$or: [
					{apiKey: headerToken},
					{authToken: headerToken}
				]
			}
		});

		if (!user) {
			throw new InvalidAuthToken();
		}

		// Success
		req.context.isAuthenticated = true;
		req.context.user = user;
		next();
	});
}
