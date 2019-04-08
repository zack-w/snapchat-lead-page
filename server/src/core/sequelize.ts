import { Sequelize } from "sequelize-typescript";
import * as path from "path";
import * as url from "url";

let sequelize;

if (process.env.DATABASE_URL !== undefined) {
	sequelize = new Sequelize(process.env.DATABASE_URL);

	//@ts-ignore
	sequelize.authenticate()
		.then(() => {
			console.log('Connection has been established successfully.');
		})
		.catch(() => {
			console.error('Unable to connect to the database:');
		});
} else {
	throw Error("no posgres database information provided");
}

export default sequelize;
