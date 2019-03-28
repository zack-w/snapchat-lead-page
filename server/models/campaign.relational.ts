import {
	Table,
	Model,
	Column,
	IsInt,
	PrimaryKey,
	Unique,
	AutoIncrement,
	AllowNull,
	ForeignKey,
	BelongsTo,
	HasMany,
	Default
} from "sequelize-typescript";
import * as moment from "moment";
import User from "./user.relational";
import { ISubmission } from "../src/server";
import CampaignField from "./campaign-field.relational";
import { CampaignInvalidSubmissionError } from "../errors";
import Submission from "./submission.relational";
import SubmissionValue from "./submission-value.relational";

@Table({
	timestamps: false,
	paranoid: false,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "campaigns"
})
export default class Campaign extends Model<Campaign> {
	@IsInt
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id: number;

	@IsInt
	@AllowNull(false)
	@PrimaryKey
	@ForeignKey(() => User)
	@Column
	ownerUserId: number;

	@BelongsTo(() => User)
	ownerUser?: User;

	@AllowNull(false)
	@Column
	name: string;

	@AllowNull(false)
	@Default(() => moment.utc().toDate())
	@Column
	createdAt: Date;

	async getSubmissionsFlat() {
		// Get all submissions and associated fields
		let submissions = await Submission.findAll({
			where: {
				campaignId: this.id
			},
			include: [SubmissionValue]
		});
		
		return submissions.map((submission: Submission) => {
			let res: any = {
				id: submission.id,
				createdAt: submission.createdAt
			};
		
			submission.submissionValues.forEach((value: SubmissionValue) => {
				res[value.key] = value.value;
			});
		
			return res;
		})
	}

	async validateSubmission(submission: ISubmission) {
		// Check the params
		// TODO

		// Check the values
		let campaignFields: CampaignField[] = await CampaignField.findAll({
			where: {
				campaignId: this.id
			}
		});

		// Did they provide extra fields?
		if (
			!submission.values ||
			Object.keys(submission.values).length > campaignFields.length
		) {
			throw new CampaignInvalidSubmissionError();
		}

		// Ensure all fields are present
		campaignFields.forEach((field: CampaignField) => {
			// Get the value provided
			let submissionValue: any = submission.values[field.key];

			// If the value doesn't exist..
			if (!submissionValue) {
				throw new CampaignInvalidSubmissionError();
			}

			// Check the value matches the type
			if (field.type == "string" && typeof submissionValue !== "string") {
				throw new CampaignInvalidSubmissionError();
			} else if(field.type == "number" && typeof submissionValue !== "number") {
				throw new CampaignInvalidSubmissionError();
			}
		});
	}

	_toJSON(): any {
		return {
			id: this.id,
			ownerUserId: this.ownerUserId,
			name: this.name,
			createdAt: this.createdAt
		};
	}
}
