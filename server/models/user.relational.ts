import {
	Table,
	Model,
	Column,
	IsInt,
	PrimaryKey,
	Unique,
	AutoIncrement,
	AllowNull,
	HasMany,
	Default
} from "sequelize-typescript";
import Campaign from "./campaign.relational";
import CampaignField from "./campaign-field.relational";

var randomstring = require("randomstring");

@Table({
	timestamps: false,
	paranoid: false,
	charset: "utf8",
	collate: "utf8_unicode_ci",
	tableName: "users"
})
export default class User extends Model<User> {
	@IsInt
	@PrimaryKey
	@AutoIncrement
	@AllowNull(false)
	@Column
	id: number;

	@AllowNull(false)
	@Column
	firstName: string;

	@AllowNull(false)
	@Column
	lastName: string;

	@Unique
	@AllowNull(false)
	@Column
	email: string;

	@AllowNull(false)
	@Column
	password: string;

	@Column
	authToken: string;

	@AllowNull(false)
	@Default(() => randomstring.generate(16))
	@Column
	apiKey: string;

	async getFlatCampaigns() {
		// Get all the campaigns
		let campaigns: Campaign[] = await Campaign.findAll({
			where: {
				ownerUserId: this.id
			},
			include: [CampaignField]
		});

		return campaigns.map((campaign: Campaign) => {
			let res = campaign._toJSON();
			res.fields = campaign.campaignFields.map((field: CampaignField) => field._toJSON());
			return res;
		});
	}

	_toJSON(params?: {
		requestingUser?: User
	}): any {
		let res: any = {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email
		};

		if (params) {
			if (params.requestingUser && params.requestingUser.id == this.id) {
				res.apiKey = this.apiKey;
			}
		}

		return res;
	}
}
