import { AppError } from "../app.error";

export class CampaignInvalidSubmissionError extends AppError {
	constructor() {
		super("invalid campaign submission");

		this.code = "campaignInvalidSubmission";
		this.statusCode = 400;
	}
}
