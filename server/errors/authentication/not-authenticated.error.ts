import { AppError } from "../app.error";

export class NotAuthenticatedError extends AppError {
	constructor() {
		super("you must authenticate before making that request");

		this.code = "notAuthenticated";
		this.statusCode = 401;
	}
}
