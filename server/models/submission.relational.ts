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
import * as moment from 'moment';
import User from "./user.relational";
import Campaign from "./campaign.relational";
import SubmissionValue from "./submission-value.relational";

@Table({
	timestamps: false,
	paranoid: false,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "submissions"
})
export default class Submission extends Model<Submission> {
	@IsInt
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id: number;

	@IsInt
	@AllowNull(false)
	@PrimaryKey
	@ForeignKey(() => Campaign)
	@Column
	campaignId: number;

	@BelongsTo(() => Campaign)
	campaign?: Campaign;

	@HasMany(() => SubmissionValue)
	submissionValues: SubmissionValue[];

	@AllowNull(false)
	@Default(false)
	@Column
	zapierSent: boolean;

	@AllowNull(false)
	@Default(() => moment.utc().toDate())
	@Column
	createdAt: Date;

	_toJSON(): any {
		return {
			id: this.id,
			campaignId: this.campaignId,
			createdAt: this.createdAt
		};
	}
}
