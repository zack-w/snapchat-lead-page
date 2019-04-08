import { AppError } from "../app.error";

export class CampaignFieldDoesNotExistError extends AppError {
	constructor() {
		super("campaign field does not exist");

		this.code = "campaignFieldDoesNotExist";
		this.statusCode = 404;
	}
}
