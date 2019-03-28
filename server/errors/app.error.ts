import { BaseError } from "make-error";

export class AppError extends BaseError {
	public code: string;
	public statusCode: number;

	constructor(message: string) {
		super(message || "application error");

		this.code = "applicationError";
		this.statusCode = 500;
	}
}
