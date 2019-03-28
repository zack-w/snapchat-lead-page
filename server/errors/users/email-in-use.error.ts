import { AppError } from "../app.error";

export class EmailInUseError extends AppError {
	constructor() {
		super("email in use");

		this.code = "emailInUse";
		this.statusCode = 400;
	}
}
