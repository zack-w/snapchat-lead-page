import { Sequelize } from "sequelize-typescript";
import * as path from "path";
import * as url from "url";

var parse = require('pg-connection-string').parse;

let sequelize;

if (process.env.DATABASE_URL !== undefined) {
	var config = parse(process.env.DATABASE_URL);

	let databaseConfig: any = {
		host: config.host,
		port: parseInt(config.port),
		username: config.user,
		password: config.password,
		database: config.database,
		logging: true,
		dialect: "postgres",
		modelPaths: [__dirname + '/../../models'],
		dialectOptions: {
			ssl: { require: true }
		}
	};

	sequelize = new Sequelize(databaseConfig);

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
