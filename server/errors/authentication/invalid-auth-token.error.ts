import { AppError } from "../app.error";

export class InvalidAuthToken extends AppError {
	constructor() {
		super("an invalid or expired auth token or API key was provided");

		this.code = "invalidAuthToken";
		this.statusCode = 401;
	}
}
