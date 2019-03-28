import { AppError } from "../app.error";

export class CampaignDoesNotExistError extends AppError {
	constructor() {
		super("campaign does not exist");

		this.code = "campaignDoesNotExist";
		this.statusCode = 404;
	}
}
