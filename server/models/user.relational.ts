import {
	Table,
	Model,
	Column,
	IsInt,
	PrimaryKey,
	Unique,
	AutoIncrement,
	AllowNull,
	HasMany
} from "sequelize-typescript";

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

	@Unique
	@AllowNull(false)
	@Column
	firstName: string;

	@Unique
	@AllowNull(false)
	@Column
	lastName: string;

	@Unique
	@AllowNull(false)
	@Column
	email: string;

	@Unique
	@AllowNull(false)
	@Column
	password: string;

	_toJSON(): any {
		return {
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email
		};
	}
}
