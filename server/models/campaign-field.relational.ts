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

@Table({
	timestamps: false,
	paranoid: false,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "campaignFields"
})
export default class CampaignField extends Model<CampaignField> {
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

	@AllowNull(false)
	@Column
	key: string;

	@AllowNull(false)
	@Column
	type: string;

	_toJSON(): any {
		return {
			id: this.id,
			campaignId: this.campaignId,
			key: this.key,
			type: this.type
		};
	}
}
