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
import Campaign from "./campaign.relational";

@Table({
	timestamps: false,
	paranoid: false,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "backgroundStyles"
})
export default class BackgroundStyle extends Model<BackgroundStyle> {
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

	@Column
	color: string;

	@Column
	image: string;

	@Column
	attachment: string;

	@Column
	repeat: string;

	@Column
	size: string;

	@AllowNull(false)
	@Default(true)
	@Column
	isPreview: boolean;

	_toJSON(): any {
		return {
			id: this.id,
			color: this.color,
			image: this.image,
			attachment: this.attachment,
			size: this.size,
			isPreview: this.isPreview
		};
	}
}
