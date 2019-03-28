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
	HasMany
} from "sequelize-typescript";
import User from "./user.relational";
import Campaign from "./campaign.relational";
import Submission from "./submission.relational";

@Table({
	timestamps: false,
	paranoid: false,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "submissionValues"
})
export default class SubmissionValue extends Model<SubmissionValue> {
	@IsInt
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id: number;

	@IsInt
	@AllowNull(false)
	@PrimaryKey
	@ForeignKey(() => Submission)
	@Column
	submissionId: number;

	@BelongsTo(() => Submission)
	submission?: Submission;

	@AllowNull(false)
	@Column
	key: string;

	@AllowNull(false)
	@Column
	value: string;

	_toJSON(): any {
		return {
			id: this.id,
			submissionId: this.submissionId,
			key: this.key,
			value: this.value
		};
	}
}
