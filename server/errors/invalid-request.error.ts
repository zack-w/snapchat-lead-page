import { AppError } from "./app.error";

export class InvalidRequestError extends AppError {
	constructor() {
		super("an invalid request was provided, see API documentation");

		this.code = "invalidRequest";
		this.statusCode = 400;
	}
}
